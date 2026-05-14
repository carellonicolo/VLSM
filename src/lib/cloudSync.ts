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

const STUDENT_PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'docente2026';

async function api(path: string, init: RequestInit, role: 'student' | 'admin' = 'student'): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('x-vlsm-auth', role === 'admin' ? ADMIN_PASSWORD : STUDENT_PASSWORD);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return fetch(path, { ...init, headers });
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
    const res = await api(url, { method: 'GET' }, 'admin');
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

export async function cloudReopenSession(id: string, extendMinutes = 15): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ extendMinutes }),
    }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function cloudDeleteSession(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'admin');
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
