import { jsonError, jsonOk } from '../../_lib/shared';
import {
  emailDomain,
  hashPassword,
  isValidSchoolEmail,
  normalizeEmail,
  normalizeName,
  publicStudent,
  randomId,
  signToken,
  type AuthEnv,
  type StudentRow,
} from '../../_lib/auth';

interface Body {
  email?: string;
  password?: string;
  fullName?: string;
  declaredClass?: string;
}

const MIN_PWD = 8;

/**
 * POST /api/auth/register — auto-registrazione studente.
 * L'account nasce 'pending': potrà fare esercitazioni ma NON verifiche
 * finché il docente non lo convalida (e gli assegna la classe).
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
  const fullName = normalizeName(body.fullName);
  const declaredClass = normalizeName(body.declaredClass);

  if (!email || !isValidSchoolEmail(email, env)) {
    return jsonError(400, `Usa la tua email scolastica @${emailDomain(env)}.`);
  }
  if (fullName.length < 3) return jsonError(400, 'Inserisci nome e cognome.');
  if (password.length < MIN_PWD) {
    return jsonError(400, `La password deve avere almeno ${MIN_PWD} caratteri.`);
  }

  try {
    const existing = await env.DB.prepare(`SELECT id FROM students WHERE email = ?`).bind(email).first();
    if (existing) return jsonError(409, 'Esiste già un account con questa email. Prova ad accedere.');

    const id = randomId();
    const now = new Date().toISOString();
    const hash = await hashPassword(password);

    await env.DB.prepare(
      `INSERT INTO students (id, email, full_name, declared_class, class, status, password_hash, must_change_password, created_at)
       VALUES (?, ?, ?, ?, NULL, 'pending', ?, 0, ?)`
    ).bind(id, email, fullName, declaredClass || null, hash, now).run();

    const token = await signToken(env, id);
    const row: StudentRow = {
      id, email, full_name: fullName, declared_class: declaredClass || null,
      class: null, status: 'pending', must_change_password: 0, created_at: now,
      validated_at: null, last_login_at: null, notes: null,
    };
    return jsonOk({ ok: true, token, student: publicStudent(row) });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
