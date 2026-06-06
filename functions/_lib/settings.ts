/**
 * Helper per leggere/scrivere le settings runtime + audit log.
 *
 * Con l'SSO centralizzato l'autenticazione non vive più qui: restano solo le
 * impostazioni applicative (es. `verifica_enabled`, il master-switch del docente
 * per abilitare/disabilitare globalmente le verifiche ufficiali).
 */
import type { SharedEnv } from './shared';

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

export async function getVerificaEnabled(env: SharedEnv): Promise<boolean> {
  const v = await getSetting(env, 'verifica_enabled');
  if (v === '') return true; // default true se mai impostata
  return v === 'true';
}
