import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canImportStudents } from '@/lib/permissions';
import { z } from 'zod';
import type { ImportResult } from '@/types';

// ============================================================
// POST /api/admin/students/import
// SUPER_ADMIN only — bulk import students into student_registry.
//
// Expects: { rows: Array<{ digital_id, name, batch, degree, dept, email? }> }
//
// Matches the actual student_registry table schema:
//   digital_id TEXT PRIMARY KEY
//   name       TEXT NOT NULL
//   batch      TEXT NOT NULL
//   degree     TEXT NOT NULL
//   dept       TEXT NOT NULL
//   email      TEXT
//
// Import safety rules:
//   1. Validate each row with Zod schema
//   2. Detect DUPLICATE digital_ids within the CSV batch — STOP if found
//   3. Import in batches of 100 with upsert (ignoreDuplicates: true)
//   4. Report: imported / skipped / errors / duplicates
// ============================================================

const studentRegistryRowSchema = z.object({
  digital_id: z
    .string()
    .trim()
    .min(1, 'Digital ID is required')
    .max(30, 'Digital ID is too long')
    .regex(/^\d{7,20}$/, 'Digital ID must be 7–20 digits'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name is too long'),
  batch: z
    .string()
    .trim()
    .min(1, 'Batch is required')
    .max(20, 'Batch is too long'),
  degree: z
    .string()
    .trim()
    .min(1, 'Degree is required')
    .max(50, 'Degree is too long'),
  dept: z
    .string()
    .trim()
    .min(1, 'Department is required')
    .max(30, 'Department is too long'),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canImportStudents(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN role required' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body?.rows || !Array.isArray(body.rows)) {
      return NextResponse.json({ error: 'rows array is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    const result: ImportResult & { duplicates: string[] } = {
      imported: 0,
      skipped: 0,
      errors: [],
      duplicates: [],
    };

    // ── PHASE 1: Validate all rows & detect CSV-level duplicates ──
    const seenInBatch = new Map<string, number>(); // digital_id → first occurrence row index
    const validRows: Array<{
      digital_id: string;
      name: string;
      batch: string;
      degree: string;
      dept: string;
      email: string | null;
    }> = [];

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const parsed = studentRegistryRowSchema.safeParse(row);

      if (!parsed.success) {
        const msgs = parsed.error.issues.map((e) => e.message).join(', ');
        result.errors.push(`Row ${i + 1}: ${msgs}`);
        continue;
      }

      const { digital_id, name, batch, degree, dept, email } = parsed.data;

      // Duplicate Digital ID detection within this CSV batch
      if (seenInBatch.has(digital_id)) {
        const firstRow = seenInBatch.get(digital_id)!;
        const dupMsg = `Row ${i + 1}: Duplicate Digital ID "${digital_id}" (also at row ${firstRow + 1})`;
        result.duplicates.push(dupMsg);
        result.errors.push(dupMsg);
        continue;
      }
      seenInBatch.set(digital_id, i);

      validRows.push({
        digital_id,
        name,
        batch,
        degree,
        dept,
        email: email || null,
      });
    }

    // STOP if any duplicates were found in the CSV
    if (result.duplicates.length > 0) {
      return NextResponse.json(
        {
          data: result,
          error: `Import stopped: ${result.duplicates.length} duplicate Digital ID(s) detected in the CSV. Resolve duplicates before importing.`,
        },
        { status: 400 }
      );
    }

    // ── PHASE 2: Upsert valid rows in batches of 100 ─────────────
    const BATCH_SIZE = 100;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('student_registry')
        .upsert(batch, {
          onConflict: 'digital_id',
          ignoreDuplicates: true, // existing records are NOT overwritten
        })
        .select('digital_id');

      if (error) {
        result.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
      } else {
        const count = data?.length ?? 0;
        result.imported += count;
        result.skipped  += batch.length - count;
      }
    }

    // ── Audit log ──────────────────────────────────────────────
    try {
      await supabase.from('audit_logs').insert({
        admin_id:    session.admin.id,
        action:      'IMPORT_STUDENTS',
        target_type: 'student_registry',
        metadata: {
          total_rows:       body.rows.length,
          imported:         result.imported,
          skipped:          result.skipped,
          errors:           result.errors.length,
          duplicates_in_csv: result.duplicates.length,
        },
      });
    } catch (auditErr) {
      console.warn('[import] Non-fatal audit log failure:', auditErr);
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error('[admin/students/import] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
