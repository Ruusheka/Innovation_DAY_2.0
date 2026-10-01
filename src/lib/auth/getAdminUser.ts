import { createServiceClient } from '@/lib/supabase/server';
import { type AdminUser } from '@/types';

// ============================================================
// Get admin_users record from the database for the given
// Supabase auth user ID. Used in every server-side auth check.
// ============================================================
export async function getAdminUser(authUserId: string): Promise<AdminUser | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  return data as AdminUser;
}
