import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';
import { setSetting } from '../../_lib/settings';

interface Body { enabled?: boolean }

/**
 * PUT /api/admin/verifica-enabled — abilita o disabilita la modalità verifica.
 * Body: { enabled: boolean }
 * Solo password docente.
 */
export const onRequestPut: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  let body: Body;
  try { body = (await request.json()) as Body; } catch { return jsonError(400, 'JSON non valido.'); }
  if (typeof body?.enabled !== 'boolean') return jsonError(400, 'Campo `enabled` (boolean) richiesto.');

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const ua = request.headers.get('user-agent') ?? '';

  try {
    await setSetting(env, 'verifica_enabled', body.enabled ? 'true' : 'false', { ip, userAgent: ua });
    return jsonOk({ ok: true, verificaEnabled: body.enabled });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};
