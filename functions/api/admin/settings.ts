import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../_lib/shared';
import { getSetting } from '../../_lib/settings';

/**
 * GET /api/admin/settings — restituisce settings attuali (senza esporre le password).
 * Solo password docente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  try {
    const verificaEnabled = (await getSetting(env, 'verifica_enabled')) || 'true';
    const studentPasswordSet = !!(await getSetting(env, 'student_password'));
    const studentPasswordChangedAt = await getSetting(env, 'student_password_changed_at');
    const studentPasswordPreviousSet = !!(await getSetting(env, 'student_password_previous'));

    let gracePeriodValid = false;
    let gracePeriodEndsAt = '';
    if (studentPasswordPreviousSet && studentPasswordChangedAt) {
      const endMs = new Date(studentPasswordChangedAt).getTime() + 60 * 60_000;
      gracePeriodValid = Date.now() < endMs;
      if (gracePeriodValid) gracePeriodEndsAt = new Date(endMs).toISOString();
    }

    return jsonOk({
      verificaEnabled: verificaEnabled === 'true',
      studentPasswordSet,
      studentPasswordChangedAt,
      gracePeriodValid,
      gracePeriodEndsAt,
    });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};
