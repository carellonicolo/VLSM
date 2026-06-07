import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../../_lib/shared';

interface Body {
  type?: 'alert' | 'ammonizione' | 'annulla';
  message?: string;
}

const ALLOWED = new Set(['alert', 'ammonizione', 'annulla']);

/**
 * POST /api/sessions/:id/intervene — intervento del docente su una prova.
 * Body: { type: 'alert'|'ammonizione'|'annulla', message }
 *  - alert       → messaggio momentaneo allo studente;
 *  - ammonizione → ammonizione registrata (compare su PDF/report);
 *  - annulla     → la prova viene interrotta: state='annullata' + motivo.
 * Lo studente riceve l'evento al successivo polling. Solo password docente.
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }
  const type = body.type ?? '';
  if (!ALLOWED.has(type)) return jsonError(400, 'Tipo intervento non valido.');
  const message = String(body.message ?? '').slice(0, 500);

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const now = new Date().toISOString();

  try {
    const session = await env.DB.prepare(`SELECT id, student_id, state FROM sessions WHERE id = ?`)
      .bind(id)
      .first<{ id: string; student_id: string | null; state: string }>();
    if (!session) return jsonError(404, 'Sessione non trovata.');

    await env.DB.prepare(
      `INSERT INTO session_events (session_id, student_id, type, message, created_at, created_by_ip)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, session.student_id, type, message || null, now, ip).run();

    if (type === 'annulla') {
      await env.DB.prepare(
        `UPDATE sessions SET state='annullata', annullata_motivo=?, updated_at=? WHERE id=?`
      ).bind(message || 'Prova interrotta dal docente.', now, id).run();
    }

    return jsonOk({ ok: true, type });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
