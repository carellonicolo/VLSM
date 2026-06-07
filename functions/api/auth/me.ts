import { jsonError, jsonOk, type SharedEnv } from '../../_lib/shared';
import { loadStudentFromSession, fetchSsoInfo, syncStudentFromInfo, publicStudent } from '../../_lib/student';
import { getClassExam } from '../../_lib/classes';
import { getVerificaEnabled } from '../../_lib/settings';

/**
 * GET /api/auth/me — profilo dello studente loggato (via SSO) + stato esame.
 *   exam.enabledForClass → master globale && classe abilitata
 *   exam.available       → enabledForClass && studente attivo con classe approvata sull'IdP
 *
 * Qui si usa il dato fresco dell'IdP (fetchSsoInfo) per aggiornare classe/stato
 * della proiezione `students`: è chiamata all'avvio dell'app, non è frequente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const row = await loadStudentFromSession(request, env);
  if (row instanceof Response) return row;

  try {
    const info = await fetchSsoInfo(request);
    if (info) await syncStudentFromInfo(env, row, info);

    const [master, classExam] = await Promise.all([getVerificaEnabled(env), getClassExam(env, row.class)]);
    const enabledForClass = !!master && classExam.enabled;
    return jsonOk({
      student: publicStudent(row),
      exam: {
        enabledForClass,
        available: enabledForClass && row.status === 'validated',
        level: classExam.level,
      },
    });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
