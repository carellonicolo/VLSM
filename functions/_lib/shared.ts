/**
 * Helpers condivisi tra le Pages Functions.
 * Auth basata sulle password lette da:
 *  - D1 settings table (override runtime)
 *  - oppure fallback env vars (APP_PASSWORD / ADMIN_PASSWORD, anche VITE_*)
 *
 * Le richieste devono includere l'header `X-VLSM-Auth: <password>`.
 * Per gli studenti, la password "precedente" è accettata per 60 minuti
 * dopo un cambio (grace period per non rompere sessioni in corso).
 */

import { getStudentAuth } from './settings';

export interface SharedEnv {
  DB: D1Database;
  APP_PASSWORD?: string;
  ADMIN_PASSWORD?: string;
  VITE_APP_PASSWORD?: string;
  VITE_ADMIN_PASSWORD?: string;
}

export type Role = 'student' | 'admin';

export async function requireAuth(request: Request, env: SharedEnv, role: Role): Promise<Response | null> {
  const provided = request.headers.get('x-vlsm-auth') ?? '';

  if (role === 'admin') {
    const expected = env.ADMIN_PASSWORD ?? env.VITE_ADMIN_PASSWORD ?? '';
    if (!expected) return jsonError(503, 'Password admin non configurata sul server.');
    if (constantTimeEqual(provided, expected)) return null;
    return jsonError(401, 'Non autorizzato.');
  }

  // student
  const auth = await getStudentAuth(env);
  if (!auth.current) return jsonError(503, 'Password studente non configurata sul server.');
  if (constantTimeEqual(provided, auth.current)) return null;
  if (auth.previous && auth.previousValidUntilMs && Date.now() < auth.previousValidUntilMs && constantTimeEqual(provided, auth.previous)) {
    return null; // accettata in grace period (sessione già attiva)
  }
  return jsonError(401, 'Non autorizzato.');
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
