ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('lowest', 'low', 'medium', 'high', 'highest')) DEFAULT 'medium';

CREATE INDEX IF NOT EXISTS idx_subtasks_assignee_id ON subtasks(assignee_id);

