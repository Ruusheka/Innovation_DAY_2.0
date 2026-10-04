// import { NextRequest, NextResponse } from 'next/server';
// import { createServiceClient } from '@/lib/supabase/server';
// import { getSession } from '@/lib/auth/getSession';
// import { canToggleVoting, isSuperAdmin } from '@/lib/permissions';

// // ============================================================
// // PATCH /api/admin/settings
// // SUPER_ADMIN role only — toggle voting on/off
// // Access gated by role (canToggleVoting) not by email.
// // ============================================================
// export async function PATCH(request: NextRequest) {
//   try {
//     const session = await getSession();
//     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     if (!canToggleVoting(session.admin.role, session.admin.email)) {
//       return NextResponse.json(
//         { error: 'Forbidden: Only the designated Superadmin (ruushekas@gmail.com) can open or close voting.' },
//         { status: 403 }
//       );
//     }

//     const body = await request.json().catch(() => null);
//     if (typeof body?.voting_enabled !== 'boolean') {
//       return NextResponse.json({ error: 'voting_enabled (boolean) is required' }, { status: 400 });
//     }

//     const supabase = createServiceClient();

//     // Update the single event_settings row
//     const { data, error } = await supabase
//       .from('event_settings')
//       .update({ voting_enabled: body.voting_enabled })
//       .order('created_at', { ascending: true })
//       .limit(1)
//       .select()
//       .single();

//     if (error) {
//       return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
//     }

//     // Audit log
//     await supabase.from('audit_logs').insert({
//       admin_id: session.admin.id,
//       action: body.voting_enabled ? 'VOTING_ENABLED' : 'VOTING_DISABLED',
//       target_type: 'event_settings',
//       metadata: { voting_enabled: body.voting_enabled, modified_by: session.admin.email },
//     });

//     return NextResponse.json({ data });
//   } catch (err) {
//     console.error('[admin/settings] error:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

// // ============================================================
// // GET /api/admin/settings
// // ============================================================
// export async function GET() {
//   try {
//     const session = await getSession();
//     if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

//     const supabase = createServiceClient();

//     const { data, error } = await supabase
//       .from('event_settings')
//       .select('*')
//       .single();

//     if (error) {
//       return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
//     }

//     return NextResponse.json({
//       data: {
//         ...data,
//         isSuperAdmin: isSuperAdmin(session.admin.role),
//         canToggleVoting: canToggleVoting(session.admin.role, session.admin.email),
//         adminEmail: session.admin.email,
//       },
//     });
//   } catch (err) {
//     console.error('[admin/settings GET] error:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canToggleVoting, isSuperAdmin } from '@/lib/permissions';

