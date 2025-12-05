ALTER TABLE issues ADD COLUMN IF NOT EXISTS epic_id TEXT REFERENCES issues(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_issues_epic_id ON issues(epic_id);

