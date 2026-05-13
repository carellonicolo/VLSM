import { canonicalJson, hmacSha256Base64 } from '../_lib/crypto';

interface Env {
  VLSM_HMAC_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.VLSM_HMAC_SECRET || env.VLSM_HMAC_SECRET.length < 16) {
    return new Response(JSON.stringify({ error: 'VLSM_HMAC_SECRET non configurata sul server' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'JSON non valido' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }
  const canonical = canonicalJson(payload);
  const signature = await hmacSha256Base64(env.VLSM_HMAC_SECRET, canonical);
  return new Response(
    JSON.stringify({ signature, signedAt: new Date().toISOString() }),
    { headers: { 'content-type': 'application/json' } }
  );
};

export const onRequest: PagesFunction<Env> = () =>
  new Response('Method not allowed', { status: 405 });
