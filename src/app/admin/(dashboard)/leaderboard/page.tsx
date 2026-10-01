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
      <div className="flex items-center justify-center h-64 font-primary">
        <p className="text-red-600 font-normal">You do not have permission to view the leaderboard.</p>
      </div>
    );
  }

  const supabase = createServiceClient();

  // Fetch leaderboard, departments, total votes, and project thumbnails in parallel
  const [leaderboardRes, deptsRes, totalRes, projectsRes] = await Promise.all([
    supabase.from('leaderboard').select('*'),
    supabase.from('departments').select('*').eq('is_active', true).order('code'),
    supabase.from('votes').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id, project_id, image_url'),
  ]);

  const rawLeaderboard = (leaderboardRes.data ?? []) as LeaderboardRow[];
  const departments = (deptsRes.data ?? []) as Department[];
  const totalVotes = totalRes.count ?? 0;
  const projectImages = new Map<string, string>();
  (projectsRes.data ?? []).forEach((p: any) => {
    if (p.image_url) {
      projectImages.set(p.id, p.image_url);
      projectImages.set(p.project_id, p.image_url);
    }
  });

  const enrichedLeaderboard = rawLeaderboard.map((row) => ({
    ...row,
    image_url: projectImages.get(row.project_uuid) || projectImages.get(row.project_id) || undefined,
  }));

  return (
    <div className="font-primary">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#041128] tracking-tight m-0">
          PROJECT LEADERBOARD
        </h1>
        <p className="text-[#5277A8] text-sm sm:text-base mt-2 font-normal">
          Current voting standings
        </p>
      </div>

      <LeaderboardTable
        initialData={enrichedLeaderboard}
        totalVotes={totalVotes}
        departments={departments}
      />
    </div>
  );
}
