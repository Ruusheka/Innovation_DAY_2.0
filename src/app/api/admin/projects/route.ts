import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canManageProjects } from '@/lib/permissions';
import { projectSchema } from '@/lib/validations/project';

// ============================================================
// GET /api/admin/projects
// Returns ALL projects (active + inactive) for admin management
// ============================================================
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageProjects(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        departments (id, name, code)
      `)
      .order('project_id', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[admin/projects GET] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// POST /api/admin/projects
// Create a new project
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManageProjects(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
      .insert({
        ...parseResult.data,
        description: parseResult.data.description || null,
        image_url: parseResult.data.image_url || null,
      })
      .select(`*, departments(id, name, code)`)
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: `Project ID "${parseResult.data.project_id}" already exists.` },
          { status: 409 }
        );
      }
      console.error('[admin/projects POST] DB error:', error.message);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'CREATE_PROJECT',
      target_type: 'project',
      target_id: data.id,
      metadata: { project_id: data.project_id, title: data.title },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[admin/projects POST] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
