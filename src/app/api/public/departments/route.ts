import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================
// GET /api/public/departments
// Returns all active departments — no auth required
// ============================================================
export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code, color, accent_color')
      .eq('is_active', true)
      .order('code', { ascending: true });

    if (error) {
      console.error('[public/departments] DB error:', error.message);
      return NextResponse.json({ error: 'Failed to load departments' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[public/departments] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
