ALTER TABLE issues ADD COLUMN IF NOT EXISTS github_repo_id TEXT;

CREATE INDEX IF NOT EXISTS idx_issues_github_repo_id ON issues(github_repo_id);

