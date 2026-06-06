import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';

/**
 * GET /api/sessions/list?state=in_progress|consegnata|abbandonata|all
 * Lista tutte le sessioni filtrate per stato. Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const state = url.searchParams.get('state') ?? 'all';
  const limit = Math.min(500, Number(url.searchParams.get('limit') ?? '200'));

  let query = `SELECT id, student_name, student_class, categoria, verifica_id, verifica_titolo,
                      difficolta, state, started_at, deadline_at, consegnato_at, updated_at,
                      duration_min, voto30, signature IS NOT NULL AS signed, motivo_consegna,
                      client_id, client_user_agent, client_ip,
                      json_array_length(eventi_focus_json) AS distrazioni_count,
                      length(answers_json) AS answers_size
                 FROM sessions`;
  const binds: unknown[] = [];

  if (state !== 'all') {
    query += ` WHERE state = ?`;
    binds.push(state);
  }
  query += ` ORDER BY updated_at DESC LIMIT ?`;
  binds.push(limit);

  try {
    const { results } = await env.DB.prepare(query).bind(...binds).all();
    return jsonOk({ sessions: results ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () =>
  new Response('Method not allowed', { status: 405 });
