CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  declared_class TEXT,
  class TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  validated_at TEXT,
  validated_by_ip TEXT,
  last_login_at TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status, class);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class);

CREATE TABLE IF NOT EXISTS class_exam_state (
  class TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT '',
  updated_by_ip TEXT
);

CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  student_id TEXT,
  type TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL,
  created_by_ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id, id);

ALTER TABLE sessions ADD COLUMN student_id TEXT;
ALTER TABLE sessions ADD COLUMN annullata_motivo TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id, started_at);
