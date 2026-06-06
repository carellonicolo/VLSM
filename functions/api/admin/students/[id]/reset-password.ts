import { jsonError, jsonOk, requireAuth, type SharedEnv } from '../../../../_lib/shared';
import { hashPassword, type AuthEnv } from '../../../../_lib/auth';

interface Body {
  newPassword?: string;
}

const MIN_PWD = 8;

/**
 * POST /api/admin/students/:id/reset-password
 * Body: { newPassword }
 * Il docente reimposta la password dello studente (es. password dimenticata).
 * Lo studente sarà invitato a cambiarla al prossimo accesso (must_change_password=1).
 * Solo password docente.
 */
export const onRequestPost: PagesFunction<AuthEnv> = async ({ params, request, env }) => {
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
  const newPassword = String(body.newPassword ?? '');
  if (newPassword.length < MIN_PWD) {
    return jsonError(400, `La password deve avere almeno ${MIN_PWD} caratteri.`);
  }

  try {
    const existing = await env.DB.prepare(`SELECT id FROM students WHERE id = ?`).bind(id).first();
    if (!existing) return jsonError(404, 'Studente non trovato.');
    const hash = await hashPassword(newPassword);
    await env.DB.prepare(`UPDATE students SET password_hash=?, must_change_password=1 WHERE id=?`)
      .bind(hash, id)
      .run();
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
