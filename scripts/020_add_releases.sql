CREATE TABLE IF NOT EXISTS releases (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  description TEXT,
  release_date DATE,
  status TEXT NOT NULL CHECK (status IN ('unreleased', 'released', 'archived')) DEFAULT 'unreleased',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_releases (
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  release_id TEXT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  fix_version BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (issue_id, release_id)
);

CREATE INDEX IF NOT EXISTS idx_releases_project_id ON releases(project_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);
CREATE INDEX IF NOT EXISTS idx_issue_releases_issue_id ON issue_releases(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_releases_release_id ON issue_releases(release_id);

