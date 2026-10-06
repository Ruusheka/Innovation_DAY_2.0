import { z } from 'zod';

// ============================================================
// student_registry row schema for CSV import validation
// Matches the actual table:
//   digital_id TEXT PRIMARY KEY
//   name       TEXT NOT NULL
//   batch      TEXT NOT NULL
//   degree     TEXT NOT NULL
//   dept       TEXT NOT NULL
//   email      TEXT (nullable)
// ============================================================
export const studentImportRowSchema = z.object({
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
    .max(20, 'Batch value is too long'),
  degree: z
    .string()
    .trim()
    .min(1, 'Degree is required')
    .max(50, 'Degree value is too long'),
  dept: z
    .string()
    .trim()
    .min(1, 'Department is required')
    .max(30, 'Department value is too long'),
  email: z
    .string()
    .trim()
    .email('Invalid email format')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type StudentImportRowInput = z.infer<typeof studentImportRowSchema>;
