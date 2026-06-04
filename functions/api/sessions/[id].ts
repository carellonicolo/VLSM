import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../_lib/shared';

/**
 * GET    /api/sessions/:id        → dettaglio
 * POST   /api/sessions/:id/reopen → torna a in_progress, estende la deadline
 * DELETE /api/sessions/:id        → cancella riga (cleanup manuale)
 *
 * Solo password docente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    const row = await env.DB.prepare(`SELECT * FROM sessions WHERE id = ?`).bind(id).first();
    if (!row) return jsonError(404, 'Sessione non trovata.');
    // Parsing dei campi JSON per comodità del client
    const r = row as Record<string, unknown>;

    // Interventi del docente (alert/ammonizione/annulla) registrati sulla sessione.
    const events = await env.DB.prepare(
      `SELECT id, type, message, created_at FROM session_events WHERE session_id = ? ORDER BY id ASC`
    ).bind(id).all<{ id: number; type: string; message: string | null; created_at: string }>();

    let studentEmail: string | null = null;
    if (r.student_id) {
      const st = await env.DB.prepare(`SELECT email FROM students WHERE id = ?`).bind(String(r.student_id)).first<{ email: string }>();
      studentEmail = st?.email ?? null;
    }

    return jsonOk({
      session: {
        ...r,
        student_email: studentEmail,
        answers: JSON.parse(String(r.answers_json ?? '{}')),
        eventiFocus: JSON.parse(String(r.eventi_focus_json ?? '[]')),
        esito: r.esito_json ? JSON.parse(String(r.esito_json)) : null,
        events: events.results ?? [],
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequestDelete: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

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
