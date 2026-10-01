import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canManageProjects } from '@/lib/permissions';

// ============================================================
// PATCH /api/admin/projects/[id]/status
// Activate or deactivate a project (soft delete)
// ============================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageProjects(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (typeof body?.is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active (boolean) is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if project has votes (warn but allow)
    const { count: voteCount } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', id);

    const { data, error } = await supabase
      .from('projects')
      .update({ is_active: body.is_active })
      .eq('id', id)
      .select('id, project_id, title, is_active')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Project not found or update failed' }, { status: 404 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: body.is_active ? 'REOPEN_PROJECT' : 'DEACTIVATE_PROJECT',
      target_type: 'project',
      target_id: id,
      metadata: {
        project_id: data.project_id,
        title: data.title,
        had_votes: (voteCount ?? 0) > 0,
        vote_count: voteCount ?? 0,
      },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[admin/projects/[id]/status] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
