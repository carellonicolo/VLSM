import { jsonError, jsonOk, type SharedEnv } from '../../../_lib/shared';
import { loadStudentFromSession } from '../../../_lib/student';

/**
 * GET /api/student/session/:id — dettaglio completo di una prova dello studente
 * LOGGATO (risposte + esito + eventi), per la rigenerazione del PDF dal suo
 * storico. La riga è restituita solo se appartiene allo studente (student_id).
 *
 * NB: le route statiche (save, recover, events) hanno la precedenza su [id],
 * quindi questo handler intercetta solo gli id reali (sha256).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const auth = await loadStudentFromSession(request, env);
  if (auth instanceof Response) return auth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    const row = await env.DB.prepare(`SELECT * FROM sessions WHERE id = ? AND student_id = ?`)
      .bind(id, auth.id)
      .first();
    if (!row) return jsonError(404, 'Prova non trovata.');

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
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
