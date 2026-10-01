import { createBrowserClient } from '@supabase/ssr';

// ============================================================
// Supabase browser client (uses anon key, safe for client)
// ============================================================
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
