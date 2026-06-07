import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';
import { setClassExam } from '../../_lib/classes';

const ALLOWED_LEVELS = new Set(['Base', 'Media', 'Alta', 'Esperta', 'random', 'student']);

/**
 * GET /api/admin/classes — elenco classi con stato "esame attivo" e contatori.
 * PUT /api/admin/classes  body { class, enabled } — abilita/disabilita l'esame
 *                         per una singola classe.
 * Solo password docente.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    // Classi note: da studenti (classe confermata) ∪ stato esame già impostato.
    const fromStudents = await env.DB.prepare(
      `SELECT class AS c FROM students WHERE class IS NOT NULL AND class <> ''`
    ).all<{ c: string }>();
    const fromState = await env.DB.prepare(`SELECT class AS c FROM class_exam_state`).all<{ c: string }>();

    const classes = new Set<string>();
    for (const r of fromStudents.results ?? []) classes.add(r.c);
    for (const r of fromState.results ?? []) classes.add(r.c);

    const enabledMap = new Map<string, number>();
    const levelMap = new Map<string, string | null>();
    try {
      const rows = await env.DB.prepare(`SELECT class, enabled, exam_level FROM class_exam_state`).all<{ class: string; enabled: number; exam_level: string | null }>();
      for (const r of rows.results ?? []) {
        enabledMap.set(r.class, r.enabled);
        levelMap.set(r.class, r.exam_level ?? null);
      }
    } catch {
      // Colonna exam_level non ancora presente (migrazione 0004).
      const rows = await env.DB.prepare(`SELECT class, enabled FROM class_exam_state`).all<{ class: string; enabled: number }>();
      for (const r of rows.results ?? []) enabledMap.set(r.class, r.enabled);
    }

    // Contatori studenti per classe e stato.
    const counts = await env.DB.prepare(
      `SELECT class AS c, status, COUNT(*) AS n FROM students
        WHERE class IS NOT NULL AND class <> '' GROUP BY class, status`
    ).all<{ c: string; status: string; n: number }>();
    const validatedByClass = new Map<string, number>();
    const totalByClass = new Map<string, number>();
    for (const r of counts.results ?? []) {
      totalByClass.set(r.c, (totalByClass.get(r.c) ?? 0) + r.n);
      if (r.status === 'validated') validatedByClass.set(r.c, (validatedByClass.get(r.c) ?? 0) + r.n);
    }

    // Verifiche in corso per classe.
    const inProgress = await env.DB.prepare(
      `SELECT student_class AS c, COUNT(*) AS n FROM sessions
        WHERE categoria='verifica' AND state='in_progress' GROUP BY student_class`
    ).all<{ c: string; n: number }>();
    const inProgressByClass = new Map<string, number>();
    for (const r of inProgress.results ?? []) inProgressByClass.set(r.c, r.n);

    const list = Array.from(classes)
      .sort((a, b) => a.localeCompare(b, 'it'))
      .map((c) => ({
        class: c,
        examEnabled: (enabledMap.get(c) ?? 0) === 1,
        examLevel: levelMap.get(c) ?? null,
        nValidati: validatedByClass.get(c) ?? 0,
        nTotali: totalByClass.get(c) ?? 0,
        nInCorso: inProgressByClass.get(c) ?? 0,
      }));

    return jsonOk({ classes: list });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequestPut: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  let body: { class?: string; enabled?: boolean; level?: string };
  try {
    body = (await request.json()) as { class?: string; enabled?: boolean; level?: string };
  } catch {
    return jsonError(400, 'JSON non valido.');
  }
  const klass = String(body.class ?? '').trim().replace(/\s+/g, ' ');
  if (!klass) return jsonError(400, 'Campo `class` richiesto.');
  if (typeof body.enabled !== 'boolean') return jsonError(400, 'Campo `enabled` (boolean) richiesto.');
  let level: string | null = null;
  if (body.level != null && body.level !== '') {
    if (!ALLOWED_LEVELS.has(body.level)) return jsonError(400, 'Livello esame non valido.');
    level = body.level;
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  try {
    await setClassExam(env, klass, body.enabled, level, { ip });
    return jsonOk({ ok: true, class: klass, examEnabled: body.enabled, examLevel: level });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
