import { jsonError, jsonOk } from '../../_lib/shared';
import { authenticateStudent, hashPassword, verifyPassword, type AuthEnv } from '../../_lib/auth';

interface Body {
  currentPassword?: string;
  newPassword?: string;
}

const MIN_PWD = 8;

/**
 * POST /api/auth/change-password — lo studente cambia la propria password.
 * Se l'account NON è in stato "must_change_password" serve la password attuale.
 * Dopo un reset del docente (must_change_password=1) la password attuale non è
 * richiesta (lo studente potrebbe non conoscerla).
 */
export const onRequestPost: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const auth = await authenticateStudent(request, env);
  if (auth instanceof Response) return auth;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }

  const newPassword = String(body.newPassword ?? '');
  if (newPassword.length < MIN_PWD) {
    return jsonError(400, `La nuova password deve avere almeno ${MIN_PWD} caratteri.`);
  }

  try {
    const rec = await env.DB
      .prepare(`SELECT password_hash, must_change_password FROM students WHERE id = ?`)
      .bind(auth.id)
      .first<{ password_hash: string; must_change_password: number }>();
    if (!rec) return jsonError(404, 'Account non trovato.');

    if (!rec.must_change_password) {
      const ok = await verifyPassword(String(body.currentPassword ?? ''), rec.password_hash);
      if (!ok) return jsonError(401, 'La password attuale non è corretta.');
    }

    const hash = await hashPassword(newPassword);
    await env.DB.prepare(`UPDATE students SET password_hash = ?, must_change_password = 0 WHERE id = ?`)
      .bind(hash, auth.id)
      .run();
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
