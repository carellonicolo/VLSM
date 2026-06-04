import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../../_lib/shared';

/**
 * GET    /api/admin/students/:id → profilo + storico completo dello studente.
 * DELETE /api/admin/students/:id → elimina l'account (le sue sessioni restano
 *                                  come 'legacy' con student_id azzerato).
 * Solo password docente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    const student = await env.DB.prepare(
      `SELECT id, email, full_name, declared_class, class, status, must_change_password,
              created_at, validated_at, last_login_at, notes
         FROM students WHERE id = ?`
    ).bind(id).first();
    if (!student) return jsonError(404, 'Studente non trovato.');

    const { results } = await env.DB.prepare(
      `SELECT id, categoria, verifica_id, verifica_titolo, difficolta, state,
              started_at, consegnato_at, updated_at, duration_min, voto30,
              motivo_consegna, annullata_motivo,
              json_array_length(eventi_focus_json) AS distrazioni_count,
              (SELECT COUNT(*) FROM session_events se
                WHERE se.session_id = sessions.id AND se.type = 'ammonizione') AS ammonizioni_count
         FROM sessions
        WHERE student_id = ?
        ORDER BY started_at DESC
        LIMIT 500`
    ).bind(id).all();

    return jsonOk({ student, sessions: results ?? [] });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequestDelete: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    await env.DB.prepare(`UPDATE sessions SET student_id = NULL WHERE student_id = ?`).bind(id).run();
    await env.DB.prepare(`DELETE FROM students WHERE id = ?`).bind(id).run();
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
