import { z } from 'zod';

// ============================================================
// Project creation/update schema
// ============================================================
export const projectSchema = z.object({
  project_id: z
    .string()
    .min(1, 'Project ID is required')
    .max(20, 'Project ID is too long')
    .regex(/^[A-Za-z0-9-_]+$/, 'Project ID must be alphanumeric letters, numbers, hyphens, or underscores')
    .trim(),
  department_id: z
    .string()
    .uuid('Please select a department'),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title is too long')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  project_lead: z
    .string()
    .min(2, 'Project lead name is required')
    .max(100, 'Name is too long')
    .trim(),
  team_members: z
    .array(z.string().trim().min(1, 'Team member name cannot be empty'))
    .default([]),
  project_supervisor: z
    .string()
    .max(100, 'Supervisor name is too long')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().trim().min(1, 'Tag cannot be empty'))
    .default([]),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean(),
});

export type ProjectSchemaInput = z.infer<typeof projectSchema>;
