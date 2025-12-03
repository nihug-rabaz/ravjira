CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attachments_issue_id ON attachments(issue_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id);

