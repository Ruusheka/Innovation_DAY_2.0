import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canViewLeaderboard } from '@/lib/permissions';

// ============================================================
// GET /api/admin/leaderboard
// Returns live vote counts grouped by project.
// Requires: authenticated admin (VIEWER role or above)
// ============================================================
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canViewLeaderboard(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();

    // Query from the leaderboard view
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*');

    if (error) {
      console.error('[admin/leaderboard] DB error:', error.message);
      return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
    }

    // Also return total vote count
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true });

    return NextResponse.json({
      data,
      totalVotes: totalVotes ?? 0,
    });
  } catch (err) {
    console.error('[admin/leaderboard] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
