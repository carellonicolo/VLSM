import { jsonError, jsonOk, normalizeText, requireAuth, type SharedEnv } from '../../_lib/shared';

/**
 * GET /api/session/recover?nome=X&classe=Y
 * Trova la sessione 'in_progress' più recente per (nome, classe).
 * Filtri: started_at nelle ultime 6 ore, deadline non scaduta da più di 1 ora.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const unauth = await requireAuth(request, env, 'student');
  if (unauth) return unauth;

  const url = new URL(request.url);
  const nome = url.searchParams.get('nome') ?? '';
  const classe = url.searchParams.get('classe') ?? '';
  if (!nome || !classe) return jsonError(400, 'Parametri nome e classe obbligatori.');

  const nameNorm = normalizeText(nome);
  const classNorm = normalizeText(classe);

  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60_000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60_000).toISOString();

  try {
    const result = await env.DB.prepare(
      `SELECT id, student_name, student_class, categoria, verifica_id, verifica_titolo,
              difficolta, started_at, deadline_at, updated_at, duration_min,
              answers_json, eventi_focus_json, client_id, client_user_agent
         FROM sessions
        WHERE student_name_norm = ?
          AND student_class_norm = ?
          AND state = 'in_progress'
          AND started_at >= ?
          AND deadline_at >= ?
        ORDER BY started_at DESC
        LIMIT 1`
    )
      .bind(nameNorm, classNorm, sixHoursAgo, oneHourAgo)
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
        client_user_agent: string | null;
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
        previousClientUserAgent: result.client_user_agent,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () =>
  new Response('Method not allowed', { status: 405 });
