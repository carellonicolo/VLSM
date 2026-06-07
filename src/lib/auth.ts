/**
 * Client di autenticazione studente via SSO centralizzato (auth.nicolocarello.it).
 *
 * L'identità arriva dal cookie condiviso `nc_session` (Domain .nicolocarello.it),
 * inviato automaticamente alle API dell'app. Niente più password/token locali:
 * registrazione, login e cambio password vivono sull'IdP. Qui esponiamo:
 *  - authFetch()        → fetch autenticata (cookie incluso) — usata da studentApi
 *  - apiMe()            → profilo studente + stato esame (/api/auth/me)
 *  - fetchSsoIdentity() → identità SSO + isSuperAdmin (/api/me) — per il gate docente
 *  - redirectToLogin()/redirectToLogout() → login/logout centrali
 */

export const AUTH_ORIGIN = 'https://auth.nicolocarello.it';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  declaredClass: string | null;
  class: string | null;
  status: 'pending' | 'validated' | 'disabled' | string;
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

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

/** Fetch autenticata: il cookie SSO viaggia da solo (`credentials: 'include'`). */
async function authFetch<T>(path: string, init: RequestInit = {}, timeoutMs = 12000): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
    const res = await fetch(path, { ...init, headers, credentials: 'include', signal: ctrl.signal });
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

/** Profilo studente + stato esame dell'utente loggato (SSO). 401 se non loggato. */
export async function apiMe(): Promise<ApiResult<{ student: StudentProfile; exam: ExamState }>> {
  return authFetch<{ student: StudentProfile; exam: ExamState }>('/api/auth/me', { method: 'GET' });
}

export interface SsoIdentity {
  authenticated: boolean;
  user?: { userId: string; email: string; name: string; status: string };
  isSuperAdmin?: boolean;
  status?: string;
  approvedClasses?: { scuola: string; classe: string; annoScolastico: string }[];
}

/** Identità SSO grezza + flag super-admin (per il gate della console docente). */
export async function fetchSsoIdentity(): Promise<SsoIdentity> {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return { authenticated: false };
    return (await res.json()) as SsoIdentity;
  } catch {
    return { authenticated: false };
  }
}

/** Manda il browser al login centrale, tornando alla pagina corrente. */
export function redirectToLogin(): void {
  window.location.assign(`${AUTH_ORIGIN}/login?redirect=${encodeURIComponent(window.location.href)}`);
}

/** Logout globale (disconnette da tutte le app), poi torna alla home dell'app. */
export function redirectToLogout(): void {
  window.location.assign(`${AUTH_ORIGIN}/logout?redirect=${encodeURIComponent(window.location.origin)}`);
}
