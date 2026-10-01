import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canToggleVoting, isSuperAdmin } from '@/lib/permissions';

// ============================================================
// PATCH /api/admin/settings
// SUPER_ADMIN role only — toggle voting on/off
// Access gated by role (canToggleVoting) not by email.
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!canToggleVoting(session.admin.role, session.admin.email)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the designated Superadmin (ruushekas@gmail.com) can open or close voting.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (typeof body?.voting_enabled !== 'boolean') {
      return NextResponse.json({ error: 'voting_enabled (boolean) is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Update the single event_settings row
    const { data, error } = await supabase
      .from('event_settings')
      .update({ voting_enabled: body.voting_enabled })
      .order('created_at', { ascending: true })
      .limit(1)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: body.voting_enabled ? 'VOTING_ENABLED' : 'VOTING_DISABLED',
      target_type: 'event_settings',
      metadata: { voting_enabled: body.voting_enabled, modified_by: session.admin.email },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[admin/settings] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// GET /api/admin/settings
// ============================================================
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('event_settings')
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        ...data,
        isSuperAdmin: isSuperAdmin(session.admin.role),
        canToggleVoting: canToggleVoting(session.admin.role, session.admin.email),
        adminEmail: session.admin.email,
      },
    });
  } catch (err) {
    console.error('[admin/settings GET] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
