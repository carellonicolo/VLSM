import { jsonError, jsonOk, type SharedEnv } from '../../_lib/shared';
import { loadStudentFromSession } from '../../_lib/student';

/**
 * GET /api/student/history — storico completo (verifiche + esercitazioni)
 * dello studente loggato, per la dashboard "andamento". Le statistiche
 * (medie, trend) vengono calcolate lato client da questa lista.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await loadStudentFromSession(request, env);
  if (auth instanceof Response) return auth;

  try {
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
    )
      .bind(auth.id)
      .all();

    return jsonOk({ sessions: results ?? [] });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
