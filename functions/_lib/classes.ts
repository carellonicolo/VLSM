/**
 * Helper per lo sblocco "esame attivo" per singola classe.
 * L'esame è effettivamente disponibile per uno studente quando:
 *   master globale (settings.verifica_enabled)  &&  classe abilitata  &&  studente validato
 */
import type { SharedEnv } from './shared';

export async function isClassExamEnabled(env: SharedEnv, klass: string | null | undefined): Promise<boolean> {
  if (!klass) return false;
  try {
    const row = await env.DB
      .prepare(`SELECT enabled FROM class_exam_state WHERE class = ?`)
      .bind(klass)
      .first<{ enabled: number }>();
    return !!row && row.enabled === 1;
  } catch {
    // Migrazione 0003 non ancora applicata → esame non attivo (degrado morbido).
    return false;
  }
}

export async function setClassExamEnabled(
  env: SharedEnv,
  klass: string,
  enabled: boolean,
  audit: { ip?: string } = {}
): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO class_exam_state (class, enabled, updated_at, updated_by_ip)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(class) DO UPDATE SET
       enabled       = excluded.enabled,
       updated_at    = excluded.updated_at,
       updated_by_ip = excluded.updated_by_ip`
  ).bind(klass, enabled ? 1 : 0, now, audit.ip ?? '').run();
}
