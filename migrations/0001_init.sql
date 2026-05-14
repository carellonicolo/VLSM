-- Schema iniziale per le sessioni di verifica VLSM.
-- Lanciare nel pannello Cloudflare D1 → Console → Execute.

CREATE TABLE IF NOT EXISTS sessions (
  id                  TEXT PRIMARY KEY,            -- hash deterministico di (nome_norm, classe_norm, startedAt)
  student_name        TEXT NOT NULL,
  student_name_norm   TEXT NOT NULL,               -- lowercase + trim + collapsed spaces
  student_class       TEXT NOT NULL,
  student_class_norm  TEXT NOT NULL,
  categoria           TEXT NOT NULL,               -- 'verifica' | 'esercitazione'
  verifica_id         TEXT NOT NULL,
  verifica_titolo     TEXT NOT NULL,
  difficolta          TEXT,
  state               TEXT NOT NULL,               -- 'in_progress' | 'consegnata' | 'abbandonata'
  started_at          TEXT NOT NULL,               -- ISO 8601
  deadline_at         TEXT NOT NULL,               -- ISO 8601
  consegnato_at       TEXT,                        -- ISO 8601 quando state='consegnata'
  updated_at          TEXT NOT NULL,               -- ultimo save dal client
  duration_min        INTEGER NOT NULL,
  answers_json        TEXT NOT NULL DEFAULT '{}',
  eventi_focus_json   TEXT NOT NULL DEFAULT '[]',
  esito_json          TEXT,                        -- popolato a consegna
  voto30              REAL,
  signature           TEXT,
  signed_at           TEXT,
  client_id           TEXT NOT NULL,               -- id random generato in localStorage
  client_user_agent   TEXT,
  client_ip           TEXT,
  motivo_consegna     TEXT                         -- 'volontaria' | 'timeout'
);

-- Indici per le query principali
CREATE INDEX IF NOT EXISTS idx_sessions_lookup
  ON sessions(student_name_norm, student_class_norm, state, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_admin
  ON sessions(state, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_categoria
  ON sessions(categoria, state, updated_at DESC);
