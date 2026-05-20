/**
 * Helper per leggere/scrivere le settings runtime + audit log.
 * Cache leggera in memoria per evitare query ripetute durante lo stesso handler.
 */
import type { SharedEnv } from './shared';

const STUDENT_PASSWORD_GRACE_MS = 60 * 60_000; // 60 minuti

export async function getSetting(env: SharedEnv, key: string): Promise<string> {
  try {
    const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = ?`).bind(key).first<{ value: string }>();
    return row?.value ?? '';
  } catch {
    return '';
  }
}

export async function setSetting(
  env: SharedEnv,
  key: string,
  newValue: string,
  audit: { ip?: string; userAgent?: string; action?: string; redactValueInLog?: boolean } = {}
): Promise<void> {
  const now = new Date().toISOString();
  const oldValue = await getSetting(env, key);
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(key, newValue, now).run();

  const safeOld = audit.redactValueInLog ? (oldValue ? '[REDACTED]' : '') : oldValue;
  const safeNew = audit.redactValueInLog ? '[REDACTED]' : newValue;
  await env.DB.prepare(
    `INSERT INTO settings_audit (key, action, old_value, new_value, updated_at, updated_by_ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(key, audit.action ?? 'set', safeOld, safeNew, now, audit.ip ?? '', audit.userAgent ?? '').run();
}

export interface StudentAuth {
  current: string;
  previous?: string;
  previousValidUntilMs?: number;
}

export async function getStudentAuth(env: SharedEnv): Promise<StudentAuth> {
  const dbCurrent = await getSetting(env, 'student_password');
  if (dbCurrent) {
    const dbPrevious = await getSetting(env, 'student_password_previous');
    const changedAt = await getSetting(env, 'student_password_changed_at');
    let previousValidUntilMs: number | undefined;
    if (dbPrevious && changedAt) {
      previousValidUntilMs = new Date(changedAt).getTime() + STUDENT_PASSWORD_GRACE_MS;
    }
    return { current: dbCurrent, previous: dbPrevious || undefined, previousValidUntilMs };
  }
  // Fallback su env var (bootstrap)
  return { current: env.APP_PASSWORD ?? env.VITE_APP_PASSWORD ?? '' };
}

export async function rotateStudentPassword(env: SharedEnv, newPassword: string, audit: { ip?: string; userAgent?: string }): Promise<void> {
  const now = new Date().toISOString();
  const currentPwd = await getSetting(env, 'student_password');
  // Se non c'era una password in DB, NON la mettiamo come "previous" (era l'env var, sempre valida).
  if (currentPwd) {
    await env.DB.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES ('student_password_previous', ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(currentPwd, now).run();
  }
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('student_password', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(newPassword, now).run();
  await env.DB.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('student_password_changed_at', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).bind(now, now).run();
  await env.DB.prepare(
    `INSERT INTO settings_audit (key, action, old_value, new_value, updated_at, updated_by_ip, user_agent)
     VALUES (?, 'rotate-password', '[REDACTED]', '[REDACTED]', ?, ?, ?)`
  ).bind('student_password', now, audit.ip ?? '', audit.userAgent ?? '').run();
}

export async function getVerificaEnabled(env: SharedEnv): Promise<boolean> {
  const v = await getSetting(env, 'verifica_enabled');
  if (v === '') return true; // default true se mai impostata
  return v === 'true';
}
