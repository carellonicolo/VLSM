import { jsonError, jsonOk, type SharedEnv } from '../../../_lib/shared';
import { loadStudentFromSession } from '../../../_lib/student';

/**
 * GET /api/student/session/recover — trova la verifica 'in_progress' più recente
 * dello studente loggato (ultime 6 ore, deadline non scaduta da oltre 1 ora),
 * per riprenderla dopo un crash / cambio PC.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await loadStudentFromSession(request, env);
  if (auth instanceof Response) return auth;

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60_000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();

  try {
    const result = await env.DB.prepare(
      `SELECT id, student_name, student_class, categoria, verifica_id, verifica_titolo,
              difficolta, started_at, deadline_at, updated_at, duration_min,
              answers_json, eventi_focus_json, client_id
         FROM sessions
        WHERE student_id = ?
          AND categoria = 'verifica'
          AND state = 'in_progress'
          AND started_at >= ?
          AND deadline_at >= ?
        ORDER BY started_at DESC
        LIMIT 1`
    )
      .bind(auth.id, sixHoursAgo, oneHourAgo)
      .first<{
        id: string;
        student_name: string;
        student_class: string;
        categoria: string;
        verifica_id: string;
        verifica_titolo: string;
        difficolta: string | null;
        started_at: string;
        deadline_at: string;
        updated_at: string;
        duration_min: number;
        answers_json: string;
        eventi_focus_json: string;
        client_id: string;
      }>();

    if (!result) return jsonOk({ found: false });

    return jsonOk({
      found: true,
      session: {
        id: result.id,
        studente: { nome: result.student_name, classe: result.student_class },
        categoria: result.categoria,
        verificaId: result.verifica_id,
        verificaTitolo: result.verifica_titolo,
        difficolta: result.difficolta,
        startedAt: result.started_at,
        deadlineAt: result.deadline_at,
        updatedAt: result.updated_at,
        durationMin: result.duration_min,
        answers: JSON.parse(result.answers_json),
        eventiFocus: JSON.parse(result.eventi_focus_json),
        clientId: result.client_id,
      },
    });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
