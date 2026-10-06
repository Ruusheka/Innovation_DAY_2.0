import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rateLimit';

// ============================================================
// GET /api/admin/votes/check?studentId=...
// Quick vote-status check. The primary check is the combined
// student lookup at /api/admin/students/[studentId].
// This endpoint is kept for backward compatibility.
//
// Checks votes.digital_id (migration 005 column).
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rl = checkRateLimit(`check:${session.admin.id}`, 120, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const digitalId = searchParams.get('studentId')?.trim();

    if (!digitalId || !/^\d{7,20}$/.test(digitalId)) {
      return NextResponse.json(
        { error: 'Invalid or missing Digital ID.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check 1: student_registry
    const { data: student, error: registryError } = await supabase
      .from('student_registry' as any)
      .select('digital_id')
      .eq('digital_id', digitalId)
      .maybeSingle();

    if (registryError) {
      console.error('[votes/check] student_registry error:', {
        code: registryError.code, message: registryError.message,
      });
      return NextResponse.json(
        { error: 'Unable to verify Digital ID.' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        { alreadyVoted: false, notInDirectory: true, message: 'Digital ID not in student registry.' },
        { status: 200 }
      );
    }

    // Check 2: votes.digital_id (migration 005 column)
    const { data: existingVote, error: voteError } = await supabase
      .from('votes')
      .select('id')
      .eq('digital_id', digitalId)
      .maybeSingle();

    if (voteError) {
      console.error('[votes/check] votes.digital_id error:', {
        code: voteError.code, message: voteError.message,
      });
      return NextResponse.json(
        { error: 'Unable to verify vote status.' },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { alreadyVoted: true, notInDirectory: false, message: 'This student has already voted.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { alreadyVoted: false, notInDirectory: false, message: 'Student eligible to vote.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[votes/check] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
