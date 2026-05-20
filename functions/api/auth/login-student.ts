import { jsonError, jsonOk, type SharedEnv } from '../../_lib/shared';
import { getStudentAuth, getVerificaEnabled } from '../../_lib/settings';

interface LoginBody { password?: string }

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * POST /api/auth/login-student — valida la password dello studente.
 * Accetta SOLO la password corrente (non la previous in grace period):
 * un login fresh deve usare la nuova password.
 *
 * Risposta:
 *  - 200 { ok: true, verificaEnabled }
 *  - 401 { ok: false, error }
 *  - 403 { ok: false, error: 'verifica disattivata' }
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ request, env }) => {
  let body: LoginBody;
  try { body = (await request.json()) as LoginBody; } catch { return jsonError(400, 'JSON non valido.'); }
  const provided = body?.password ?? '';

  const auth = await getStudentAuth(env);
  if (!auth.current) return jsonError(503, 'Password studente non configurata sul server.');
  if (!constantTimeEqual(provided, auth.current)) {
    return jsonError(401, 'Password non valida.');
  }

  const verificaEnabled = await getVerificaEnabled(env);
  if (!verificaEnabled) {
    return jsonError(403, 'Modalità verifica temporaneamente disattivata.');
  }

  return jsonOk({ ok: true, verificaEnabled });
};
