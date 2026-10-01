import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';

// ============================================================
// GET /api/admin/votes/check?studentId=...
// Checks directly in the `votes` table if the student has already voted.
// NO students table is checked or required.
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId')?.trim();

    if (!studentId) {
      return NextResponse.json({ error: 'Please enter a Student ID.' }, { status: 400 });
    }

    // Require exactly 6 digits
    if (!/^\d{6}$/.test(studentId)) {
      return NextResponse.json({ error: 'Student ID must be exactly 6 digits.' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Try querying votes table directly
    const { data: existingVote, error } = await supabase
      .from('votes')
      .select('id, student_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
      // If error code is 22P02, votes.student_id in Postgres is a UUID foreign key to students.id
      if (error.code === '22P02' || error.message?.includes('uuid')) {
        // Look up student in students table first
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('student_id', studentId)
          .maybeSingle();

        if (studentError) {
          console.error('[votes/check] Error looking up student:', studentError.message);
          return NextResponse.json({ error: 'Unable to verify Student ID.' }, { status: 500 });
        }

        // If student does not exist in students table, they have NEVER voted before!
        if (!student) {
          return NextResponse.json(
            {
              alreadyVoted: false,
              message: 'Student ID available',
            },
            { status: 200 }
          );
        }

        // If student exists, check if they have cast a vote in votes table
        const { data: voteRecord, error: voteRecordError } = await supabase
          .from('votes')
          .select('id')
          .eq('student_id', student.id)
          .maybeSingle();

        if (voteRecordError) {
          console.error('[votes/check] Error checking vote record:', voteRecordError.message);
          return NextResponse.json({ error: 'Unable to verify Student ID.' }, { status: 500 });
        }

        if (voteRecord) {
          return NextResponse.json(
            {
              alreadyVoted: true,
              message: 'This Student ID has already cast a vote.',
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          {
            alreadyVoted: false,
            message: 'Student ID available',
          },
          { status: 200 }
        );
      }

      console.error('[votes/check] Database error:', error.message);
      return NextResponse.json({ error: 'Unable to verify Student ID. Please try again.' }, { status: 500 });
    }

    if (existingVote) {
      return NextResponse.json(
        {
          alreadyVoted: true,
          message: 'This Student ID has already cast a vote.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        alreadyVoted: false,
        message: 'Student ID available',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('[votes/check] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
