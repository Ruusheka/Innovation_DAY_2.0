import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/public/projects?department=<uuid>
// Returns active projects (optionally filtered by department)
// No auth required. Does NOT return vote counts.
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('department');

    const supabase = await createClient();

    let query = supabase
      .from('projects')
      .select(`
        id,
        project_id,
        title,
        description,
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
      .eq('is_active', true)
      .order('project_id', { ascending: true });

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[public/projects] DB error:', error.message);
      return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
    }

    const normalised = (data ?? []).map((p: any) => ({
      ...p,
      team_members: Array.isArray(p.team_members) ? p.team_members : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      department: p.departments ?? p.department ?? undefined,
    }));

    return NextResponse.json({ data: normalised });
  } catch (err) {
    console.error('[public/projects] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
