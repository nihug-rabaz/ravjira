CREATE TABLE IF NOT EXISTS project_vercel_projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vercel_project_id TEXT NOT NULL,
  vercel_project_name TEXT NOT NULL,
  vercel_team_id TEXT,
  vercel_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, vercel_project_id)
);

CREATE INDEX IF NOT EXISTS idx_project_vercel_projects_project ON project_vercel_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_project_vercel_projects_vercel ON project_vercel_projects(vercel_project_id);


