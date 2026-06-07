import { jsonError, jsonOk, normalizeText, sha256Hex, type SharedEnv } from '../../../_lib/shared';
import { loadStudentFromSession, fetchSsoInfo, primaryApprovedClass } from '../../../_lib/student';
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
 * loggato (via SSO). L'identità (nome) viene dal cookie SSO, NON dal client.
 *
 * Regole verifica:
 *  - nuova verifica → richiede account SSO attivo + classe approvata sull'IdP +
 *    master attivo + classe abilitata dal docente (controllo live solo qui);
 *  - sessione già 'annullata' dal docente → ogni save viene rifiutato (409);
 *  - esercitazioni → sempre consentite a qualunque studente loggato.
 *
 * I salvataggi successivi (sessione esistente) usano solo verifySession
 * (loadStudentFromSession): nessun round-trip all'IdP, niente perdita dati.
 */
export const onRequestPost: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const auth = await loadStudentFromSession(request, env);
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
  let studentClass = auth.class || auth.declared_class || '';
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

    // Gating: creazione di una NUOVA verifica → controllo live sull'IdP + classe.
    if (body.categoria === 'verifica' && body.state === 'in_progress' && !existing) {
      const info = await fetchSsoInfo(request);
      if (!info || info.status !== 'active') {
        return jsonError(403, 'Account non attivo. Contatta il docente.');
      }
      const approved = primaryApprovedClass(info);
      if (!approved) {
        return jsonError(403, 'Account non ancora abilitato: nessuna classe approvata dal docente.');
      }
      studentClass = approved; // la classe ufficiale della verifica è quella approvata sull'IdP
      const [master, classEnabled] = await Promise.all([
        getVerificaEnabled(env),
        isClassExamEnabled(env, approved),
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

export const onRequest: PagesFunction<SharedEnv> = () => new Response('Method not allowed', { status: 405 });
