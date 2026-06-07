import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';

/**
 * GET /api/admin/students?status=&class= — elenco studenti per il docente.
 * Gli account 'pending' (in attesa di convalida) vengono mostrati per primi.
 * Solo password docente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const klass = url.searchParams.get('class') ?? '';

  const where: string[] = [];
  const binds: unknown[] = [];
  if (status !== 'all') {
    where.push('status = ?');
    binds.push(status);
  }
  if (klass) {
    where.push('class = ?');
    binds.push(klass);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, email, full_name, declared_class, class, status, must_change_password,
              created_at, validated_at, last_login_at,
              (SELECT COUNT(*) FROM sessions s
                WHERE s.student_id = students.id AND s.categoria = 'verifica' AND s.state = 'consegnata') AS n_verifiche,
              (SELECT COUNT(*) FROM sessions s
                WHERE s.student_id = students.id AND s.categoria = 'esercitazione') AS n_esercitazioni,
              (SELECT COUNT(*) FROM sessions s
                WHERE s.student_id = students.id AND s.categoria = 'verifica' AND s.state = 'in_progress') AS n_in_corso
         FROM students
         ${whereSql}
        ORDER BY (status = 'pending') DESC, created_at DESC
        LIMIT 1000`
    )
      .bind(...binds)
      .all();
    return jsonOk({ students: results ?? [] });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
