ALTER TABLE projects ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'civilian' CHECK (environment IN ('civilian', 'military'));

CREATE INDEX IF NOT EXISTS idx_projects_environment ON projects(environment);

