import { z } from 'zod';

// ============================================================
// Vote validation schema (No students table)
// ============================================================
export const voteSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Please enter a Student ID.')
    .max(50, 'Student ID is too long.')
    .trim(),
  studentName: z
    .string()
    .min(1, 'Please enter the student\'s name.')
    .max(100, 'Student name is too long.')
    .trim(),
  studentDepartment: z
    .string()
    .min(1, 'Please select the student\'s department.')
    .trim(),
  projectDepartment: z
    .string()
    .min(1, 'Please select the project department.')
    .trim(),
  projectUuid: z
    .string()
    .uuid('Please select a project.'),
  idCardVerified: z
    .boolean()
    .refine((v) => v === true, 'Physical ID card verification is required.'),
});

export type VoteSchemaInput = z.infer<typeof voteSchema>;
