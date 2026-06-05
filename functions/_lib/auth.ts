/**
 * Autenticazione studenti basata su account (email scolastica + password).
 *
 *  - Password: hash PBKDF2-HMAC-SHA256 (WebCrypto, compatibile Workers).
 *  - Sessione: token "stateless" firmato HMAC-SHA256 ( payload.b64url . sig.b64url ).
 *    Ad ogni richiesta protetta verifichiamo la firma + scadenza e ricarichiamo
 *    lo studente dal DB: così uno studente disabilitato/rifiutato viene bloccato
 *    subito, senza dover revocare token.
 *
 * Secret usato per firmare i token: VLSM_AUTH_SECRET (fallback VLSM_HMAC_SECRET).
 * In assenza, si usa un secret di sviluppo (insicuro) → impostarlo in produzione.
 */
import { jsonError, type SharedEnv } from './shared';

export interface AuthEnv extends SharedEnv {
  VLSM_AUTH_SECRET?: string;
  VLSM_HMAC_SECRET?: string;
  STUDENT_EMAIL_DOMAIN?: string;
}

const TOKEN_TTL_MS = 30 * 24 * 60 * 60_000; // 30 giorni
// Cloudflare Workers limita PBKDF2 a max 100.000 iterazioni.
const PBKDF2_ITER = 100_000;
const DEV_SECRET = 'vlsm-dev-insecure-auth-secret-please-set-VLSM_AUTH_SECRET';

function authSecret(env: AuthEnv): string {
  return env.VLSM_AUTH_SECRET || env.VLSM_HMAC_SECRET || DEV_SECRET;
}

export function emailDomain(env: AuthEnv): string {
  return (env.STUDENT_EMAIL_DOMAIN || 'marconiverona.edu.it').toLowerCase();
}

export function normalizeEmail(s: string | undefined | null): string {
  return String(s ?? '').trim().toLowerCase();
}

export function normalizeName(s: string | undefined | null): string {
  return String(s ?? '').trim().replace(/\s+/g, ' ');
}

export function isValidSchoolEmail(email: string, env: AuthEnv): boolean {
  const dom = emailDomain(env).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^[^\\s@]+@${dom}$`, 'i').test(email);
}

// ---------- base64url ----------
function bytesToB64url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function strToB64url(s: string): string {
  return bytesToB64url(new TextEncoder().encode(s));
}
function b64urlToStr(s: string): string {
  return new TextDecoder().decode(b64urlToBytes(s));
}

async function hmacBytes(secret: string, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------- token ----------
export interface TokenClaims {
  sid: string;
  iat: number;
  exp: number;
}

export async function signToken(env: AuthEnv, sid: string): Promise<string> {
  const now = Date.now();
  const claims: TokenClaims = { sid, iat: now, exp: now + TOKEN_TTL_MS };
  const payload = strToB64url(JSON.stringify(claims));
  const sig = bytesToB64url(await hmacBytes(authSecret(env), payload));
  return `${payload}.${sig}`;
}

export async function verifyToken(env: AuthEnv, token: string): Promise<TokenClaims | null> {
  if (!token || token.indexOf('.') === -1) return null;
  const dot = token.indexOf('.');
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = bytesToB64url(await hmacBytes(authSecret(env), payload));
  if (!constantTimeEqual(sig, expected)) return null;
  try {
    const claims = JSON.parse(b64urlToStr(payload)) as TokenClaims;
    if (!claims?.sid || typeof claims.exp !== 'number') return null;
    if (Date.now() > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

// ---------- password ----------
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `pbkdf2$${PBKDF2_ITER}$${bytesToB64url(salt)}$${bytesToB64url(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iter = parseInt(parts[1], 10);
    const salt = b64urlToBytes(parts[2]);
    const expected = parts[3];
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return constantTimeEqual(bytesToB64url(new Uint8Array(bits)), expected);
  } catch {
    return false;
  }
}

// ---------- record studente + auth richiesta ----------
export interface StudentRow {
  id: string;
  email: string;
  full_name: string;
  declared_class: string | null;
  class: string | null;
  status: string;
  must_change_password: number;
  created_at: string;
  validated_at: string | null;
  last_login_at: string | null;
  notes: string | null;
}

export function bearerToken(request: Request): string {
  const h = request.headers.get('authorization') || '';
  if (h.toLowerCase().startsWith('bearer ')) return h.slice(7).trim();
  return request.headers.get('x-vlsm-token') || '';
}

const STUDENT_COLS =
  'id, email, full_name, declared_class, class, status, must_change_password, created_at, validated_at, last_login_at, notes';

/**
 * Verifica il token e carica lo studente. Ritorna lo StudentRow oppure una
 * Response di errore già pronta (401/403). Pattern d'uso:
 *   const auth = await authenticateStudent(request, env);
 *   if (auth instanceof Response) return auth;
 */
export async function authenticateStudent(request: Request, env: AuthEnv): Promise<StudentRow | Response> {
  const token = bearerToken(request);
  const claims = await verifyToken(env, token);
  if (!claims) return jsonError(401, 'Sessione non valida o scaduta. Effettua di nuovo l’accesso.');
  const row = await env.DB.prepare(`SELECT ${STUDENT_COLS} FROM students WHERE id = ?`).bind(claims.sid).first<StudentRow>();
  if (!row) return jsonError(401, 'Account non trovato.');
  if (row.status === 'disabled' || row.status === 'rejected') {
    return jsonError(403, 'Account disabilitato. Contatta il docente.');
  }
  return row;
}

export function publicStudent(row: StudentRow) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    declaredClass: row.declared_class,
    class: row.class,
    status: row.status,
    mustChangePassword: !!row.must_change_password,
    createdAt: row.created_at,
    validatedAt: row.validated_at,
    lastLoginAt: row.last_login_at,
  };
}

export function randomId(): string {
  const a = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
}
