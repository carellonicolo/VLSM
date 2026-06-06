/**
 * Client SSO per il front-end.
 *
 * L'autenticazione è centralizzata su auth.nicolocarello.it: il cookie condiviso
 * `nc_session` (Domain .nicolocarello.it) viaggia automaticamente verso le API
 * dell'app. Qui esponiamo:
 *  - fetchMe()         → chi è l'utente loggato (identità + dato fresco IdP)
 *  - redirectToLogin() → manda al login centrale, tornando alla pagina corrente
 *  - redirectToLogout()→ logout globale (disconnette da tutte le app)
 */

export const AUTH_ORIGIN = 'https://auth.nicolocarello.it';

export interface ApprovedClass {
  scuola: string;
  classe: string;
  annoScolastico: string;
}

export interface MeUser {
  userId: string;
  email: string;
  name: string;
  status: string;
}

export interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
  status?: string;
  isSuperAdmin?: boolean;
  approvedClasses?: ApprovedClass[];
}

/**
 * Interroga /api/me. Ritorna sempre un oggetto: { authenticated: false } se non
 * loggato o in caso di errore di rete (così il chiamante decide cosa mostrare).
 */
export async function fetchMe(): Promise<MeResponse> {
  try {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return { authenticated: false };
    return (await res.json()) as MeResponse;
  } catch {
    return { authenticated: false };
  }
}

/** Manda il browser al login centrale, con ritorno alla pagina corrente. */
export function redirectToLogin(): void {
  window.location.assign(
    `${AUTH_ORIGIN}/login?redirect=${encodeURIComponent(window.location.href)}`
  );
}

/** Logout globale: disconnette da tutte le app, poi torna alla home dell'app. */
export function redirectToLogout(): void {
  window.location.assign(
    `${AUTH_ORIGIN}/logout?redirect=${encodeURIComponent(window.location.origin)}`
  );
}

/** Estrae le classi approvate come semplici stringhe (per i menù del front-end). */
export function approvedClassNames(classes: ApprovedClass[] | undefined): string[] {
  if (!classes) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of classes) {
    const v = c.classe?.trim();
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
