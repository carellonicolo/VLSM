/**
 * Lettura del roster dall'Identity Provider (auth.nicolocarello.it).
 *
 * La console docente di VLSM deve vedere studenti e classi in TEMPO REALE come
 * sono sull'IdP, senza attendere che ogni studente acceda a VLSM. Per farlo si
 * inoltra LATO SERVER il cookie di sessione del docente all'endpoint admin
 * dell'IdP (`/api/admin/users`), che è protetto dal flag super-admin: quindi
 * solo un docente super-admin ottiene il roster. Nessun segreto condiviso,
 * nessun CORS (è una fetch worker→worker, senza header Origin).
 *
 * Va chiamato SOLO dopo aver verificato `requireSuperAdmin` lato VLSM.
 */
const AUTH_ORIGIN = 'https://auth.nicolocarello.it';

export interface IdpEnrollment {
  id: string;
  scuola: string;
  classe: string;
  annoScolastico: string;
  approved: boolean;
}

export interface IdpUser {
  id: string;
  email: string;
  name: string;
  status: string; // 'active' | 'suspended'
  isSuperAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  enrollments: IdpEnrollment[];
}

/**
 * Roster completo dall'IdP (utenti + iscrizioni). Ritorna `null` se l'IdP non è
 * raggiungibile o rifiuta (in tal caso il chiamante usa il fallback locale).
 */
export async function fetchIdpRoster(request: Request): Promise<IdpUser[] | null> {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  try {
    const res = await fetch(`${AUTH_ORIGIN}/api/admin/users`, { headers: { cookie } });
    if (!res.ok) return null;
    const data = (await res.json()) as { users?: IdpUser[] };
    return Array.isArray(data.users) ? data.users : [];
  } catch {
    return null;
  }
}

/** Classe "canonica" di uno studente: la prima classe approvata (poi una qualsiasi). */
export function primaryClassOf(u: IdpUser): string | null {
  const approved = u.enrollments.find((e) => e.approved && e.classe);
  if (approved) return approved.classe;
  const any = u.enrollments.find((e) => e.classe);
  return any?.classe ?? null;
}

/** Stato "studente" per la console VLSM a partire dallo stato IdP + classi approvate. */
export function studentStatusOf(u: IdpUser): 'validated' | 'pending' | 'disabled' {
  if (u.status !== 'active') return 'disabled';
  return u.enrollments.some((e) => e.approved && e.classe) ? 'validated' : 'pending';
}
