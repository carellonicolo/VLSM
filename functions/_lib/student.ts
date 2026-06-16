/**
 * Identità studente via SSO centralizzato.
 *
 * La tabella `students` diventa una PROIEZIONE in sola lettura dell'identità SSO:
 * `id = userId SSO (sub)`. Niente più password/registrazione locali (gestite
 * sull'IdP auth.nicolocarello.it). Qui:
 *
 *  - loadStudentFromSession → verifySession + UPSERT proiezione. Usata SOLO da
 *    /api/auth/me (una volta a load), per rinfrescare la proiezione.
 *  - getStudentRow          → verifySession + SELECT (NESSUNA scrittura). Provisiona
 *    solo se la riga manca. Per gli endpoint FREQUENTI (save/events/recover/history):
 *    evita una scrittura su `students` a ogni salvataggio/polling.
 *  - fetchSsoInfo            → dato fresco IdP (stato + classi approvate + super-admin).
 *  - syncStudentFromInfo     → aggiorna class/status della proiezione dal dato fresco.
 *
 * Il gate "classe approvata" per iniziare una verifica usa fetchSsoInfo (vedi
 * student/session/save.ts e auth/me.ts).
 */
import { jsonError, type SharedEnv } from './shared';
import { verifySession, fetchUserInfo } from './sso';

export interface StudentRow {
  id: string;
  email: string;
  full_name: string;
  declared_class: string | null;
  class: string | null;
  status: string; // 'validated' | 'pending' | 'disabled'
  must_change_password: number;
  created_at: string;
  validated_at: string | null;
  last_login_at: string | null;
  notes: string | null;
}

export interface ApprovedClass {
  scuola: string;
  classe: string;
  annoScolastico: string;
}

export interface SsoInfo {
  status: string;
  isSuperAdmin: boolean;
  approvedClasses: ApprovedClass[];
}

const STUDENT_COLS =
  'id, email, full_name, declared_class, class, status, must_change_password, created_at, validated_at, last_login_at, notes';

export function publicStudent(row: StudentRow) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    declaredClass: row.declared_class,
    class: row.class,
    status: row.status,
    mustChangePassword: false,
    createdAt: row.created_at,
    validatedAt: row.validated_at,
    lastLoginAt: row.last_login_at,
  };
}

/** Stato "studente" per la UI a partire dallo stato SSO + presenza di classi approvate. */
export function mapStatus(ssoStatus: string, hasApprovedClass: boolean): string {
  if (ssoStatus !== 'active') return 'disabled';
  return hasApprovedClass ? 'validated' : 'pending';
}

interface Identity {
  userId: string;
  email: string;
  name: string;
  status: string;
}

/** Upsert della proiezione `students` dall'identità SSO (una SCRITTURA). */
async function provisionStudent(env: SharedEnv, identity: Identity): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO students (id, email, full_name, declared_class, class, status, password_hash, must_change_password, created_at, last_login_at)
     VALUES (?, ?, ?, NULL, NULL, ?, 'sso', 0, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       email         = excluded.email,
       full_name     = excluded.full_name,
       last_login_at = excluded.last_login_at,
       status        = CASE WHEN ? = 'active' THEN students.status ELSE 'disabled' END`
  )
    .bind(
      identity.userId,
      identity.email,
      identity.name,
      identity.status === 'active' ? 'pending' : 'disabled',
      now,
      now,
      identity.status
    )
    .run();
}

function selectStudent(env: SharedEnv, id: string): Promise<StudentRow | null> {
  return env.DB.prepare(`SELECT ${STUDENT_COLS} FROM students WHERE id = ?`).bind(id).first<StudentRow>();
}

/**
 * verifySession + UPSERT della proiezione `students`. Usata SOLO da /api/auth/me
 * (una volta a load). Ritorna lo StudentRow oppure una Response 401.
 */
export async function loadStudentFromSession(request: Request, env: SharedEnv): Promise<StudentRow | Response> {
  const identity = await verifySession(request);
  if (!identity) return jsonError(401, 'Sessione non valida o scaduta. Effettua di nuovo l’accesso.');
  await provisionStudent(env, identity);
  const row = await selectStudent(env, identity.userId);
  if (!row) return jsonError(500, 'Errore di provisioning dello studente.');
  return row;
}

/**
 * verifySession + SELECT della proiezione, SENZA scrittura. Provisiona solo se la
 * riga manca (primo accesso). Pensata per gli endpoint frequenti (save/events/
 * recover/history): niente churn di scritture su `students`.
 */
export async function getStudentRow(request: Request, env: SharedEnv): Promise<StudentRow | Response> {
  const identity = await verifySession(request);
  if (!identity) return jsonError(401, 'Sessione non valida o scaduta. Effettua di nuovo l’accesso.');
  let row = await selectStudent(env, identity.userId);
  if (!row) {
    await provisionStudent(env, identity);
    row = await selectStudent(env, identity.userId);
  }
  if (!row) return jsonError(500, 'Errore di provisioning dello studente.');
  return row;
}

/** Dato fresco dall'IdP (stato + classi approvate + super-admin). null se irraggiungibile. */
export async function fetchSsoInfo(request: Request): Promise<SsoInfo | null> {
  const info = await fetchUserInfo(request);
  if (!info) return null;
  return {
    status: info.user.status,
    isSuperAdmin: info.user.isSuperAdmin,
    approvedClasses: info.approvedClasses ?? [],
  };
}

/** Classe canonica dello studente: la prima classe approvata sull'IdP. */
export function primaryApprovedClass(info: SsoInfo): string | null {
  return info.approvedClasses[0]?.classe ?? null;
}

/**
 * Aggiorna class+status della proiezione dal dato fresco IdP. Ritorna la classe
 * canonica (prima approvata) oppure quella già nota.
 */
export async function syncStudentFromInfo(env: SharedEnv, row: StudentRow, info: SsoInfo): Promise<string | null> {
  const klass = primaryApprovedClass(info) ?? row.class ?? null;
  const status = mapStatus(info.status, info.approvedClasses.length > 0);
  const validatedAt = status === 'validated' ? new Date().toISOString() : null;
  await env.DB.prepare(
    `UPDATE students SET class = ?, status = ?, validated_at = COALESCE(validated_at, ?) WHERE id = ?`
  ).bind(klass, status, validatedAt, row.id).run();
  row.class = klass;
  row.status = status;
  return klass;
}
