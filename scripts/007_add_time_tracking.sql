CREATE TABLE IF NOT EXISTS time_logs (
  id TEXT PRIMARY KEY,
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  time_spent INTEGER NOT NULL,
  description TEXT,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_estimates (
  issue_id TEXT PRIMARY KEY REFERENCES issues(id) ON DELETE CASCADE,
  original_estimate INTEGER,
  remaining_estimate INTEGER,
  time_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_logs_issue_id ON time_logs(issue_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);



