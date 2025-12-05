CREATE TABLE IF NOT EXISTS custom_fields (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'user', 'checkbox')),
  options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_custom_field_values (
  issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  custom_field_id TEXT NOT NULL REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (issue_id, custom_field_id)
);

CREATE INDEX IF NOT EXISTS idx_custom_fields_project_id ON custom_fields(project_id);
CREATE INDEX IF NOT EXISTS idx_issue_custom_field_values_issue_id ON issue_custom_field_values(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_custom_field_values_field_id ON issue_custom_field_values(custom_field_id);

