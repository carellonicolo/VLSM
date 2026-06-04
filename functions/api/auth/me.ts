import { jsonError, jsonOk } from '../../_lib/shared';
import { authenticateStudent, publicStudent, type AuthEnv } from '../../_lib/auth';
import { isClassExamEnabled } from '../../_lib/classes';
import { getVerificaEnabled } from '../../_lib/settings';

/**
 * GET /api/auth/me — profilo dello studente loggato + stato esame.
 *   exam.enabledForClass → master globale && classe abilitata (a prescindere dalla convalida)
 *   exam.available       → enabledForClass && studente validato (può davvero iniziare)
 */
export const onRequestGet: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const auth = await authenticateStudent(request, env);
  if (auth instanceof Response) return auth;

  try {
    const [master, classEnabled] = await Promise.all([
      getVerificaEnabled(env),
      isClassExamEnabled(env, auth.class),
    ]);
    const enabledForClass = !!master && classEnabled;
    return jsonOk({
      student: publicStudent(auth),
      exam: {
        enabledForClass,
        available: enabledForClass && auth.status === 'validated',
      },
    });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
