import { z } from 'zod';

// ============================================================
// Vote validation schema — Digital ID verification flow
//
// The student's identity is verified server-side against
// public.student_registry (digital_id TEXT PRIMARY KEY).
//
// The frontend sends only:
//   studentId    : the Digital ID entered by the operator
//   projectUuid  : the project UUID being voted for
//   idCardVerified: physical ID card confirmed by desk operator
//
// The server re-validates the Digital ID against student_registry
// before inserting. votes.student_id TEXT UNIQUE is the final
// concurrency/race-condition guard — only ONE INSERT per
// digital_id can ever succeed.
// ============================================================
export const voteSchema = z.object({
  // Digital ID as entered — server normalises and re-validates against student_registry
  studentId: z
    .string()
    .trim()
    .min(1, 'Student Digital ID is required.')
    .max(30, 'Student Digital ID is too long.')
    .regex(/^\d{7,20}$/, 'Student Digital ID must be 7–20 digits.'),

  projectUuid: z
    .string()
    .uuid('Please select a project.'),

  idCardVerified: z
    .boolean()
    .refine((v) => v === true, 'Physical ID card verification is required.'),
});

export type VoteSchemaInput = z.infer<typeof voteSchema>;
