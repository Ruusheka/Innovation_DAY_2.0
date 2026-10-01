import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';
import { voteSchema } from '@/lib/validations/vote';
import { PostgrestError } from '@supabase/supabase-js';

// ============================================================
// POST /api/admin/votes
// Cast a vote. ALL validation happens server-side.
// Duplicate protection: PostgreSQL UNIQUE(student_id) on votes table
// This means even concurrent requests are safe — DB rejects duplicates
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authentication ─────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient role' }, { status: 403 });
    }

    // ── 2. Parse & validate request body ─────────────────────
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = voteSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { studentId, projectUuid, departmentUuid, idCardVerified } = parseResult.data;

    if (!idCardVerified) {
      return NextResponse.json(
        { error: 'ID card must be verified before casting a vote.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ── 3. Check voting is enabled ────────────────────────────
    const { data: settings } = await supabase
      .from('event_settings')
      .select('voting_enabled')
      .single();

    if (!settings?.voting_enabled) {
      return NextResponse.json(
        { error: 'Voting is currently closed. Contact the event organizer.' },
        { status: 403 }
      );
    }

    // ── 4. Verify student exists and is active ────────────────
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, is_active, student_id')
      .eq('student_id', studentId.trim())
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found. Please verify the student ID.' },
        { status: 404 }
      );
    }

    if (!student.is_active) {
      return NextResponse.json(
        { error: 'This student account is inactive.' },
        { status: 403 }
      );
    }

    // ── 5. Verify department exists ───────────────────────────
    const { data: department, error: deptError } = await supabase
      .from('departments')
      .select('id, name, is_active')
      .eq('id', departmentUuid)
      .single();

    if (deptError || !department || !department.is_active) {
      return NextResponse.json(
        { error: 'Invalid or inactive department.' },
        { status: 400 }
      );
    }

    // ── 6. Verify project exists, is active, and belongs to dept ─
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

    if (project.department_id !== departmentUuid) {
      return NextResponse.json(
        { error: 'Project does not belong to the selected department.' },
        { status: 400 }
      );
    }

    // ── 7. Pre-flight duplicate check (informational, NOT the safety net) ─
    // The real safety is the UNIQUE constraint on votes.student_id
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('student_id', student.id)
      .single();

    if (existingVote) {
      // Log the duplicate attempt
      await supabase.from('audit_logs').insert({
        admin_id: session.admin.id,
        action: 'DUPLICATE_VOTE_ATTEMPT',
        target_type: 'student',
        target_id: student.student_id,
        metadata: {
          attempted_project_id: projectUuid,
          student_name: student.name,
        },
      });

      return NextResponse.json(
        { error: 'THIS STUDENT HAS ALREADY VOTED.' },
        { status: 409 }
      );
    }

    // ── 8. INSERT VOTE ATOMICALLY ─────────────────────────────
    // The UNIQUE(student_id) constraint on votes guarantees that
    // even if two concurrent requests pass the pre-flight check,
    // only ONE will succeed at the DB level.
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        student_id: student.id,
        project_id: projectUuid,
        voted_by: session.admin.id,
        id_card_verified: idCardVerified,
        verified_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    // Handle unique constraint violation (concurrent duplicate)
    if (voteError) {
      const pgError = voteError as PostgrestError;
      if (pgError.code === '23505') {
        // PostgreSQL unique_violation
        await supabase.from('audit_logs').insert({
          admin_id: session.admin.id,
          action: 'DUPLICATE_VOTE_ATTEMPT',
          target_type: 'student',
          target_id: student.student_id,
          metadata: { reason: 'concurrent_duplicate', attempted_project_id: projectUuid },
        });

        return NextResponse.json(
          { error: 'THIS STUDENT HAS ALREADY VOTED.' },
          { status: 409 }
        );
      }

      console.error('[admin/votes] DB insert error:', voteError.message);
      return NextResponse.json(
        { error: 'Failed to record vote. Please try again.' },
        { status: 500 }
      );
    }

    // ── 9. Audit log — successful vote ───────────────────────
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'CAST_VOTE',
      target_type: 'vote',
      target_id: vote!.id,
      metadata: {
        student_id: student.student_id,
        student_name: student.name,
        project_id: projectUuid,
        project_title: project.title,
        department_id: departmentUuid,
      },
    });

    return NextResponse.json({
      data: { message: 'Vote recorded successfully.', voteId: vote!.id },
    }, { status: 201 });

  } catch (err) {
    console.error('[admin/votes] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
