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

  // Fetch departments, total votes, and projects in parallel
  const [leaderboardRes, deptsRes, totalRes, projectsRes] = await Promise.all([
    supabase.from('leaderboard').select('*'),
    supabase.from('departments').select('*').eq('is_active', true).order('code'),
    supabase.from('votes').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id, project_id, image_url, team_members, project_supervisor, tags'),
  ]);

  const rawLeaderboard = (leaderboardRes.data ?? []) as LeaderboardRow[];
  const departments = (deptsRes.data ?? []) as Department[];
  const totalVotes = totalRes.count ?? 0;

  const projectMetaMap = new Map<string, { image_url?: string; team_members?: string[]; project_supervisor?: string | null; tags?: string[] }>();
  (projectsRes.data ?? []).forEach((p: any) => {
    projectMetaMap.set(p.id, {
      image_url: p.image_url || undefined,
      team_members: p.team_members || [],
      project_supervisor: p.project_supervisor || null,
      tags: p.tags || [],
    });
    projectMetaMap.set(p.project_id, {
      image_url: p.image_url || undefined,
      team_members: p.team_members || [],
      project_supervisor: p.project_supervisor || null,
      tags: p.tags || [],
    });
  });

  const enrichedLeaderboard: LeaderboardRow[] = rawLeaderboard.map((row) => {
    const meta = projectMetaMap.get(row.project_uuid) || projectMetaMap.get(row.project_id);
    return {
      ...row,
      image_url: row.image_url || meta?.image_url || undefined,
      team_members: row.team_members || meta?.team_members || [],
      project_supervisor: row.project_supervisor || meta?.project_supervisor || null,
      tags: row.tags || meta?.tags || [],
    };
  });

  // Sort deterministically: vote_count DESC, project_id ASC
  enrichedLeaderboard.sort((a, b) => {
    if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
    return a.project_id.localeCompare(b.project_id, undefined, { numeric: true });
  });

  return (
    <div className="font-primary">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#041128] tracking-tight m-0">
          PROJECT LEADERBOARD
        </h1>
        <p className="text-[#5277A8] text-sm sm:text-base mt-2 font-normal">
          Current exhibition voting standings &amp; podium tally
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
