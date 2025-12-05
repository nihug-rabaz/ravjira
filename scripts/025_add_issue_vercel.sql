ALTER TABLE issues ADD COLUMN IF NOT EXISTS vercel_project_id TEXT;

CREATE INDEX IF NOT EXISTS idx_issues_vercel_project_id ON issues(vercel_project_id);

