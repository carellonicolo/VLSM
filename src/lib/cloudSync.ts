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

// Password studente "effettiva": dopo il login validato dal server usiamo
// quella digitata dallo studente (che riflette eventuali cambi password
// runtime fatti dal docente), NON la costante compilata nel bundle.
const STUDENT_AUTH_KEY = 'vlsm_student_auth';
let runtimeStudentPassword: string | null = null;

export function setStudentPassword(pwd: string): void {
  runtimeStudentPassword = pwd;
  try {
    localStorage.setItem(STUDENT_AUTH_KEY, pwd);
  } catch {
    // ignore
  }
}

export function clearStudentPassword(): void {
  runtimeStudentPassword = null;
  try {
    localStorage.removeItem(STUDENT_AUTH_KEY);
  } catch {
    // ignore
  }
}

function studentAuthValue(): string {
  if (runtimeStudentPassword) return runtimeStudentPassword;
  try {
    const stored = localStorage.getItem(STUDENT_AUTH_KEY);
    if (stored) {
      runtimeStudentPassword = stored;
      return stored;
    }
  } catch {
    // ignore
  }
  return STUDENT_PASSWORD;
}

async function api(path: string, init: RequestInit, role: 'student' | 'admin' = 'student'): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('x-vlsm-auth', role === 'admin' ? ADMIN_PASSWORD : studentAuthValue());
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

export type SessionState = 'in_progress' | 'consegnata' | 'abbandonata' | 'annullata';

export interface CloudSessionRow {
  id: string;
  student_name: string;
  student_class: string;
  student_id: string | null;
  student_email: string | null;
  categoria: string;
  verifica_id: string;
  verifica_titolo: string;
  difficolta: string | null;
  state: SessionState;
  started_at: string;
  deadline_at: string;
  consegnato_at: string | null;
  updated_at: string;
  duration_min: number;
  voto30: number | null;
  signed: 0 | 1;
  motivo_consegna: string | null;
  annullata_motivo: string | null;
  client_id: string;
  client_user_agent: string | null;
  client_ip: string | null;
  distrazioni_count: number;
  ammonizioni_count: number;
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

export interface CloudSessionDetail {
  id: string;
  student_name: string;
  student_class: string;
  student_id: string | null;
  student_email: string | null;
  categoria: 'verifica' | 'esercitazione';
  verifica_id: string;
  verifica_titolo: string;
  difficolta: string | null;
  state: SessionState;
  started_at: string;
  deadline_at: string;
  consegnato_at: string | null;
  updated_at: string;
  duration_min: number;
  voto30: number | null;
  signature: string | null;
  signed_at: string | null;
  motivo_consegna: string | null;
  annullata_motivo: string | null;
  answers: unknown;
  eventiFocus: { startedAt: string; durataMs: number }[];
  esito: unknown;
  events: { id: number; type: string; message: string | null; created_at: string }[];
}

export async function cloudGetSession(id: string): Promise<{ ok: boolean; session?: CloudSessionDetail; error?: string }> {
  try {
    const res = await api(`/api/sessions/${encodeURIComponent(id)}`, { method: 'GET' }, 'admin');
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

// ====== Auth + Settings (runtime config dal DB) ======

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

export interface StudentLoginResult { ok: boolean; status: number; error?: string }

export async function cloudLoginStudent(password: string): Promise<StudentLoginResult> {
  try {
    const res = await fetch('/api/auth/login-student', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return { ok: true, status: res.status };
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, status: res.status, error: body.error };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface AdminSettings {
  verificaEnabled: boolean;
  studentPasswordSet: boolean;
  studentPasswordChangedAt: string;
  gracePeriodValid: boolean;
  gracePeriodEndsAt: string;
}

export async function cloudGetAdminSettings(): Promise<{ ok: boolean; settings?: AdminSettings; error?: string }> {
  try {
    const res = await api('/api/admin/settings', { method: 'GET' }, 'admin');
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

export async function cloudChangeStudentPassword(newPassword: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api('/api/admin/student-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      let msg = `HTTP ${res.status}`;
      try { const parsed = JSON.parse(body); if (parsed?.error) msg = parsed.error; } catch { /* ignore */ }
      return { ok: false, error: msg };
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
    const res = await api('/api/admin/audit', { method: 'GET' }, 'admin');
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

// ====== Gestione studenti & classi (docente) ======

export interface AdminStudent {
  id: string;
  email: string;
  full_name: string;
  declared_class: string | null;
  class: string | null;
  status: 'pending' | 'validated' | 'rejected' | 'disabled' | string;
  must_change_password: number;
  created_at: string;
  validated_at: string | null;
  last_login_at: string | null;
  n_verifiche: number;
  n_esercitazioni: number;
  n_in_corso: number;
}

export async function cloudListStudents(status = 'all', klass = ''): Promise<{ ok: boolean; students: AdminStudent[]; error?: string }> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (klass) params.set('class', klass);
    const qs = params.toString();
    const res = await api(`/api/admin/students${qs ? `?${qs}` : ''}`, { method: 'GET' }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, students: [], error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { students: AdminStudent[] };
    return { ok: true, students: data.students ?? [] };
  } catch (e) {
    return { ok: false, students: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export interface AdminStudentDetail {
  student: AdminStudent & { notes: string | null };
  sessions: import('./studentApi').HistorySession[];
}

export async function cloudGetStudent(id: string): Promise<{ ok: boolean; detail?: AdminStudentDetail; error?: string }> {
  try {
    const res = await api(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'GET' }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as AdminStudentDetail;
    return { ok: true, detail: data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function adminMutate(path: string, body: unknown, method = 'POST'): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(path, { method, body: JSON.stringify(body) }, 'admin');
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      let msg = `HTTP ${res.status}`;
      try { const p = JSON.parse(text); if (p?.error) msg = p.error; } catch { /* ignore */ }
      return { ok: false, error: msg };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function cloudValidateStudent(id: string, status: string, klass?: string): Promise<{ ok: boolean; error?: string }> {
  return adminMutate(`/api/admin/students/${encodeURIComponent(id)}/validate`, { status, class: klass });
}

export function cloudResetStudentPassword(id: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
  return adminMutate(`/api/admin/students/${encodeURIComponent(id)}/reset-password`, { newPassword });
}

export async function cloudDeleteStudent(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await api(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface AdminClass {
  class: string;
  examEnabled: boolean;
  nValidati: number;
  nTotali: number;
  nInCorso: number;
}

export async function cloudListClasses(): Promise<{ ok: boolean; classes: AdminClass[]; error?: string }> {
  try {
    const res = await api('/api/admin/classes', { method: 'GET' }, 'admin');
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, classes: [], error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = (await res.json()) as { classes: AdminClass[] };
    return { ok: true, classes: data.classes ?? [] };
  } catch (e) {
    return { ok: false, classes: [], error: e instanceof Error ? e.message : String(e) };
  }
}

export function cloudSetClassExam(klass: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  return adminMutate('/api/admin/classes', { class: klass, enabled }, 'PUT');
}

export function cloudIntervene(
  sessionId: string,
  type: 'alert' | 'ammonizione' | 'annulla',
  message: string
): Promise<{ ok: boolean; error?: string }> {
  return adminMutate(`/api/sessions/${encodeURIComponent(sessionId)}/intervene`, { type, message });
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
