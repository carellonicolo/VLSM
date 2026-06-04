-- Migrazione 0003: account studenti + convalida docente + sblocco verifica
-- per-classe + interventi docente in tempo reale (alert / ammonizione / annulla).
--
-- Lanciare nel pannello Cloudflare D1 → Console → Execute (UNA SOLA VOLTA).
-- NB: gli `ALTER TABLE ... ADD COLUMN` in fondo falliscono se rilanciati
-- (la colonna esiste già): è normale, vanno eseguiti una sola volta.

-- ============================================================
-- Account studenti
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id                    TEXT PRIMARY KEY,            -- id random (hex)
  email                 TEXT NOT NULL UNIQUE,        -- email scolastica, lowercase
  full_name             TEXT NOT NULL,               -- nome e cognome dichiarati
  declared_class        TEXT,                        -- classe dichiarata in registrazione
  class                 TEXT,                        -- classe CONFERMATA dal docente
  status                TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'validated'|'rejected'|'disabled'
  password_hash         TEXT NOT NULL,               -- pbkdf2$iter$salt$hash
  must_change_password  INTEGER NOT NULL DEFAULT 0,  -- 1 dopo un reset da parte del docente
  created_at            TEXT NOT NULL,
  validated_at          TEXT,
  validated_by_ip       TEXT,
  last_login_at         TEXT,
  notes                 TEXT
);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status, class);
CREATE INDEX IF NOT EXISTS idx_students_class  ON students(class);

-- ============================================================
-- Stato "esame attivo" per singola classe (sblocco verifica per-classe)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_exam_state (
  class          TEXT PRIMARY KEY,
  enabled        INTEGER NOT NULL DEFAULT 0,
  updated_at     TEXT NOT NULL DEFAULT '',
  updated_by_ip  TEXT
);

-- ============================================================
-- Interventi del docente sulla sessione (canale comandi + registro):
--   type = 'alert'        → messaggio momentaneo allo studente
--   type = 'ammonizione'  → ammonizione registrata (compare su PDF/report)
--   type = 'annulla'      → prova interrotta/annullata
-- ============================================================
CREATE TABLE IF NOT EXISTS session_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id    TEXT NOT NULL,
  student_id    TEXT,
  type          TEXT NOT NULL,
  message       TEXT,
  created_at    TEXT NOT NULL,
  created_by_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id, id);

-- ============================================================
-- Collegamento sessioni ↔ account + motivo annullamento.
-- (Le sessioni "legacy" precedenti restano con student_id NULL.)
-- Eseguire una sola volta: se già applicato, questi ALTER danno errore.
-- ============================================================
ALTER TABLE sessions ADD COLUMN student_id        TEXT;
ALTER TABLE sessions ADD COLUMN annullata_motivo  TEXT;
CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(student_id, started_at DESC);
