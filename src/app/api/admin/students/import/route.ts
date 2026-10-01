import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canImportStudents } from '@/lib/permissions';
import { studentImportRowSchema } from '@/lib/validations/student';
import type { ImportResult } from '@/types';

// ============================================================
// POST /api/admin/students/import
// SUPER_ADMIN only — bulk import students from CSV data
// Expects: { rows: Array<{ student_id, name, department }> }
// ============================================================
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

    // Pre-load departments for lookup
    const { data: departments } = await supabase
      .from('departments')
      .select('id, code');

    const deptMap = new Map<string, string>(
      (departments ?? []).map((d: { id: string; code: string }) => [d.code.toUpperCase(), d.id])
    );

    const result: ImportResult = { imported: 0, skipped: 0, errors: [] };
    const validRows: Array<{ student_id: string; name: string; department_id: string }> = [];

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const parsed = studentImportRowSchema.safeParse(row);

      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map((e) => e.message).join(', ');
        result.errors.push(`Row ${i + 1}: ${errorMessages}`);
        continue;
      }

      const deptId = deptMap.get(parsed.data.department.toUpperCase());
      if (!deptId) {
        result.errors.push(
          `Row ${i + 1}: Unknown department code "${parsed.data.department}"`
        );
        continue;
      }

      validRows.push({
        student_id: parsed.data.student_id,
        name: parsed.data.name,
        department_id: deptId,
      });
    }

    // Upsert in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const { data, error } = await supabase
        .from('students')
        .upsert(batch, {
          onConflict: 'student_id',
          ignoreDuplicates: true,
        })
        .select('id');

      if (error) {
        result.errors.push(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
      } else {
        const count = data?.length ?? 0;
        result.imported += count;
        result.skipped += batch.length - count;
      }
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      admin_id: session.admin.id,
      action: 'IMPORT_STUDENTS',
      target_type: 'students',
      metadata: {
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors.length,
      },
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error('[admin/students/import] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
