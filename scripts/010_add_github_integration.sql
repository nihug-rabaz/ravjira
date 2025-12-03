ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_access_token TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_owner TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_repo TEXT;

CREATE INDEX IF NOT EXISTS idx_projects_github_repo ON projects(github_owner, github_repo);

