import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canManageProjects } from '@/lib/permissions';
import { projectSchema } from '@/lib/validations/project';

// ============================================================
// PATCH /api/admin/projects/[id]
// Update a project
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
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const parseResult = projectSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...parseResult.data,
        description: parseResult.data.description || null,
        image_url: parseResult.data.image_url || null,
      })
      .eq('id', id)
      .select(`*, departments(id, name, code)`)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Project ID "${parseResult.data.project_id}" already exists.` },
          { status: 409 }
        );
      }
      console.error('[admin/projects/[id] PATCH] DB error:', error.message);
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'EDIT_PROJECT',
      target_type: 'project',
      target_id: id,
      metadata: { project_id: data.project_id, title: data.title },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[admin/projects/[id] PATCH] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/admin/projects/[id]
// Safely delete a project if it has no votes
// ============================================================
export async function DELETE(
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
    const supabase = createServiceClient();

    // Check if the project has existing votes
    const { count: voteCount, error: voteCountError } = await supabase
      .from('votes')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', id);

    if (voteCountError) {
      console.error('[admin/projects/[id] DELETE] Check votes error:', voteCountError.message);
    }

    if (voteCount && voteCount > 0) {
      return NextResponse.json(
        { error: 'This project already has votes and cannot be deleted. You can deactivate it instead.' },
        { status: 400 }
      );
    }

    // Safely delete the project
    const { data: deletedProject, error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .select('id, project_id, title, image_url')
      .single();

    if (deleteError) {
      console.error('[admin/projects/[id] DELETE] error:', deleteError.message);
      return NextResponse.json({ error: 'Failed to delete project.' }, { status: 500 });
    }

    // Optional: remove image from storage if stored in project-images
    if (deletedProject?.image_url && deletedProject.image_url.includes('project-images')) {
      const parts = deletedProject.image_url.split('/');
      const fileName = parts[parts.length - 1];
      if (fileName) {
        supabase.storage.from('project-images').remove([fileName]).then(() => {});
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'DELETE_PROJECT',
      target_type: 'project',
      target_id: id,
      metadata: { project_id: deletedProject?.project_id, title: deletedProject?.title },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    console.error('[admin/projects/[id] DELETE] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
