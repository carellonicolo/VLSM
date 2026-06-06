/**
 * Endpoint diagnostico: NON espone valori, solo presenza/assenza dei binding
 * e raggiungibilità dell'Identity Provider SSO.
 * Da rimuovere o nascondere dopo il setup iniziale se vuoi essere paranoico.
 */
import { verifySession } from '../_lib/sso';

interface Env {
  DB: D1Database;
  VLSM_HMAC_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
  const info: Record<string, unknown> = {
    hasDB: typeof env.DB !== 'undefined' && env.DB !== null,
    hasHmacSecret: typeof env.VLSM_HMAC_SECRET === 'string' && env.VLSM_HMAC_SECRET.length > 0,
  };

  // SSO: verifica raggiungibilità del JWKS e (se presente) validità del cookie.
  try {
    const res = await fetch('https://auth.nicolocarello.it/.well-known/jwks.json');
    info.ssoJwksReachable = res.ok;
    if (res.ok) {
      const doc = (await res.json()) as { keys?: { kid?: string }[] };
      info.ssoJwksKids = (doc.keys ?? []).map((k) => k.kid);
    }
  } catch (e) {
    info.ssoJwksReachable = false;
    info.ssoError = e instanceof Error ? e.message : String(e);
  }
  info.hasSessionCookie = (request.headers.get('cookie') ?? '').includes('nc_session=');
  try {
    info.sessionValid = !!(await verifySession(request));
  } catch {
    info.sessionValid = false;
  }

  // Tenta una query banale per verificare la connessione e lo schema.
  if (info.hasDB) {
    try {
      const row = await env.DB.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'`
      ).first();
      info.schemaApplied = !!row;
    } catch (e) {
      info.dbError = e instanceof Error ? e.message : String(e);
      info.schemaApplied = false;
    }
  }

  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
