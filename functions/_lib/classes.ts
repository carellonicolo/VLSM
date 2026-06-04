/**
 * Helper per lo sblocco "esame attivo" per singola classe e il livello scelto
 * dal docente. L'esame è disponibile per uno studente quando:
 *   master globale (settings.verifica_enabled) && classe abilitata && studente validato.
 *
 * `exam_level` (migrazione 0004) indica il livello della verifica per la classe:
 *   'Base'|'Media'|'Alta'|'Esperta' = livello fisso · 'random' = casuale ·
 *   'student' (o null) = scelto dallo studente.
 */
import type { SharedEnv } from './shared';

export interface ClassExam {
  enabled: boolean;
  level: string | null;
}

export async function getClassExam(env: SharedEnv, klass: string | null | undefined): Promise<ClassExam> {
  if (!klass) return { enabled: false, level: null };
  try {
    const row = await env.DB
      .prepare(`SELECT enabled, exam_level FROM class_exam_state WHERE class = ?`)
      .bind(klass)
      .first<{ enabled: number; exam_level: string | null }>();
    return { enabled: !!row && row.enabled === 1, level: row?.exam_level ?? null };
  } catch {
    // Colonna exam_level mancante (migrazione 0004 non applicata): leggi solo enabled.
    try {
      const row = await env.DB
        .prepare(`SELECT enabled FROM class_exam_state WHERE class = ?`)
        .bind(klass)
        .first<{ enabled: number }>();
      return { enabled: !!row && row.enabled === 1, level: null };
    } catch {
      // Migrazione 0003 non applicata → esame non attivo (degrado morbido).
      return { enabled: false, level: null };
    }
  }
}

export async function isClassExamEnabled(env: SharedEnv, klass: string | null | undefined): Promise<boolean> {
  return (await getClassExam(env, klass)).enabled;
}

export async function setClassExam(
  env: SharedEnv,
  klass: string,
  enabled: boolean,
  level: string | null,
  audit: { ip?: string } = {}
): Promise<void> {
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO class_exam_state (class, enabled, exam_level, updated_at, updated_by_ip)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(class) DO UPDATE SET
         enabled       = excluded.enabled,
         exam_level    = excluded.exam_level,
         updated_at    = excluded.updated_at,
         updated_by_ip = excluded.updated_by_ip`
    ).bind(klass, enabled ? 1 : 0, level ?? null, now, audit.ip ?? '').run();
  } catch {
    // Fallback se exam_level non esiste ancora: scrivi solo enabled.
    await env.DB.prepare(
      `INSERT INTO class_exam_state (class, enabled, updated_at, updated_by_ip)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(class) DO UPDATE SET
         enabled       = excluded.enabled,
         updated_at    = excluded.updated_at,
         updated_by_ip = excluded.updated_by_ip`
    ).bind(klass, enabled ? 1 : 0, now, audit.ip ?? '').run();
  }
}
