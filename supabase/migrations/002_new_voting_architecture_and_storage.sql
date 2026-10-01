-- ============================================================
-- BUILD CLUB — SSN I FOUND: Migration v2
-- New Voting Architecture (No Students Database) & Storage Setup
-- ============================================================

-- 1. Modify VOTES table to decouple from students table
-- The votes table directly records the student_id (TEXT, UNIQUE),
-- student_name, student_department, project_id, project_department.

DO $$
BEGIN
  -- Drop existing foreign key to students table if present
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'votes_student_id_fkey' AND table_name = 'votes'
  ) THEN
    ALTER TABLE votes DROP CONSTRAINT votes_student_id_fkey;
  END IF;

  -- Ensure student_id is TEXT
  ALTER TABLE votes ALTER COLUMN student_id TYPE TEXT USING student_id::text;

  -- Add student_name if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'student_name'
  ) THEN
    ALTER TABLE votes ADD COLUMN student_name TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add student_department if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'student_department'
  ) THEN
    ALTER TABLE votes ADD COLUMN student_department TEXT;
  END IF;

  -- Add project_department if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'votes' AND column_name = 'project_department'
  ) THEN
    ALTER TABLE votes ADD COLUMN project_department TEXT;
  END IF;

  -- Drop and re-add UNIQUE constraint on student_id to ensure clean state
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'votes_student_id_unique' AND table_name = 'votes'
  ) THEN
    ALTER TABLE votes DROP CONSTRAINT votes_student_id_unique;
  END IF;
  
  ALTER TABLE votes ADD CONSTRAINT votes_student_id_unique UNIQUE (student_id);

  -- Make voted_by optional or nullable if not already
  ALTER TABLE votes ALTER COLUMN voted_by DROP NOT NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_votes_student_id ON votes(student_id);
CREATE INDEX IF NOT EXISTS idx_votes_project_id ON votes(project_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

-- 2. Ensure Storage Bucket for Project Images exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. Storage Policies on storage.objects
-- Allow public to view project images
DROP POLICY IF EXISTS "Public Read Project Images" ON storage.objects;
CREATE POLICY "Public Read Project Images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-images');

-- Allow authenticated users to upload, update, delete project images
DROP POLICY IF EXISTS "Authenticated Upload Project Images" ON storage.objects;
CREATE POLICY "Authenticated Upload Project Images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated Update Project Images" ON storage.objects;
CREATE POLICY "Authenticated Update Project Images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "Authenticated Delete Project Images" ON storage.objects;
CREATE POLICY "Authenticated Delete Project Images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');

-- 4. Recreate/Update Leaderboard VIEW
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
