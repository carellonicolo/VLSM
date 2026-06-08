import { jsonError, jsonOk, normalizeText, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';
import { fetchIdpRoster, primaryClassOf, studentStatusOf } from '../../_lib/idp';

interface SessionCounts {
  n_verifiche: number;
  n_esercitazioni: number;
  n_in_corso: number;
}

/** Conteggi prove per studente (student_id) dalle sessioni VLSM. */
async function sessionCounts(env: SharedEnv): Promise<Map<string, SessionCounts>> {
  const map = new Map<string, SessionCounts>();
  try {
    const res = await env.DB.prepare(
      `SELECT student_id AS sid,
              SUM(CASE WHEN categoria='verifica' AND state='consegnata' THEN 1 ELSE 0 END) AS n_verifiche,
              SUM(CASE WHEN categoria='esercitazione' THEN 1 ELSE 0 END) AS n_esercitazioni,
              SUM(CASE WHEN categoria='verifica' AND state='in_progress' THEN 1 ELSE 0 END) AS n_in_corso
         FROM sessions
        WHERE student_id IS NOT NULL
        GROUP BY student_id`
    ).all<{ sid: string; n_verifiche: number; n_esercitazioni: number; n_in_corso: number }>();
    for (const r of res.results ?? []) {
      map.set(r.sid, { n_verifiche: r.n_verifiche, n_esercitazioni: r.n_esercitazioni, n_in_corso: r.n_in_corso });
    }
  } catch {
    /* tabella sessions assente → conteggi a zero */
  }
  return map;
}

/**
 * GET /api/admin/students?status=&class= — elenco studenti per il docente.
 * Sorgente primaria: roster dell'IdP (tutti gli studenti registrati/approvati,
 * a prescindere dall'accesso a VLSM). Fallback: proiezione locale `students`.
 * Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? 'all';
  const klass = url.searchParams.get('class') ?? '';
  const klassNorm = normalizeText(klass);

  const roster = await fetchIdpRoster(request);

  // ---- Sorgente IdP (tempo reale) ----
  if (roster) {
    const counts = await sessionCounts(env);
    const students = roster
      .filter((u) => !u.isSuperAdmin)
      .map((u) => {
        const c = counts.get(u.id);
        return {
          id: u.id,
          email: u.email,
          full_name: u.name,
          declared_class: null as string | null,
          class: primaryClassOf(u),
          status: studentStatusOf(u),
          must_change_password: 0,
          created_at: u.createdAt,
          validated_at: null as string | null,
          last_login_at: u.lastLoginAt,
          n_verifiche: c?.n_verifiche ?? 0,
          n_esercitazioni: c?.n_esercitazioni ?? 0,
          n_in_corso: c?.n_in_corso ?? 0,
        };
      })
      .filter((s) => (status === 'all' || s.status === status) && (!klass || normalizeText(s.class ?? '') === klassNorm))
      .sort((a, b) => {
        // i 'pending' (senza classe approvata) per primi, poi per registrazione desc
        if ((a.status === 'pending') !== (b.status === 'pending')) return a.status === 'pending' ? -1 : 1;
        return b.created_at.localeCompare(a.created_at);
      });
    return jsonOk({ students, source: 'idp' });
  }

  // ---- Fallback: proiezione locale (IdP irraggiungibile) ----
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
    return jsonOk({ students: results ?? [], source: 'local' });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
