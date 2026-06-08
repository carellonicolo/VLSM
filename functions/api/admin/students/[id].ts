import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../../_lib/shared';
import { fetchIdpRoster, primaryClassOf, studentStatusOf } from '../../../_lib/idp';

/**
 * GET /api/admin/students/:id → profilo + storico verifiche.
 * Profilo dal roster IdP (così appare anche chi non ha mai aperto VLSM), con
 * fallback alla proiezione locale. Lo storico è dato dalle sessioni VLSM.
 * Solo docente (super-admin SSO). Gestione account: sull'IdP.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ params, request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  const id = String(params.id ?? '');
  if (!id) return jsonError(400, 'id mancante.');

  try {
    let student: unknown = null;
    const roster = await fetchIdpRoster(request);
    if (roster) {
      const u = roster.find((x) => x.id === id);
      if (u) {
        student = {
          id: u.id,
          email: u.email,
          full_name: u.name,
          declared_class: null,
          class: primaryClassOf(u),
          status: studentStatusOf(u),
          must_change_password: 0,
          created_at: u.createdAt,
          validated_at: null,
          last_login_at: u.lastLoginAt,
          notes: null,
        };
      }
    }
    if (!student) {
      student = await env.DB.prepare(
        `SELECT id, email, full_name, declared_class, class, status, must_change_password,
                created_at, validated_at, last_login_at, notes
           FROM students WHERE id = ?`
      ).bind(id).first();
    }
    if (!student) return jsonError(404, 'Studente non trovato.');

    const { results } = await env.DB.prepare(
      `SELECT id, categoria, verifica_id, verifica_titolo, difficolta, state,
              started_at, consegnato_at, updated_at, duration_min, voto30,
              motivo_consegna, annullata_motivo,
              json_array_length(eventi_focus_json) AS distrazioni_count,
              (SELECT COUNT(*) FROM session_events se
                WHERE se.session_id = sessions.id AND se.type = 'ammonizione') AS ammonizioni_count
         FROM sessions
        WHERE student_id = ?
        ORDER BY started_at DESC
        LIMIT 500`
    ).bind(id).all();

    return jsonOk({ student, sessions: results ?? [] });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
