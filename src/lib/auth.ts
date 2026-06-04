/**
 * Client di autenticazione studente (account email scolastica + password).
 * Il token firmato dal server è conservato in localStorage e inviato come
 * `Authorization: Bearer <token>` su tutte le chiamate protette.
 */

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  declaredClass: string | null;
  class: string | null;
  status: 'pending' | 'validated' | 'rejected' | 'disabled' | string;
  mustChangePassword: boolean;
  createdAt: string;
  validatedAt: string | null;
  lastLoginAt: string | null;
}

export interface ExamState {
  enabledForClass: boolean;
  available: boolean;
  /** Livello impostato dal docente: 'Base'|'Media'|'Alta'|'Esperta'|'random'|'student'|null. */
  level: string | null;
}

const TOKEN_KEY = 'vlsm_auth_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage non disponibile */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

async function authFetch<T>(path: string, init: RequestInit = {}, timeoutMs = 12000): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers = new Headers(init.headers);
    const token = getToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
    const res = await fetch(path, { ...init, headers, signal: ctrl.signal });
    let data: unknown = undefined;
    const text = await res.text().catch(() => '');
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = undefined;
      }
    }
    if (!res.ok) {
      const err = (data as { error?: string } | undefined)?.error ?? `HTTP ${res.status}`;
      return { ok: false, status: res.status, error: err, data: data as T };
    }
    return { ok: true, status: res.status, data: data as T };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, status: 0, error: msg };
  } finally {
    clearTimeout(t);
  }
}

export { authFetch };

interface AuthSuccess {
  ok: true;
  token: string;
  student: StudentProfile;
}

export async function apiRegister(input: {
  email: string;
  password: string;
  fullName: string;
  declaredClass: string;
}): Promise<ApiResult<AuthSuccess>> {
  const res = await authFetch<AuthSuccess>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (res.ok && res.data?.token) setToken(res.data.token);
  return res;
}

export async function apiLogin(email: string, password: string): Promise<ApiResult<AuthSuccess>> {
  const res = await authFetch<AuthSuccess>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (res.ok && res.data?.token) setToken(res.data.token);
  return res;
}

export async function apiMe(): Promise<ApiResult<{ student: StudentProfile; exam: ExamState }>> {
  return authFetch<{ student: StudentProfile; exam: ExamState }>('/api/auth/me', { method: 'GET' });
}

export async function apiChangePassword(currentPassword: string, newPassword: string): Promise<ApiResult<{ ok: boolean }>> {
  return authFetch<{ ok: boolean }>('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
