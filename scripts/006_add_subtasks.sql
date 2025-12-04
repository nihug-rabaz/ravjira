CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  parent_issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subtasks_parent_issue_id ON subtasks(parent_issue_id);


