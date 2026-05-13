import { canonicalJson, constantTimeEqual, hmacSha256Base64 } from '../_lib/crypto';

interface Env {
  VLSM_HMAC_SECRET: string;
}

interface Body {
  payload?: unknown;
  signature?: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.VLSM_HMAC_SECRET || env.VLSM_HMAC_SECRET.length < 16) {
    return new Response(JSON.stringify({ error: 'VLSM_HMAC_SECRET non configurata sul server' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return new Response(JSON.stringify({ error: 'JSON non valido' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!body || typeof body.signature !== 'string' || body.payload === undefined) {
    return new Response(JSON.stringify({ error: 'Mancano payload o signature' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const canonical = canonicalJson(body.payload);
  const expected = await hmacSha256Base64(env.VLSM_HMAC_SECRET, canonical);
  const valid = constantTimeEqual(body.signature, expected);
  return new Response(JSON.stringify({ valid }), {
    headers: { 'content-type': 'application/json' },
  });
};

export const onRequest: PagesFunction<Env> = () =>
  new Response('Method not allowed', { status: 405 });
