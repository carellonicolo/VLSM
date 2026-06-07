import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';
import { getSetting } from '../../_lib/settings';

/**
 * GET /api/admin/settings — settings applicative per la console docente.
 * Con l'SSO l'unica impostazione gestita qui è il master-switch delle verifiche.
 * Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    const verificaEnabled = (await getSetting(env, 'verifica_enabled')) || 'true';
    return jsonOk({ verificaEnabled: verificaEnabled === 'true' });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};
