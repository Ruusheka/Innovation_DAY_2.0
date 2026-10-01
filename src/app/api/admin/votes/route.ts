import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';
import { voteSchema } from '@/lib/validations/vote';

// ============================================================
// POST /api/admin/votes
// Cast a vote without any student database dependency.
// Enforces duplicate vote protection via PostgreSQL UNIQUE(student_id)
// on the votes table. Concurrency-safe against race conditions.
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authentication ─────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    // ── 2. Parse & validate request body ─────────────────────
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const parseResult = voteSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = Object.values(parseResult.error.flatten().fieldErrors)[0]?.[0];
      return NextResponse.json(
        { error: firstError ?? 'Validation failed.' },
        { status: 400 }
      );
    }

    const {
      studentId,
      studentName,
      studentDepartment,
      projectDepartment,
      projectUuid,
      idCardVerified,
    } = parseResult.data;

    if (!idCardVerified) {
      return NextResponse.json(
        { error: 'Physical ID card verification is required.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ── 3. Check voting is enabled in event settings ───────────
    const { data: settings } = await supabase
      .from('event_settings')
      .select('voting_enabled')
      .single();

    if (settings && settings.voting_enabled === false) {
      return NextResponse.json(
        { error: 'Voting is currently closed. Please contact the administrator.' },
        { status: 403 }
      );
    }

    // ── 4. Verify project exists and is active ────────────────
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, is_active, department_id')
      .eq('id', projectUuid)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found.' },
        { status: 404 }
      );
    }

    if (!project.is_active) {
      return NextResponse.json(
        { error: 'This project is no longer active.' },
        { status: 400 }
      );
    }

    // ── 5. Insert vote into votes table ───────────────────────
    // Database UNIQUE(student_id) constraint guarantees concurrency protection
    const { data: newVote, error: insertError } = await supabase
      .from('votes')
      .insert({
        student_id: studentId.trim(),
        student_name: studentName.trim(),
        student_department: studentDepartment.trim(),
        project_id: projectUuid,
        project_department: projectDepartment.trim(),
        voted_by: session.admin.id,
        id_card_verified: true,
      })
      .select('id, student_id, created_at')
      .single();

    if (insertError) {
      // 23505 is PostgreSQL unique_violation code
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            code: 'ALREADY_VOTED',
            error: 'This Student ID has already voted.',
          },
          { status: 409 }
        );
      }

      console.error('[votes/insert] Database error:', insertError);
      return NextResponse.json(
        { error: 'Unable to record the vote. Please try again.' },
        { status: 500 }
      );
    }

    // ── 6. Log audit record (safe) ───────────────────────────
    try {
      await supabase.from('audit_logs').insert({
        admin_id: session.admin.id,
        action: 'CAST_VOTE',
        target_type: 'vote',
        target_id: newVote?.id ?? null,
        metadata: {
          student_id: studentId.trim(),
          project_uuid: projectUuid,
          project_title: project.title,
          student_department: studentDepartment.trim(),
        },
      });
    } catch (auditErr) {
      console.warn('[audit_log] Non-fatal log failure:', auditErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Vote recorded successfully.',
        data: {
          voteId: newVote?.id,
          studentId: studentId.trim(),
          projectTitle: project.title,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[votes] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error while processing vote.' },
      { status: 500 }
    );
  }
}
