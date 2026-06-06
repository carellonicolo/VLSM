import type { EsitoFinale, RispostaStudente, EventoFocus, Categoria } from '../types/domain';

export interface CloudSessionPayload {
  clientId: string;
  studente: { nome: string; classe: string };
  categoria: Categoria;
  verificaId: string;
  verificaTitolo: string;
  difficolta?: string;
  startedAt: string;
  deadlineAt: string;
  durationMin: number;
  answers: RispostaStudente;
  eventiFocus: EventoFocus[];
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  consegnatoAt?: string;
  esito?: EsitoFinale;
  voto30?: number;
  signature?: string;
  signedAt?: string;
  motivoConsegna?: 'volontaria' | 'timeout';
}

export interface RecoverableSession {
  id: string;
  studente: { nome: string; classe: string };
  categoria: Categoria;
  verificaId: string;
  verificaTitolo: string;
  difficolta?: string | null;
  startedAt: string;
  deadlineAt: string;
  updatedAt: string;
  durationMin: number;
  answers: RispostaStudente;
  eventiFocus: EventoFocus[];
  clientId: string;
  previousClientUserAgent?: string | null;
}

// Autenticazione via SSO: il cookie condiviso `nc_session` viaggia da solo.
// `credentials: 'include'` lo allega anche se in futuro le API fossero cross-origin.
async function api(path: string, init: RequestInit): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return fetch(path, { ...init, headers, credentials: 'include' });
}

const SAVE_TIMEOUT_MS = 7000;

export async function cloudSave(payload: CloudSessionPayload): Promise<{ ok: boolean; updatedAt?: string; error?: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), SAVE_TIMEOUT_MS);
  try {
    const res = await api('/api/session/save', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { ok: boolean; updatedAt?: string };
    return { ok: !!data.ok, updatedAt: data.updatedAt };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

export async function cloudRecover(nome: string, classe: string): Promise<RecoverableSession | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const url = `/api/session/recover?nome=${encodeURIComponent(nome)}&classe=${encodeURIComponent(classe)}`;
    const res = await api(url, { method: 'GET', signal: ctrl.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as { found: boolean; session?: RecoverableSession };
    return data.found && data.session ? data.session : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export interface CloudSessionRow {
  id: string;
  student_name: string;
  student_class: string;
  categoria: string;
  verifica_id: string;
  verifica_titolo: string;
  difficolta: string | null;
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  started_at: string;
  deadline_at: string;
  consegnato_at: string | null;
  updated_at: string;
  duration_min: number;
  voto30: number | null;
  signed: 0 | 1;
  motivo_consegna: string | null;
  client_id: string;
  client_user_agent: string | null;
  client_ip: string | null;
  distrazioni_count: number;
  answers_size: number;
}

export async function cloudListSessions(state?: string): Promise<{ ok: boolean; sessions: CloudSessionRow[]; error?: string }> {
  try {
    const url = state && state !== 'all' ? `/api/sessions/list?state=${encodeURIComponent(state)}` : '/api/sessions/list';
    const res = await api(url, { method: 'GET' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, sessions: [], error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { sessions: CloudSessionRow[] };
    return { ok: true, sessions: data.sessions ?? [] };
  } catch (e) {
    return { ok: false, sessions: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export interface CloudSessionDetail {
  id: string;
  student_name: string;
  student_class: string;
  categoria: 'verifica' | 'esercitazione';
  verifica_id: string;
  verifica_titolo: string;
  difficolta: string | null;
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  started_at: string;
  deadline_at: string;
  consegnato_at: string | null;
  updated_at: string;
  duration_min: number;
  voto30: number | null;
  signature: string | null;
  signed_at: string | null;
  motivo_consegna: string | null;
  answers: unknown;
  eventiFocus: { startedAt: string; durataMs: number }[];
  esito: unknown;
}

export async function cloudGetSession(id: string): Promise<{ ok: boolean; session?: CloudSessionDetail; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}`, { method: 'GET' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { session: CloudSessionDetail };
    return { ok: true, session: data.session };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloudReopenSession(id: string, extendMinutes = 15): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ extendMinutes }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ====== Settings (runtime config dal DB) ======
// L'autenticazione è gestita dall'SSO (vedi src/lib/auth.ts): qui restano solo
// le impostazioni applicative.

export interface PublicConfig { verificaEnabled: boolean }

export async function cloudGetConfig(): Promise<PublicConfig> {
  try {
    const res = await fetch('/api/auth/config', { method: 'GET' });
    if (!res.ok) return { verificaEnabled: true };
    const data = (await res.json()) as PublicConfig;
    return { verificaEnabled: data.verificaEnabled !== false };
  } catch {
    return { verificaEnabled: true };
  }
}

export interface AdminSettings {
  verificaEnabled: boolean;
}

export async function cloudGetAdminSettings(): Promise<{ ok: boolean; settings?: AdminSettings; error?: string }> {
  try {
    const res = await api('/api/admin/settings', { method: 'GET' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const settings = (await res.json()) as AdminSettings;
    return { ok: true, settings };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloudSetVerificaEnabled(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api('/api/admin/verifica-enabled', {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface AuditEntry {
  id: number;
  key: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  updated_at: string;
  updated_by_ip: string | null;
  user_agent: string | null;
}

export async function cloudGetAuditLog(): Promise<{ ok: boolean; entries: AuditEntry[]; error?: string }> {
  try {
    const res = await api('/api/admin/audit', { method: 'GET' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, entries: [], error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { entries: AuditEntry[] };
    return { ok: true, entries: data.entries ?? [] };
  } catch (e) {
    return { ok: false, entries: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloudDeleteSession(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function getOrCreateClientId(): string {
  const KEY = 'vlsm_client_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      const arr = new Uint8Array(12);
      crypto.getRandomValues(arr);
      id = Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return `nostorage-${Date.now()}`;
  }
}
