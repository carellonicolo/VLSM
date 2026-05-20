import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../../_lib/shared';

interface ReopenBody {
  extendMinutes?: number;
}

/**
 * POST /api/sessions/:id/reopen
 * Body opzionale: { extendMinutes: 15 } → estende la deadline.
 * Setta state='in_progress' su una sessione consegnata.
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  let body: ReopenBody = {};
  try {
    body = ((await request.json()) as ReopenBody) ?? {};
  } catch {
    body = {};
  }
  const extend = Math.max(0, Math.min(180, Number(body.extendMinutes ?? 15)));
  const now = new Date();
  const newDeadline = new Date(now.getTime() + extend * 60_000).toISOString();

  try {
    const existing = await env.DB.prepare(`SELECT id FROM sessions WHERE id = ?`).bind(id).first();
    if (!existing) return jsonError(404, 'Sessione non trovata.');

    await env.DB.prepare(
      `UPDATE sessions
          SET state         = 'in_progress',
              consegnato_at = NULL,
              esito_json    = NULL,
              voto30        = NULL,
              signature     = NULL,
              signed_at     = NULL,
              motivo_consegna = NULL,
              deadline_at   = ?,
              updated_at    = ?
        WHERE id = ?`
    )
      .bind(newDeadline, now.toISOString(), id)
      .run();

    return jsonOk({ ok: true, deadlineAt: newDeadline });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () =>
  new Response('Method not allowed', { status: 405 });