// ============================================================
// PATCH /api/admin/settings
// Toggle exhibition voting on/off.
//
// Authorization:
// - Unauthenticated users -> 401
// - Normal admins -> 403
// - Superadmins other than the designated account -> 403
// - ONLY ruushekas@gmail.com can toggle polling
//
// The permission check is performed SERVER-SIDE.
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    // ----------------------------------------------------------
    // 1. Authenticate the request
    // ----------------------------------------------------------
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // 2. Verify polling-toggle permission
    // ----------------------------------------------------------
    if (
      !canToggleVoting(
        session.admin.role,
        session.admin.email
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Forbidden: Only the designated Superadmin (ruushekas@gmail.com) can open or close voting.',
        },
        { status: 403 }
      );
    }

    // ----------------------------------------------------------
    // 3. Parse and validate request body
    // ----------------------------------------------------------
    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.voting_enabled !== 'boolean'
    ) {
      return NextResponse.json(
        {
          error:
            'voting_enabled (boolean) is required',
        },
        { status: 400 }
      );
    }

    const votingEnabled = body.voting_enabled;

    // ----------------------------------------------------------
    // 4. Create server-side Supabase client
    // ----------------------------------------------------------
    const supabase = createServiceClient();

    // ----------------------------------------------------------
    // 5. Find the existing event_settings row
    //
    // We do NOT perform:
    //
    // UPDATE -> ORDER -> LIMIT -> SINGLE
    //
    // because that was the problematic part of the previous
    // implementation.
    // ----------------------------------------------------------
    const {
      data: existingSettings,
      error: settingsFetchError,
    } = await supabase
      .from('event_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (settingsFetchError) {
      console.error(
        '[admin/settings PATCH] Failed to find event settings:',
        {
          message: settingsFetchError.message,
          code: settingsFetchError.code,
          details: settingsFetchError.details,
          hint: settingsFetchError.hint,
        }
      );

      return NextResponse.json(
        {
          error: 'Failed to load event settings',
        },
        { status: 500 }
      );
    }

    if (!existingSettings) {
      console.error(
        '[admin/settings PATCH] No event_settings row exists.'
      );

      return NextResponse.json(
        {
          error:
            'Event settings record was not found.',
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 6. Make sure the settings row has an ID
    // ----------------------------------------------------------
    if (!existingSettings.id) {
      console.error(
        '[admin/settings PATCH] event_settings row has no id:',
        existingSettings
      );

      return NextResponse.json(
        {
          error:
            'Event settings record has no valid ID.',
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 7. Update ONLY voting_enabled
    // ----------------------------------------------------------
    const {
      data: updatedSettings,
      error: updateError,
    } = await supabase
      .from('event_settings')
      .update({
        voting_enabled: votingEnabled,
      })
      .eq('id', existingSettings.id)
      .select('*')
      .single();

    if (updateError) {
      console.error(
        '[admin/settings PATCH] Supabase update failed:',
        {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        }
      );

      return NextResponse.json(
        {
          error: 'Failed to update settings',
        },
        { status: 500 }
      );
    }

    if (!updatedSettings) {
      console.error(
        '[admin/settings PATCH] Update succeeded but no settings row was returned.'
      );

      return NextResponse.json(
        {
          error:
            'Settings were not updated correctly.',
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 8. Audit log
    // ----------------------------------------------------------
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        admin_id: session.admin.id,
        action: votingEnabled
          ? 'VOTING_ENABLED'
          : 'VOTING_DISABLED',
        target_type: 'event_settings',
        metadata: {
          voting_enabled: votingEnabled,
          modified_by: session.admin.email,
        },
      });

    // Audit logging should not make an otherwise successful
    // polling update appear to have failed.
    if (auditError) {
      console.error(
        '[admin/settings PATCH] Audit log failed:',
        {
          message: auditError.message,
          code: auditError.code,
          details: auditError.details,
          hint: auditError.hint,
        }
      );
    }

    // ----------------------------------------------------------
    // 9. Return updated settings
    // ----------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        data: updatedSettings,
        voting_enabled:
          updatedSettings.voting_enabled,
      },
      { status: 200 }
    );
  } catch (err) {
    // ----------------------------------------------------------
    // 10. Unexpected server error
    // ----------------------------------------------------------
    console.error(
      '[admin/settings PATCH] Unexpected error:',
      err
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET /api/admin/settings
// ============================================================
export async function GET() {
  try {
    // ----------------------------------------------------------
    // 1. Authenticate
    // ----------------------------------------------------------
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ----------------------------------------------------------
    // 2. Server-side Supabase client
    // ----------------------------------------------------------
    const supabase = createServiceClient();

    // ----------------------------------------------------------
    // 3. Load the existing settings row
    // ----------------------------------------------------------
    const {
      data,
      error,
    } = await supabase
      .from('event_settings')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error(
        '[admin/settings GET] Failed to load settings:',
        {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        }
      );

      return NextResponse.json(
        {
          error: 'Failed to load settings',
        },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            'Event settings record was not found.',
        },
        { status: 500 }
      );
    }

    // ----------------------------------------------------------
    // 4. Return settings + permission information
    // ----------------------------------------------------------
    return NextResponse.json({
      data: {
        ...data,

        isSuperAdmin: isSuperAdmin(
          session.admin.role
        ),

        canToggleVoting: canToggleVoting(
          session.admin.role,
          session.admin.email
        ),

        adminEmail: session.admin.email,
      },
    });
  } catch (err) {
    console.error(
      '[admin/settings GET] Unexpected error:',
      err
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}