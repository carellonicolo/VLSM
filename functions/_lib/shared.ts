/**
 * Helpers condivisi tra le Pages Functions.
 *
 * Autenticazione: SSO centralizzato (auth.nicolocarello.it). Le richieste
 * portano il cookie condiviso `nc_session` (JWT ES256). Le funzioni qui sotto
 * lo verificano con la sola chiave pubblica (vedi _lib/sso.ts) — nessuna
 * password condivisa, nessun header custom.
 *
 *  - requireIdentity   → autenticazione (cookie firmato valido). Economico,
 *                        nessun round-trip all'IdP. Usato per gli endpoint
 *                        studente (salvataggio/recupero verifica in corso).
 *  - requireSuperAdmin → autorizzazione docente (isSuperAdmin dal dato fresco
 *                        dell'IdP). Usato per gli endpoint admin.
 *
 * Il gate "classe approvata" per ENTRARE in una verifica è applicato in
 * /api/me (dato fresco) e nel front-end: gli endpoint di salvataggio devono
 * solo accertare l'identità, così un salvataggio ogni 1.5s non dipende dall'IdP
 * (niente perdita dati se l'IdP è momentaneamente irraggiungibile).
 */

import { verifySession, fetchUserInfo, type Identity } from './sso';

export interface SharedEnv {
  DB: D1Database;
}

export type { Identity };

/**
 * Richiede una sessione SSO valida (cookie firmato). Ritorna l'identità
 * oppure una Response 401 da restituire al client.
 * Pattern d'uso:
 *   const id = await requireIdentity(request);
 *   if (id instanceof Response) return id;
 */
export async function requireIdentity(request: Request): Promise<Identity | Response> {
  const identity = await verifySession(request);
  if (!identity) return jsonError(401, 'Accesso richiesto. Effettua il login.');
  return identity;
}

/**
 * Richiede che l'utente loggato sia super-admin (docente) sull'IdP.
 * Usa il dato fresco di /api/userinfo, così sospensioni/promozioni hanno
 * effetto immediato senza ri-login.
 */
export async function requireSuperAdmin(request: Request): Promise<Identity | Response> {
  const identity = await verifySession(request);
  if (!identity) return jsonError(401, 'Accesso docente richiesto.');
  const info = await fetchUserInfo(request);
  if (!info) return jsonError(401, 'Sessione non valida. Effettua di nuovo il login.');
  if (!info.user.isSuperAdmin) return jsonError(403, 'Riservato al docente (super-admin).');
  return identity;
}

export function jsonOk(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json' },
  });
}

export function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function normalizeText(s: string | undefined | null): string {
  if (!s) return '';
  return String(s).trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  const bytes = Array.from(new Uint8Array(buf));
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sessionIdFor(nome: string, classe: string, startedAt: string): Promise<string> {
  return sha256Hex(`${normalizeText(nome)}|${normalizeText(classe)}|${startedAt}`);
}
