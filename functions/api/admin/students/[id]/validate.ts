import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../../../_lib/shared';

interface Body {
  status?: 'validated' | 'pending' | 'rejected' | 'disabled';
  class?: string;
}

const ALLOWED = new Set(['validated', 'pending', 'rejected', 'disabled']);

/**
 * POST /api/admin/students/:id/validate
 * Body: { status, class }
 * Convalida (o cambia stato) di uno studente. Per status='validated' la classe
 * è obbligatoria: convalidare = approvare + confermare l'appartenenza alla classe.
 * Solo password docente.
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const unauth = await requireAuth(request, env, 'admin');
  if (unauth) return unauth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }

  const status = body.status ?? 'validated';
  if (!ALLOWED.has(status)) return jsonError(400, 'Stato non valido.');
  const klass = String(body.class ?? '').trim().replace(/\s+/g, ' ');
  if (status === 'validated' && !klass) {
    return jsonError(400, 'Per convalidare lo studente devi indicarne la classe.');
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const now = new Date().toISOString();

  try {
    const existing = await env.DB.prepare(`SELECT id FROM students WHERE id = ?`).bind(id).first();
    if (!existing) return jsonError(404, 'Studente non trovato.');

    if (status === 'validated') {
      await env.DB.prepare(
        `UPDATE students SET status='validated', class=?, validated_at=?, validated_by_ip=? WHERE id=?`
      ).bind(klass, now, ip, id).run();
    } else {
      // Mantiene la classe se passata; altrimenti la lascia invariata.
      if (klass) {
        await env.DB.prepare(`UPDATE students SET status=?, class=? WHERE id=?`).bind(status, klass, id).run();
      } else {
        await env.DB.prepare(`UPDATE students SET status=? WHERE id=?`).bind(status, id).run();
      }
    }
    return jsonOk({ ok: true, status, class: klass || null });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
