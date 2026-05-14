/**
 * Helpers condivisi tra le Pages Functions.
 * Auth basata sui due secrets passati come variabili d'ambiente Cloudflare:
 *  - APP_PASSWORD       → password studenti (anche VITE_APP_PASSWORD)
 *  - ADMIN_PASSWORD     → password docente (anche VITE_ADMIN_PASSWORD)
 *
 * Le richieste devono includere l'header `X-VLSM-Auth: <password>`.
 */

export interface SharedEnv {
  DB: D1Database;
  APP_PASSWORD?: string;
  ADMIN_PASSWORD?: string;
  VITE_APP_PASSWORD?: string;
  VITE_ADMIN_PASSWORD?: string;
}

export type Role = 'student' | 'admin';

function getPassword(env: SharedEnv, role: Role): string | undefined {
  return role === 'admin'
    ? env.ADMIN_PASSWORD ?? env.VITE_ADMIN_PASSWORD
    : env.APP_PASSWORD ?? env.VITE_APP_PASSWORD;
}

export function requireAuth(request: Request, env: SharedEnv, role: Role): Response | null {
  const expected = getPassword(env, role);
  if (!expected) {
    return jsonError(503, `Password ${role} non configurata sul server.`);
  }
  const provided = request.headers.get('x-vlsm-auth') ?? '';
  if (!constantTimeEqual(provided, expected)) {
    return jsonError(401, 'Non autorizzato.');
  }
  return null;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
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
