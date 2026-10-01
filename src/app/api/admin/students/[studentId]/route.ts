import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';

// ============================================================
// GET /api/admin/students/[studentId]
// Look up a student by their text student_id (e.g. "3122245001127")
// Requires: authenticated admin with ADMIN role or above
// Returns: student info + hasVoted flag
// Does NOT reveal which project they voted for (unless SUPER_ADMIN)
// ============================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { studentId } = await params;
    if (!studentId || studentId.trim().length === 0) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 2. Find the student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        student_id,
        name,
        is_active,
        department_id,
        departments (
          id,
          name,
          code
        )
      `)
      .eq('student_id', studentId.trim())
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { error: 'No student found with this ID. Please verify the student ID.' },
        { status: 404 }
      );
    }

    if (!student.is_active) {
      return NextResponse.json(
        { error: 'This student account is inactive.' },
        { status: 403 }
      );
    }

    // 3. Check if already voted (do NOT reveal project choice to regular admins)
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('student_id', student.id)
      .single();

    const hasVoted = !!existingVote;

    return NextResponse.json({
      data: {
        student,
        hasVoted,
      },
    });
  } catch (err) {
    console.error('[admin/students/[studentId]] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
