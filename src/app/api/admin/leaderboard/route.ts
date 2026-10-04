import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canViewLeaderboard } from '@/lib/permissions';
import type { LeaderboardRow } from '@/types';

// ============================================================
// GET /api/admin/leaderboard
// Returns live authoritative vote counts grouped by project.
// Deterministic ranking: vote_count DESC, project_id ASC.
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

    // Query authoritative leaderboard view
    const { data: viewData, error: viewError } = await supabase
      .from('leaderboard')
      .select('*')
      .order('vote_count', { ascending: false });

    // Total exact vote count
    const { count: totalVotes } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true });

    if (!viewError && viewData) {
      // Deterministic client/server secondary sort
      const sorted = [...viewData].sort((a: LeaderboardRow, b: LeaderboardRow) => {
        if (b.vote_count !== a.vote_count) {
          return b.vote_count - a.vote_count;
        }
        return a.project_id.localeCompare(b.project_id, undefined, { numeric: true });
      });

      return NextResponse.json({
        data: sorted,
        totalVotes: totalVotes ?? 0,
      });
    }

    // Direct aggregation fallback if view is ever pending migration
    console.warn('[admin/leaderboard] Falling back to direct aggregation:', viewError?.message);

    const [projectsRes, votesRes] = await Promise.all([
      supabase
        .from('projects')
        .select(`
          id,
          project_id,
          title,
          project_lead,
          team_members,
          project_supervisor,
          tags,
          image_url,
          department_id,
          departments (
            id,
            name,
            code,
            color,
            accent_color
          )
        `)
        .eq('is_active', true),
      supabase
        .from('votes')
        .select('project_id'),
    ]);

    if (projectsRes.error) {
      return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
    }

    // Tally votes per project
    const voteMap = new Map<string, number>();
    (votesRes.data ?? []).forEach((v: { project_id: string }) => {
      voteMap.set(v.project_id, (voteMap.get(v.project_id) || 0) + 1);
    });

    const directRows: LeaderboardRow[] = (projectsRes.data ?? []).map((p: any) => {
      const dept = p.departments || p.department;
      return {
        project_uuid: p.id,
        project_id: p.project_id,
        title: p.title,
        project_lead: p.project_lead,
        team_members: p.team_members ?? [],
        project_supervisor: p.project_supervisor ?? null,
        tags: p.tags ?? [],
        image_url: p.image_url ?? null,
        department_uuid: dept?.id ?? p.department_id,
        department_name: dept?.name ?? 'General',
        department_code: dept?.code ?? 'GEN',
        department_color: dept?.color ?? null,
        department_accent_color: dept?.accent_color ?? null,
        vote_count: voteMap.get(p.id) || 0,
        dept_rank: 0,
        overall_rank: 0,
      };
    });

    // Deterministic ranking
    directRows.sort((a, b) => {
      if (b.vote_count !== a.vote_count) return b.vote_count - a.vote_count;
      return a.project_id.localeCompare(b.project_id, undefined, { numeric: true });
    });

    directRows.forEach((row, i) => {
      row.overall_rank = i + 1;
    });

    return NextResponse.json({
      data: directRows,
      totalVotes: totalVotes ?? 0,
    });
  } catch (err) {
    console.error('[admin/leaderboard] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
