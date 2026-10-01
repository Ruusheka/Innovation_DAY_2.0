import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from './getAdminUser';
import type { AdminUser } from '@/types';

// ============================================================
// Returns the authenticated admin user (session + DB record),
// or null if not authenticated or not an admin.
// Use this at the top of every protected Route Handler.
// ============================================================
export async function getSession(): Promise<{
  authUserId: string;
  admin: AdminUser;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const admin = await getAdminUser(user.id);
  if (!admin) return null;

  return { authUserId: user.id, admin };
}
