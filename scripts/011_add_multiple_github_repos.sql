CREATE TABLE IF NOT EXISTS project_github_repos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  github_repo_url TEXT NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, github_owner, github_repo)
);

CREATE INDEX IF NOT EXISTS idx_project_github_repos_project ON project_github_repos(project_id);
CREATE INDEX IF NOT EXISTS idx_project_github_repos_repo ON project_github_repos(github_owner, github_repo);

