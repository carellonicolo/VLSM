import { jsonError, jsonOk } from '../../../_lib/shared';
import { authenticateStudent, type AuthEnv } from '../../../_lib/auth';

/**
 * GET /api/student/session/events?since=<lastId> — canale comandi del docente.
 * Trova la verifica più recente dello studente loggato (iniziata nelle ultime
 * 6 ore) e restituisce:
 *   - lo stato attuale (per scoprire un eventuale 'annullata');
 *   - gli eventi (alert / ammonizione / annulla) con id > since.
 * Il client fa polling ogni pochi secondi durante la prova.
 */
export const onRequestGet: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const auth = await authenticateStudent(request, env);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const since = Math.max(0, Number(url.searchParams.get('since') ?? '0') || 0);
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60_000).toISOString();

  try {
    const session = await env.DB.prepare(
      `SELECT id, state, annullata_motivo
         FROM sessions
        WHERE student_id = ?
          AND categoria = 'verifica'
          AND started_at >= ?
        ORDER BY started_at DESC
        LIMIT 1`
    )
      .bind(auth.id, sixHoursAgo)
      .first<{ id: string; state: string; annullata_motivo: string | null }>();

    if (!session) {
      return jsonOk({ found: false, events: [] });
    }

    const { results } = await env.DB.prepare(
      `SELECT id, type, message, created_at
         FROM session_events
        WHERE session_id = ? AND id > ?
        ORDER BY id ASC`
    )
      .bind(session.id, since)
      .all<{ id: number; type: string; message: string | null; created_at: string }>();

    return jsonOk({
      found: true,
      sessionId: session.id,
      state: session.state,
      annullataMotivo: session.annullata_motivo,
      events: (results ?? []).map((e) => ({
        id: e.id,
        type: e.type,
        message: e.message,
        createdAt: e.created_at,
      })),
    });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
