/**
 * GET /api/me — identità dell'utente loggato via SSO centralizzato.
 *
 * - 401 { authenticated: false }              se non c'è una sessione valida
 * - 200 { authenticated: true, user, ... }    con identità + dato fresco dall'IdP
 *
 * Il dato fresco (status, isSuperAdmin, approvedClasses) arriva da /api/userinfo
 * dell'IdP: è ciò che gate front-end usa per decidere se mostrare verifica/admin.
 * Se l'IdP non è raggiungibile si ritorna comunque l'identità del cookie con
 * valori di fallback prudenti (nessuna classe, non super-admin).
 */
import { verifySession, fetchUserInfo } from '../_lib/sso';

interface Env {
  [key: string]: unknown;
}

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const identity = await verifySession(request);
  if (!identity) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const info = await fetchUserInfo(request);

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: identity,
      status: info?.user.status ?? identity.status,
      isSuperAdmin: info?.user.isSuperAdmin ?? false,
      approvedClasses: info?.approvedClasses ?? [],
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};
