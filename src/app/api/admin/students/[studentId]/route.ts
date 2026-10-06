import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canVote } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rateLimit';

// ============================================================
// GET /api/admin/students/[studentId]
// Server-side Digital ID lookup against student_registry.
//
// Two checks performed:
//   1. Does Digital ID exist in public.student_registry?
//   2. Has that Digital ID already cast a vote? (votes.digital_id)
//
// Returns:
//   { found, alreadyVoted, student? }
//
// NEVER returns 500 for business-logic cases (not found, already voted).
// 500 only for genuine DB/infrastructure failure.
// ============================================================
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!canVote(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── 2. Rate limit ────────────────────────────────────────
    const rl = checkRateLimit(`lookup:${session.admin.id}`, 120, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please slow down.' },
        { status: 429 }
      );
    }

    // ── 3. Validate format ───────────────────────────────────
    const { studentId: rawId } = await params;
    const digitalId = (rawId ?? '').trim();

    if (!digitalId) {
      return NextResponse.json(
        { found: false, alreadyVoted: false, error: 'Student Digital ID is required.' },
        { status: 400 }
      );
    }

    // Accept 7–20 digit IDs (handles leading-zero IDs)
    if (!/^\d{7,20}$/.test(digitalId)) {
      return NextResponse.json(
        {
          found: false,
          alreadyVoted: false,
          error: 'Invalid Digital ID format. Please check the ID.',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // ── CHECK 1: student_registry lookup ─────────────────────
    // Uses service_role key → bypasses anon/authenticated RLS.
    // student_registry.digital_id is the PRIMARY KEY (indexed).
    const { data: student, error: registryError } = await supabase
      .from('student_registry' as any)
      .select('digital_id, name, batch, degree, dept, email')
      .eq('digital_id', digitalId)
      .maybeSingle();

    if (registryError) {
      // Log full diagnostic server-side, return safe message to client
      console.error('[students/lookup] student_registry error:', {
        code:    registryError.code,
        message: registryError.message,
        details: registryError.details,
        hint:    registryError.hint,
      });
      return NextResponse.json(
        { error: 'Unable to verify Digital ID. Please try again.' },
        { status: 500 }
      );
    }

    if (!student) {
      return NextResponse.json(
        {
          found: false,
          alreadyVoted: false,
          message: 'Digital ID not found in the official student registry.',
        },
        { status: 200 }
      );
    }

    // ── CHECK 2: Already voted? ──────────────────────────────
    // Queries votes.digital_id (new TEXT column from migration 005).
    // This column has a UNIQUE constraint — the race-condition guard.
    const { data: existingVote, error: voteCheckError } = await supabase
      .from('votes')
      .select('id')
      .eq('digital_id', digitalId)
      .maybeSingle();

    if (voteCheckError) {
      console.error('[students/lookup] votes.digital_id check error:', {
        code:    voteCheckError.code,
        message: voteCheckError.message,
        details: voteCheckError.details,
        hint:    voteCheckError.hint,
      });
      return NextResponse.json(
        { error: 'Unable to check vote status. Please try again.' },
        { status: 500 }
      );
    }

    if (existingVote) {
      return NextResponse.json(
        {
          found: true,
          alreadyVoted: true,
          message: 'This student has already cast a vote.',
        },
        { status: 200 }
      );
    }

    // ── Eligible: return student details ─────────────────────
    const s = student as {
      digital_id: string;
      name:       string;
      batch:      string;
      degree:     string;
      dept:       string;
      email:      string | null;
    };

    return NextResponse.json(
      {
        found: true,
        alreadyVoted: false,
        student: {
          digital_id: s.digital_id,
          name:       s.name,
          batch:      s.batch,
          degree:     s.degree,
          dept:       s.dept,
          email:      s.email ?? null,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[students/lookup] Unexpected error:', msg);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
