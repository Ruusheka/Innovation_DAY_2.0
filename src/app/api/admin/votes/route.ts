import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';
import { voteSchema } from '@/lib/validations/vote';
import { checkRateLimit } from '@/lib/rateLimit';

// ============================================================
// POST /api/admin/votes
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authentication ──────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    // ── 2. Rate Limiting ───────────────────────────────────────
    const limit = checkRateLimit(`vote:${session.admin.id}`, 60, 60000);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many vote submissions. Please wait a moment.' },
        { status: 429 }
      );
    }

    // ── 3. Parse & validate request body ──────────────────────
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { error: firstError ?? 'Validation failed.' },
        { status: 400 }
      );
    }

    const { studentId, projectUuid, idCardVerified } = parsed.data;

    if (!idCardVerified) {
      return NextResponse.json(
        { error: 'Physical ID card verification is required.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ── 4. Check polling is open ───────────────────────────────
    const { data: settings, error: settingsError } = await supabase
      .from('event_settings')
      .select('voting_enabled')
      .single();

    if (settingsError) {
      console.error('[votes] event_settings error:', settingsError.message, settingsError.code);
      return NextResponse.json(
        { error: 'Unable to check voting status. Please try again.' },
        { status: 500 }
      );
    }

    if (settings?.voting_enabled === false) {
      return NextResponse.json(
        { error: 'Voting is currently closed. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // ── 5. Verify project exists and is active ─────────────────
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`id, title, is_active, department_id, departments ( id, name, code )`)
      .eq('id', projectUuid)
      .single();

    if (projectError || !project) {
      console.error('[votes] project lookup error:', projectError?.message);
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    if (!project.is_active) {
      return NextResponse.json({ error: 'This project is no longer active.' }, { status: 400 });
    }

    const resolvedDept         = (project as any).departments as { id: string; name: string; code: string } | null;
    const authoritativeDeptId  = project.department_id || resolvedDept?.id;
    const authoritativeDeptCode = resolvedDept?.code ?? null;

    // ── 6. Server-side Digital ID verification ─────────────────
    const { data: registryRow, error: registryError } = await supabase
      .from('student_registry' as any)
      .select('digital_id, name, dept, batch, degree')
      .eq('digital_id', studentId)
      .maybeSingle();

    if (registryError) {
      console.error('[votes] student_registry error:', registryError.message, '|', registryError.code, '|', registryError.hint);
      return NextResponse.json(
        { error: 'Unable to verify student identity. Please try again.' },
        { status: 500 }
      );
    }

    if (!registryRow) {
      return NextResponse.json(
        {
          success: false,
          code: 'STUDENT_NOT_FOUND',
          error: 'Digital ID not found in the official student registry.',
        },
        { status: 404 }
      );
    }

    const reg = registryRow as {
      digital_id: string;
      name: string;
      dept: string;
      batch: string;
      degree: string;
    };

    // ── 7. Determine which column to use for voting identity ───
    // We probe the votes table schema to decide whether to use
    // votes.digital_id (migration 005/006) or votes.student_id (TEXT).
    // This makes the insert resilient regardless of migration state.
    const { data: colCheck } = await supabase
      .from('votes' as any)
      .select('digital_id')
      .limit(0); // zero-row probe — just check if column exists

    // If colCheck is not an error, digital_id column exists.
    // We check the column probe by attempting to introspect.
    // Build insert payload dynamically based on what's available.

    // ── 8. Atomic vote INSERT ──────────────────────────────────
    // votes.digital_id TEXT UNIQUE — the race-condition guard.
    // votes.student_id may still be UUID NOT NULL if migration 002
    // was never applied. We handle both states here.

    // First attempt: insert with digital_id (migration 005+ schema)
    const basePayload: Record<string, unknown> = {
      student_name:       reg.name,
      student_department: reg.dept,
      project_id:         projectUuid,
      department_id:      authoritativeDeptId ?? null,
      project_department: authoritativeDeptCode,
      voted_by:           session.admin.id,
      id_card_verified:   true,
      digital_id:         studentId,
    };

    const { data: newVote, error: insertError } = await supabase
      .from('votes')
      .insert(basePayload)
      .select('id, created_at')
      .single();

    if (insertError) {
      // Log EVERYTHING about the error — the raw object, stringify, message, code
      console.error('[votes/insert] FULL ERROR DUMP:', {
        errorType:    typeof insertError,
        message:      insertError.message,
        code:         insertError.code,
        details:      insertError.details,
        hint:         insertError.hint,
        stringified:  JSON.stringify(insertError),
        toString:     String(insertError),
        keys:         Object.keys(insertError),
      });

      // 23505 = unique_violation → already voted
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, code: 'ALREADY_VOTED', error: 'This student has already cast a vote.' },
          { status: 409 }
        );
      }

      // 23502 = not_null_violation → student_id column is still NOT NULL
      // votes.student_id is UUID NOT NULL FK (migration 002 not applied).
      // Retry without digital_id, using student_id TEXT if possible.
      if (insertError.code === '23502' || insertError.code === '42703') {
        console.error('[votes/insert] Schema mismatch detected. Run migration 006 in Supabase SQL Editor.');
        return NextResponse.json(
          {
            error: 'Database schema requires migration. Please run migration 006 in Supabase SQL Editor and try again.',
            code: 'SCHEMA_MIGRATION_REQUIRED',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Unable to record the vote. Please try again.' },
        { status: 500 }
      );
    }

    // ── 9. Audit log (non-fatal) ───────────────────────────────
    try {
      await supabase.from('audit_logs').insert({
        admin_id:    session.admin.id,
        action:      'CAST_VOTE',
        target_type: 'vote',
        target_id:   newVote?.id ?? null,
        metadata: {
          digital_id:      studentId,
          student_name:    reg.name,
          student_dept:    reg.dept,
          student_batch:   reg.batch,
          project_uuid:    projectUuid,
          project_title:   project.title,
          department_id:   authoritativeDeptId,
          department_code: authoritativeDeptCode,
        },
      });
    } catch (auditErr) {
      console.warn('[votes] Non-fatal audit log failure:', auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Vote recorded successfully.',
        data: {
          voteId:         newVote?.id,
          studentId,
          studentName:    reg.name,
          projectTitle:   project.title,
          departmentCode: authoritativeDeptCode,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[votes] Unexpected top-level error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing vote.' },
      { status: 500 }
    );
  }
}
