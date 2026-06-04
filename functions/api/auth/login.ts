import { jsonError, jsonOk } from '../../_lib/shared';
import { normalizeEmail, publicStudent, signToken, verifyPassword, type AuthEnv, type StudentRow } from '../../_lib/auth';

interface Body {
  email?: string;
  password?: string;
}

/**
 * POST /api/auth/login — accesso studente con email + password.
 * Risposta: { ok, token, student } oppure 401/403.
 */
export const onRequestPost: PagesFunction<AuthEnv> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');
  if (!email || !password) return jsonError(400, 'Email e password obbligatorie.');

  try {
    const row = await env.DB
      .prepare(`SELECT * FROM students WHERE email = ?`)
      .bind(email)
      .first<StudentRow & { password_hash: string }>();

    // Risposta volutamente identica per email inesistente o password errata.
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return jsonError(401, 'Email o password non corretti.');
    }
    if (row.status === 'disabled' || row.status === 'rejected') {
      return jsonError(403, 'Account disabilitato. Contatta il docente.');
    }

    const now = new Date().toISOString();
    await env.DB.prepare(`UPDATE students SET last_login_at = ? WHERE id = ?`).bind(now, row.id).run();

    const token = await signToken(env, row.id);
    return jsonOk({ ok: true, token, student: publicStudent({ ...row, last_login_at: now }) });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
