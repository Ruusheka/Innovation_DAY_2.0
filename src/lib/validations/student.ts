import { z } from 'zod';

// ============================================================
// Student CSV import row schema
// ============================================================
export const studentImportRowSchema = z.object({
  student_id: z
    .string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long')
    .trim(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name is too long')
    .trim(),
  department: z
    .string()
    .min(1, 'Department is required')
    .max(20, 'Department code is too long')
    .trim()
    .toUpperCase(),
});

export type StudentImportRowInput = z.infer<typeof studentImportRowSchema>;
