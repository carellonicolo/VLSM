import { jsonError, jsonOk, normalizeText, sha256Hex } from '../../../_lib/shared';
import { authenticateStudent, type AuthEnv } from '../../../_lib/auth';
import { isClassExamEnabled } from '../../../_lib/classes';
import { getVerificaEnabled } from '../../../_lib/settings';

interface SavePayload {
  categoria: 'verifica' | 'esercitazione';
  verificaId: string;
  verificaTitolo: string;
  difficolta?: string;
  startedAt: string;
  deadlineAt: string;
  durationMin: number;
  answers: unknown;
  eventiFocus: unknown[];
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  consegnatoAt?: string;
  esito?: unknown;
  voto30?: number;
  signature?: string;
  signedAt?: string;
  motivoConsegna?: 'volontaria' | 'timeout';
  clientId?: string;
}

function conflict(message: string, state: string): Response {
  return new Response(JSON.stringify({ error: message, state }), {
    status: 409,
    headers: { 'content-type': 'application/json' },
  });
}

/**
 * POST /api/student/session/save — salva lo stato della sessione dello studente
 * loggato. L'identità (nome/classe) viene dall'account, NON dal client.
 *
 * Regole verifica:
 *  - nuova verifica → richiede studente 'validated' + master attivo + classe abilitata;
 *  - sessione già 'annullata' dal docente → ogni save viene rifiutato (409).
 *  - esercitazioni → sempre consentite a qualunque studente loggato.
 */
export const onRequestPost: PagesFunction<AuthEnv> = async ({ request, env }) => {
  const auth = await authenticateStudent(request, env);
  if (auth instanceof Response) return auth;

  let body: SavePayload;
  try {
    body = (await request.json()) as SavePayload;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }
  if (!body?.verificaId || !body.startedAt || !body.categoria) {
    return jsonError(400, 'Campi obbligatori mancanti.');
  }

  const studentName = auth.full_name;
  const studentClass = auth.class || auth.declared_class || '';
  const id = await sha256Hex(`${auth.id}|${body.categoria}|${body.startedAt}`);

  try {
    const existing = await env.DB
      .prepare(`SELECT state FROM sessions WHERE id = ?`)
      .bind(id)
      .first<{ state: string }>();

    // Una prova annullata dal docente non può più essere modificata né rianimata.
    if (existing?.state === 'annullata') {
      return conflict('Prova interrotta dal docente.', 'annullata');
    }

    // Gating: creazione di una NUOVA verifica.
    if (body.categoria === 'verifica' && body.state === 'in_progress' && !existing) {
      if (auth.status !== 'validated') {
        return jsonError(403, 'Account non ancora convalidato dal docente.');
      }
      const [master, classEnabled] = await Promise.all([
        getVerificaEnabled(env),
        isClassExamEnabled(env, auth.class),
      ]);
      if (!master || !classEnabled) {
        return jsonError(403, 'La modalità verifica non è attiva per la tua classe.');
      }
    }

    const updatedAt = new Date().toISOString();
    const clientIp = request.headers.get('cf-connecting-ip') ?? '';
    const userAgent = request.headers.get('user-agent') ?? '';

    await env.DB.prepare(
      `INSERT INTO sessions (
         id, student_id, student_name, student_name_norm, student_class, student_class_norm,
         categoria, verifica_id, verifica_titolo, difficolta, state,
         started_at, deadline_at, consegnato_at, updated_at, duration_min,
         answers_json, eventi_focus_json, esito_json, voto30, signature, signed_at,
         client_id, client_user_agent, client_ip, motivo_consegna
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         student_id         = excluded.student_id,
         state              = excluded.state,
         deadline_at        = excluded.deadline_at,
         consegnato_at      = excluded.consegnato_at,
         updated_at         = excluded.updated_at,
         duration_min       = excluded.duration_min,
         answers_json       = excluded.answers_json,
         eventi_focus_json  = excluded.eventi_focus_json,
         esito_json         = excluded.esito_json,
         voto30             = excluded.voto30,
         signature          = excluded.signature,
         signed_at          = excluded.signed_at,
         client_id          = excluded.client_id,
         client_user_agent  = excluded.client_user_agent,
         client_ip          = excluded.client_ip,
         motivo_consegna    = excluded.motivo_consegna`
    )
      .bind(
        id,
        auth.id,
        studentName,
        normalizeText(studentName),
        studentClass,
        normalizeText(studentClass),
        body.categoria,
        body.verificaId,
        body.verificaTitolo,
        body.difficolta ?? null,
        body.state,
        body.startedAt,
        body.deadlineAt,
        body.consegnatoAt ?? null,
        updatedAt,
        body.durationMin,
        JSON.stringify(body.answers ?? {}),
        JSON.stringify(body.eventiFocus ?? []),
        body.esito ? JSON.stringify(body.esito) : null,
        body.voto30 ?? null,
        body.signature ?? null,
        body.signedAt ?? null,
        body.clientId ?? auth.id,
        userAgent,
        clientIp,
        body.motivoConsegna ?? null
      )
      .run();

    return jsonOk({ ok: true, id, updatedAt });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<AuthEnv> = () => new Response('Method not allowed', { status: 405 });
