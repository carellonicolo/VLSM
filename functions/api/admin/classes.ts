import { jsonError, jsonOk, requireSuperAdmin, type SharedEnv } from '../../_lib/shared';
import { setClassExam } from '../../_lib/classes';
import { fetchIdpRoster } from '../../_lib/idp';

const ALLOWED_LEVELS = new Set(['Base', 'Media', 'Alta', 'Esperta', 'random', 'student']);

/** Stato esame (enabled + livello) per classe. */
async function examStateMaps(env: SharedEnv): Promise<{ enabled: Map<string, number>; level: Map<string, string | null> }> {
  const enabled = new Map<string, number>();
  const level = new Map<string, string | null>();
  try {
    const rows = await env.DB.prepare(`SELECT class, enabled, exam_level FROM class_exam_state`).all<{ class: string; enabled: number; exam_level: string | null }>();
    for (const r of rows.results ?? []) {
      enabled.set(r.class, r.enabled);
      level.set(r.class, r.exam_level ?? null);
    }
  } catch {
    // Colonna exam_level non ancora presente (migrazione 0004).
    const rows = await env.DB.prepare(`SELECT class, enabled FROM class_exam_state`).all<{ class: string; enabled: number }>();
    for (const r of rows.results ?? []) enabled.set(r.class, r.enabled);
  }
  return { enabled, level };
}

/** Verifiche in corso per classe (dalle sessioni VLSM). */
async function inProgressByClass(env: SharedEnv): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const res = await env.DB.prepare(
      `SELECT student_class AS c, COUNT(*) AS n FROM sessions WHERE categoria='verifica' AND state='in_progress' GROUP BY student_class`
    ).all<{ c: string; n: number }>();
    for (const r of res.results ?? []) map.set(r.c, r.n);
  } catch {
    /* nessuna sessione */
  }
  return map;
}

/**
 * GET /api/admin/classes — elenco classi con stato "esame attivo" e contatori.
 * Sorgente primaria: classi dell'IdP (iscrizioni reali) ∪ classi con esame già
 * configurato. Fallback: classi degli studenti già visti localmente.
 * Solo docente (super-admin SSO).
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await requireSuperAdmin(request);
  if (auth instanceof Response) return auth;

  try {
    const { enabled: enabledMap, level: levelMap } = await examStateMaps(env);
    const inProgress = await inProgressByClass(env);
    const classes = new Set<string>(enabledMap.keys());

    const roster = await fetchIdpRoster(request);

    if (roster) {
      const totByClass = new Map<string, number>();
      const validByClass = new Map<string, number>();
      for (const u of roster) {
        if (u.isSuperAdmin) continue;
        const seen = new Set<string>();
        for (const e of u.enrollments) {
          if (!e.classe || seen.has(e.classe)) continue;
          seen.add(e.classe);
          classes.add(e.classe);
          totByClass.set(e.classe, (totByClass.get(e.classe) ?? 0) + 1);
          if (e.approved && u.status === 'active') validByClass.set(e.classe, (validByClass.get(e.classe) ?? 0) + 1);
        }
      }
      const list = Array.from(classes)
        .sort((a, b) => a.localeCompare(b, 'it'))
        .map((c) => ({
          class: c,
          examEnabled: (enabledMap.get(c) ?? 0) === 1,
          examLevel: levelMap.get(c) ?? null,
          nValidati: validByClass.get(c) ?? 0,
          nTotali: totByClass.get(c) ?? 0,
          nInCorso: inProgress.get(c) ?? 0,
        }));
      return jsonOk({ classes: list, source: 'idp' });
    }

    // ---- Fallback locale ----
    const fromStudents = await env.DB.prepare(`SELECT class AS c FROM students WHERE class IS NOT NULL AND class <> ''`).all<{ c: string }>();
    for (const r of fromStudents.results ?? []) classes.add(r.c);
    const counts = await env.DB.prepare(
      `SELECT class AS c, status, COUNT(*) AS n FROM students WHERE class IS NOT NULL AND class <> '' GROUP BY class, status`
    ).all<{ c: string; status: string; n: number }>();
    const validatedByClass = new Map<string, number>();
    const totalByClass = new Map<string, number>();
    for (const r of counts.results ?? []) {
      totalByClass.set(r.c, (totalByClass.get(r.c) ?? 0) + r.n);
      if (r.status === 'validated') validatedByClass.set(r.c, (validatedByClass.get(r.c) ?? 0) + r.n);
    }
    const list = Array.from(classes)
      .sort((a, b) => a.localeCompare(b, 'it'))
      .map((c) => ({
        class: c,
        examEnabled: (enabledMap.get(c) ?? 0) === 1,
        examLevel: levelMap.get(c) ?? null,
        nValidati: validatedByClass.get(c) ?? 0,
        nTotali: totalByClass.get(c) ?? 0,
        nInCorso: inProgress.get(c) ?? 0,
      }));
    return jsonOk({ classes: list, source: 'local' });
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
