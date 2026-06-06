import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';

/**
 * GET    /api/sessions/:id        → dettaglio
 * POST   /api/sessions/:id/reopen → torna a in_progress, estende la deadline
 * DELETE /api/sessions/:id        → cancella riga (cleanup manuale)
 *
 * Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    const row = await env.DB.prepare(`SELECT * FROM sessions WHERE id = ?`).bind(id).first();
    if (!row) return jsonError(404, 'Sessione non trovata.');
    // Parsing dei campi JSON per comodità del client
    const r = row as Record<string, unknown>;
    return jsonOk({
      session: {
        ...r,
        answers: JSON.parse(String(r.answers_json ?? '{}')),
        eventiFocus: JSON.parse(String(r.eventi_focus_json ?? '[]')),
        esito: r.esito_json ? JSON.parse(String(r.esito_json)) : null,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequestDelete: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    await env.DB.prepare(`DELETE FROM sessions WHERE id = ?`).bind(id).run();
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};
