-- ============================================================
-- BUILD CLUB — SSN I FOUND: Database Migration v1
-- ============================================================
-- Run this in Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DEPARTMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT departments_code_unique UNIQUE (code)
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  title         TEXT NOT NULL,
  description   TEXT,
  project_lead  TEXT NOT NULL,
  image_url     TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT projects_project_id_unique UNIQUE (project_id)
);

CREATE INDEX IF NOT EXISTS idx_projects_department_id ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_projects_project_id    ON projects(project_id);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    TEXT NOT NULL,
  name          TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT students_student_id_unique UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- ============================================================
-- ADMIN USERS  (mirrors Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'ADMIN',
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_auth_user_id_unique UNIQUE (auth_user_id),
  CONSTRAINT admin_users_email_unique        UNIQUE (email),
  CONSTRAINT admin_users_role_check          CHECK (role IN ('ADMIN','SUPER_ADMIN','VIEWER'))
);

-- ============================================================
-- VOTES  —  THE MOST IMPORTANT TABLE
-- UNIQUE(student_id) is the concurrency safety guarantee
-- One student = one vote, enforced at the database level
-- ============================================================
CREATE TABLE IF NOT EXISTS votes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  project_id       UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  voted_by         UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  id_card_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT votes_student_id_unique UNIQUE (student_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_student_id ON votes(student_id);
CREATE INDEX IF NOT EXISTS idx_votes_project_id ON votes(project_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

-- ============================================================
-- AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id   ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- EVENT SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS event_settings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name     TEXT NOT NULL DEFAULT 'SSN I FOUND',
  voting_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure only one row exists
INSERT INTO event_settings (event_name, voting_enabled)
VALUES ('SSN I FOUND', false)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, code) VALUES
  ('Computer Science and Engineering', 'CSE'),
  ('Electronics and Communication Engineering', 'ECE'),
  ('Electrical and Electronics Engineering', 'EEE'),
  ('Mechanical Engineering', 'MECH'),
  ('Civil Engineering', 'CIVIL'),
  ('Information Technology', 'IT')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE departments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects      ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- DEPARTMENTS: anyone can read active departments
DROP POLICY IF EXISTS "public_read_active_departments" ON departments;
CREATE POLICY "public_read_active_departments"
  ON departments FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- PROJECTS: anyone can read active projects
DROP POLICY IF EXISTS "public_read_active_projects" ON projects;
CREATE POLICY "public_read_active_projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- EVENT_SETTINGS: anyone can read (only voting_enabled matters for public)
DROP POLICY IF EXISTS "public_read_event_settings" ON event_settings;
CREATE POLICY "public_read_event_settings"
  ON event_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- ADMIN_USERS: Authenticated users can read their own admin record
DROP POLICY IF EXISTS "admin_users_read_own" ON admin_users;
CREATE POLICY "admin_users_read_own"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid() AND is_active = true);

-- STUDENTS: NO public access — server-side only via service role
-- VOTES: NO public access — server-side only via service role
-- AUDIT_LOGS: NO public access — server-side only via service role


-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_settings_updated_at
  BEFORE UPDATE ON event_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- LEADERBOARD VIEW (for efficient querying)
-- ============================================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id            AS project_uuid,
  p.project_id,
  p.title,
  p.project_lead,
  d.id            AS department_uuid,
  d.name          AS department_name,
  d.code          AS department_code,
  COUNT(v.id)     AS vote_count,
  RANK() OVER (PARTITION BY d.id ORDER BY COUNT(v.id) DESC) AS dept_rank,
  RANK() OVER (ORDER BY COUNT(v.id) DESC) AS overall_rank
FROM projects p
JOIN departments d ON d.id = p.department_id
LEFT JOIN votes v ON v.project_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.project_id, p.title, p.project_lead, d.id, d.name, d.code
ORDER BY d.code, vote_count DESC;
