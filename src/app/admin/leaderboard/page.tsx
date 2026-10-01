import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canViewLeaderboard } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { LeaderboardTable } from '@/components/admin/LeaderboardTable';
import type { LeaderboardRow, Department } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminLeaderboardPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (!canViewLeaderboard(session.admin.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400">You do not have permission to view the leaderboard.</p>
      </div>
    );
  }

  const supabase = createServiceClient();

  // Fetch leaderboard and departments in parallel
  const [leaderboardRes, deptsRes, totalRes] = await Promise.all([
    supabase.from('leaderboard').select('*'),
    supabase.from('departments').select('*').eq('is_active', true).order('code'),
    supabase.from('votes').select('id', { count: 'exact', head: true }),
  ]);

  const leaderboardData = (leaderboardRes.data ?? []) as LeaderboardRow[];
  const departments = (deptsRes.data ?? []) as Department[];
  const totalVotes = totalRes.count ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Live Leaderboard</h1>
        <p className="text-[#848C9B] text-sm mt-1">
          Real-time vote counts. Updates automatically as votes are recorded.
        </p>
      </div>

      <LeaderboardTable
        initialData={leaderboardData}
        totalVotes={totalVotes}
        departments={departments}
      />
    </div>
  );
}
