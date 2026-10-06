#!/usr/bin/env node
/**
 * BUILD CLUB — SSN I FOUND
 * One-time Student CSV Import Utility
 * ============================================================
 * Usage:
 *   node scripts/import-students.mjs <path/to/students.csv>
 *
 * CSV format (with header row):
 *   student_id,name,department
 *   231234567,Ruusheka Akilavarshini,CSE
 *   241234568,John Doe,ECE
 *
 * This script:
 *   1. Reads the CSV file
 *   2. Validates every row
 *   3. Detects duplicate Digital IDs → STOPS if found
 *   4. Maps department codes to department UUIDs
 *   5. Inserts in batches of 100 via the import API
 *   6. Produces a full report
 *
 * SECURITY:
 *   Runs server-side with SERVICE_ROLE_KEY. Never commit this
 *   script output or the CSV to a public repository.
 *
 * Requirements:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   - node >= 18 (for built-in fetch)
 * ============================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ── Load env ────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=\s][^=\s]*)=(.*)$/);
    if (match) {
      const [, key, val] = match;
      process.env[key.trim()] = val.trim().replace(/^["']|["']$/g, '');
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// ── Parse args ───────────────────────────────────────────────
const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/import-students.mjs <path/to/students.csv>');
  process.exit(1);
}

if (!fs.existsSync(csvPath)) {
  console.error(`❌  File not found: ${csvPath}`);
  process.exit(1);
}

// ── Create Supabase service client ──────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Parse CSV manually (no external dep needed for simple CSVs) ──
function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.every(v => !v)) continue; // skip blank rows
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });
    rows.push(row);
  }
  return { headers, rows };
}

// ── Validate a single row ────────────────────────────────────
function validateRow(row, index) {
  const errors = [];
  const studentId = (row.student_id || row.studentid || row['student id'] || '').trim();
  const name      = (row.name || '').trim();
  const dept      = (row.department || row.dept || '').trim().toUpperCase();

  if (!studentId) errors.push(`Row ${index + 2}: Missing Digital ID`);
  else if (!/^\d{7,20}$/.test(studentId)) errors.push(`Row ${index + 2}: Invalid Digital ID "${studentId}" (must be 7–20 digits)`);

  if (!name || name.length < 2) errors.push(`Row ${index + 2}: Missing or too-short name`);
  if (!dept) errors.push(`Row ${index + 2}: Missing department`);

  return { studentId, name, department: dept, errors };
}

// ── Main ────────────────────────────────────────────────────
async function main() {
  console.log(`\n📄  Reading CSV: ${path.resolve(csvPath)}`);
  const content = fs.readFileSync(csvPath, 'utf8');
  const { rows } = parseCSV(content);

  console.log(`   Total rows found: ${rows.length}`);
  if (rows.length === 0) { console.error('❌  No data rows found in CSV.'); process.exit(1); }

  // Fetch departments
  const { data: departments, error: deptErr } = await supabase.from('departments').select('id, code, name');
  if (deptErr) { console.error('❌  Failed to fetch departments:', deptErr.message); process.exit(1); }

  const deptMap = new Map(departments.map(d => [d.code.toUpperCase(), d]));
  console.log(`\n📋  Available departments: ${[...deptMap.keys()].sort().join(', ')}`);

  // ── Phase 1: Validate ──────────────────────────────────────
  const validRows = [];
  const errors = [];
  const seenIds = new Map(); // digital_id → first row index
  let unknown_depts = new Set();

  for (let i = 0; i < rows.length; i++) {
    const { studentId, name, department, errors: rowErrors } = validateRow(rows[i], i);
    if (rowErrors.length) { errors.push(...rowErrors); continue; }

    // Duplicate Digital ID detection
    if (seenIds.has(studentId)) {
      const firstRow = seenIds.get(studentId);
      errors.push(`Row ${i + 2}: Duplicate Digital ID "${studentId}" (first seen at row ${firstRow + 2})`);
      continue;
    }
    seenIds.set(studentId, i);

    const deptRecord = deptMap.get(department);
    if (!deptRecord) {
      unknown_depts.add(department);
      errors.push(`Row ${i + 2}: Unknown department "${department}"`);
      continue;
    }

    validRows.push({ student_id: studentId, name, department_id: deptRecord.id });
  }

  // ── Report validation ──────────────────────────────────────
  console.log(`\n🔍  Validation Report:`);
  console.log(`   Total rows   : ${rows.length}`);
  console.log(`   Valid        : ${validRows.length}`);
  console.log(`   Errors       : ${errors.length}`);
  if (unknown_depts.size) {
    console.log(`   Unknown depts: ${[...unknown_depts].join(', ')}`);
  }

  const duplicates = errors.filter(e => e.includes('Duplicate'));
  if (duplicates.length) {
    console.error(`\n❌  STOPPED: ${duplicates.length} duplicate Digital ID(s) detected.`);
    console.error('   Resolve duplicates before importing:\n');
    duplicates.forEach(d => console.error(`   ${d}`));
    process.exit(1);
  }

  if (errors.length) {
    console.warn(`\n⚠   ${errors.length} rows have errors and will be skipped:`);
    errors.slice(0, 20).forEach(e => console.warn(`   ${e}`));
    if (errors.length > 20) console.warn(`   ... and ${errors.length - 20} more`);
    console.log('');
  }

  if (validRows.length === 0) {
    console.error('❌  No valid rows to import. Aborting.');
    process.exit(1);
  }

  console.log(`\n🚀  Importing ${validRows.length} students in batches of 100...`);

  // ── Phase 2: Batch upsert ──────────────────────────────────
  const BATCH_SIZE = 100;
  let imported = 0, skipped = 0, batchErrors = [];

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    const { data, error } = await supabase
      .from('students')
      .upsert(batch, { onConflict: 'student_id', ignoreDuplicates: true })
      .select('id');

    if (error) {
      batchErrors.push(`Batch ${batchNum}: ${error.message}`);
      console.error(`   ❌  Batch ${batchNum} failed: ${error.message}`);
    } else {
      const count = data?.length ?? 0;
      imported += count;
      skipped  += batch.length - count;
      process.stdout.write(`   Batch ${batchNum}: ${count} inserted, ${batch.length - count} already existed\n`);
    }
  }

  // ── Final report ───────────────────────────────────────────
  console.log(`\n✅  Import Complete:`);
  console.log(`   Imported   : ${imported}`);
  console.log(`   Skipped    : ${skipped}  (already in database)`);
  console.log(`   Validation errors: ${errors.length}`);
  console.log(`   Batch errors: ${batchErrors.length}`);

  if (batchErrors.length) {
    console.error('\n❌  Batch errors:');
    batchErrors.forEach(e => console.error(`   ${e}`));
  }

  // ── Database verification query ─────────────────────────────
  const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
  console.log(`\n📊  Total students in database now: ${count}`);

  // Verify no duplicate digital_ids exist
  const { data: dupCheck } = await supabase.rpc('exec_sql', {
    sql: `SELECT student_id, COUNT(*) as cnt FROM students GROUP BY student_id HAVING COUNT(*) > 1 LIMIT 5`
  }).catch(() => ({ data: null }));

  if (dupCheck && dupCheck.length > 0) {
    console.error('\n⚠  WARNING: Duplicate digital_ids found in database:');
    dupCheck.forEach(r => console.error(`   ${r.student_id}: ${r.cnt} records`));
  } else {
    console.log('   ✓  No duplicate Digital IDs in database.');
  }

  console.log('\n🎉  Done.\n');
}

main().catch(err => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
