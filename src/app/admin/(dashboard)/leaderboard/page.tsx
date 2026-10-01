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
        <p className="text-red-600 font-medium">You do not have permission to view the leaderboard.</p>
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
        <h1 className="text-3xl sm:text-4xl font-bold text-[#041128] tracking-tight">
          LIVE LEADERBOARD
        </h1>
        <p className="text-[#41516B] text-base mt-1.5">
          Real-time vote counts across projects. Updates automatically as votes are recorded.
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
