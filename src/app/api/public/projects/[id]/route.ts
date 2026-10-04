import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/public/projects/[id]
// Returns a single active project by project_id (e.g. "P001")
// No auth required. Does NOT return vote counts.
// ============================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
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
      .eq('project_id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const normalised = {
      ...data,
      team_members: Array.isArray(data.team_members) ? data.team_members : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      department: (data as any).departments ?? (data as any).department ?? undefined,
    };

    return NextResponse.json({ data: normalised });
  } catch (err) {
    console.error('[public/projects/[id]] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
