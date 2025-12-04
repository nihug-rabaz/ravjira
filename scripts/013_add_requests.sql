CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  requester_name TEXT NOT NULL,
  personal_number TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('civilian', 'military')),
  request_type TEXT NOT NULL CHECK (request_type IN ('website', 'software', 'other')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'taken', 'completed', 'rejected')),
  taken_by_user_id TEXT REFERENCES users(id),
  project_id TEXT REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_platform ON requests(platform);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);


