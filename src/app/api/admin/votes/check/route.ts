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

    const supabase = createServiceClient();

    // Check directly in the votes table
    const { data: existingVote, error } = await supabase
      .from('votes')
      .select('id, student_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) {
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
