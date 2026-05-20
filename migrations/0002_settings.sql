-- Migrazione 0002: settings runtime + audit log.
-- Lanciare nel pannello Cloudflare D1 → Console → Execute (tutto in un colpo o statement per statement).

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('verifica_enabled', 'true', '2025-01-01T00:00:00Z');
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('student_password', '', '');
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('student_password_previous', '', '');
INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES ('student_password_changed_at', '', '');

CREATE TABLE IF NOT EXISTS settings_audit (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  key             TEXT NOT NULL,
  action          TEXT NOT NULL,            -- 'set' | 'rotate-password'
  old_value       TEXT,                     -- valore PRIMA del cambio (per password: '[REDACTED]')
  new_value       TEXT,                     -- valore DOPO il cambio (per password: '[REDACTED]')
  updated_at      TEXT NOT NULL,
  updated_by_ip   TEXT,
  user_agent      TEXT
);

CREATE INDEX IF NOT EXISTS idx_settings_audit_time ON settings_audit(updated_at DESC);
