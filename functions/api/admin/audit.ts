import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';

/**
 * GET /api/admin/audit?limit=100 — log delle modifiche settings.
 * Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') ?? '100')));

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, key, action, old_value, new_value, updated_at, updated_by_ip, user_agent
         FROM settings_audit
        ORDER BY id DESC
        LIMIT ?`
    ).bind(limit).all();
    return jsonOk({ entries: results ?? [] });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};
