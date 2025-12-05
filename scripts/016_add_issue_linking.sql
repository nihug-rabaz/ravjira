CREATE TABLE IF NOT EXISTS issue_links (
  id TEXT PRIMARY KEY,
  source_issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  target_issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('relates', 'blocks', 'is blocked by', 'duplicates', 'is duplicated by', 'depends on', 'is depended on by')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source_issue_id, target_issue_id, link_type)
);

CREATE INDEX IF NOT EXISTS idx_issue_links_source ON issue_links(source_issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_links_target ON issue_links(target_issue_id);

