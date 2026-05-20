import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../_lib/shared';
import { rotateStudentPassword } from '../../_lib/settings';

interface Body { newPassword?: string }

const MIN_PASSWORD_LEN = 4;

/**
 * POST /api/admin/student-password — cambia la password studente.
 * Body: { newPassword: string }
 * Solo password docente.
 *
 * Comportamento: la password precedente resta valida per 60 minuti dopo
 * il cambio (grace period) per non disturbare le sessioni già in corso.
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  let body: Body;
  try { body = (await request.json()) as Body; } catch { return jsonError(400, 'JSON non valido.'); }

  const newPwd = (body?.newPassword ?? '').trim();
  if (newPwd.length < MIN_PASSWORD_LEN) {
    return jsonError(400, `La password deve essere lunga almeno ${MIN_PASSWORD_LEN} caratteri.`);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const ua = request.headers.get('user-agent') ?? '';

  try {
    await rotateStudentPassword(env, newPwd, { ip, userAgent: ua });
    return jsonOk({ ok: true, changedAt: new Date().toISOString() });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};
