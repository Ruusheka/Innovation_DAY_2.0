// ============================================================
// Shared TypeScript types for BUILD CLUB — SSN I FOUND
// ============================================================

export type AdminRole = 'ADMIN' | 'SUPER_ADMIN' | 'VIEWER';

export interface Department {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  accent_color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_id: string;
  department_id: string;
  title: string;
  description: string | null;
  project_lead: string;
  team_members?: string[] | null;
  project_supervisor?: string | null;
  tags?: string[] | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
  departments?: Department;
}

// Legacy students table (still exists from migration 001, kept for historical data)
export interface Student {
  id: string;
  student_id: string;
  name: string;
  email?: string | null;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department;
  departments?: Department;
}

// ── Official student master list ─────────────────────────────
// Matches public.student_registry exactly
export interface StudentRegistry {
  digital_id: string; // TEXT PRIMARY KEY — the canonical student identifier
  name: string;
  batch: string;      // e.g. "2023", "2024", "2025"
  degree: string;     // e.g. "B.E.", "M.E.", "M.Tech"
  dept: string;       // e.g. "CSE", "ECE", "MECH" — text (not FK)
  email: string | null;
}

// Response from GET /api/admin/students/[studentId]
export interface StudentLookupResponse {
  found: boolean;
  alreadyVoted: boolean;
  // Only present when found=true and alreadyVoted=false
  student?: {
    digital_id: string;
    name: string;
    batch: string;
    degree: string;
    dept: string;
    email: string | null;
  };
  message?: string;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  student_id: string;       // TEXT — Digital ID from student_registry
  student_name: string;
  student_department: string | null;
  department_id?: string | null;
  project_id: string;
  project_department: string | null;
  voted_by: string | null;
  id_card_verified: boolean;
  created_at: string;
  project?: Project;
  admin?: AdminUser;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  admin?: AdminUser;
}

export interface EventSettings {
  id: string;
  event_name: string;
  voting_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Leaderboard row from the leaderboard view
export interface LeaderboardRow {
  project_uuid: string;
  project_id: string;
  title: string;
  project_lead: string;
  team_members?: string[] | null;
  project_supervisor?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  department_uuid: string;
  department_name: string;
  department_code: string;
  department_color?: string | null;
  department_accent_color?: string | null;
  vote_count: number;
  dept_rank: number;
  overall_rank: number;
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface StudentSearchResult {
  student: Student & { departments: Department | null };
  hasVoted: boolean;
}

// Vote submission payload (frontend → server)
export interface VotePayload {
  studentId: string;    // Digital ID (server re-validates against student_registry)
  projectUuid: string;
  idCardVerified: boolean;
}

export interface ProjectFormData {
  project_id: string;
  department_id: string;
  title: string;
  description: string;
  project_lead: string;
  team_members?: string[];
  project_supervisor?: string;
  tags?: string[];
  image_url?: string;
  is_active: boolean;
}

export interface StudentImportRow {
  student_id: string;
  name: string;
  department: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}
