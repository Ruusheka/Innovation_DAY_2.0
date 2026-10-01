import { z } from 'zod';

// ============================================================
// Vote validation schema
// ============================================================
export const voteSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long')
    .trim(),
  projectUuid: z
    .string()
    .uuid('Invalid project ID'),
  departmentUuid: z
    .string()
    .uuid('Invalid department ID'),
  idCardVerified: z
    .boolean()
    .refine((v) => v === true, 'ID card verification is required'),
});

export type VoteSchemaInput = z.infer<typeof voteSchema>;
