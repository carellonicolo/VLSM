import { jsonError, jsonOk, normalizeText, sha256Hex, type SharedEnv } from '../../../_lib/shared';
import { getStudentRow, fetchSsoInfo, primaryApprovedClass } from '../../../_lib/student';
import { isClassExamEnabled } from '../../../_lib/classes';
import { getVerificaEnabled } from '../../../_lib/settings';
import { gradeAndSign } from '../../../_lib/grade';
import type { Ammonizione } from '../../../../src/types/domain';

interface Env extends SharedEnv {
  VLSM_HMAC_SECRET?: string;
}

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
  motivoConsegna?: 'volontaria' | 'timeout';
  clientId?: string;
  // I campi voto30/esito/signature eventualmente inviati dal client sono IGNORATI:
  // il voto e la firma sono ricalcolati e generati esclusivamente lato server.
}

/** Dimensione massima delle risposte serializzate (anti-abuso storage D1). */
const MAX_ANSWERS_BYTES = 200_000;
/** Tetto alla durata: impedisce di persistere una deadline "infinita" via richiesta artefatta. */
const MAX_DURATION_MIN = 240;
/** Durata di default se il client non la fornisce. */
const DEFAULT_DURATION_MIN = 60;

function conflict(message: string, state: string): Response {
  return new Response(JSON.stringify({ error: message, state }), {
    status: 409,
    headers: { 'content-type': 'application/json' },
  });
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Ammonizioni AUTOREVOLI dalla tabella eventi (non dal client) per il sommario firmato. */
async function loadAmmonizioni(env: Env, sessionId: string): Promise<Ammonizione[]> {
  try {
    const { results } = await env.DB.prepare(
      `SELECT message, created_at FROM session_events WHERE session_id = ? AND type = 'ammonizione' ORDER BY id ASC`
    )
      .bind(sessionId)
      .all<{ message: string | null; created_at: string }>();
    return (results ?? []).map((r) => ({ at: r.created_at, message: r.message ?? '' }));
  } catch {
    return [];
  }
}

/**
 * POST /api/student/session/save — salva lo stato della sessione dello studente
 * loggato (via SSO). L'identità (nome) viene dal cookie SSO, NON dal client.
 *
 * INTEGRITÀ (voto/firma/tempo tutti autorevoli lato server):
 *  - il VOTO e l'ESITO di una verifica sono RICALCOLATI dal server dalle risposte
 *    inviate (mai fidandosi di voto30/esito del client) e FIRMATI dal server;
 *  - la DEADLINE è derivata dal server (started_at + durata, con tetto) e non può
 *    essere spinta all'infinito da una richiesta artefatta;
 *  - le TRANSIZIONI sono validate: una verifica non può nascere già 'consegnata'
 *    (deve passare dallo stato 'in_progress' che esegue il gate).
 *
 * Regole verifica:
 *  - nuova verifica → deve partire 'in_progress' + account SSO attivo + classe
 *    approvata sull'IdP + master attivo + classe abilitata dal docente;
 *  - sessione già 'annullata' dal docente → ogni save viene rifiutato (409);
 *  - esercitazioni → sempre consentite a qualunque studente loggato.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  // Guardia dimensione: rifiuta payload evidentemente sovradimensionati prima di leggerli.
  const declaredLen = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredLen) && declaredLen > MAX_ANSWERS_BYTES * 2) {
    return jsonError(413, 'Payload troppo grande.');
  }

  // Endpoint frequente (debounce/heartbeat): SELECT senza scrittura sulla proiezione.
  const auth = await getStudentRow(request, env);
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

  const answersJson = JSON.stringify(body.answers ?? {});
  if (answersJson.length > MAX_ANSWERS_BYTES) {
    return jsonError(413, 'Risposte troppo grandi.');
  }

  const isVerifica = body.categoria === 'verifica';
  const studentName = auth.full_name;
  let studentClass = auth.class || auth.declared_class || '';
  const id = await sha256Hex(`${auth.id}|${body.categoria}|${body.startedAt}`);

  try {
    const existing = await env.DB
      .prepare(`SELECT state, started_at, student_class FROM sessions WHERE id = ?`)
      .bind(id)
      .first<{ state: string; started_at: string; student_class: string | null }>();

    // Una prova annullata dal docente non può più essere modificata né rianimata.
    if (existing?.state === 'annullata') {
      return conflict('Prova interrotta dal docente.', 'annullata');
    }

    const creating = !existing;
    // Su una prova già esistente la classe resta quella fissata alla creazione
    // (coerente con ciò che è stato mostrato/salvato durante la prova).
    if (!creating && existing?.student_class) studentClass = existing.student_class;

    // --- Validazione transizioni + gate (solo verifiche) ---
    if (isVerifica) {
      if (creating && body.state !== 'in_progress') {
        // Blocca l'injection di una verifica "già consegnata" che scavalca il gate.
        return jsonError(400, 'Una verifica deve iniziare in modalità in corso.');
      }
      if (creating && body.state === 'in_progress') {
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
    }

    // --- Deadline autorevole (server): started + durata, con tetto anti-abuso. ---
    const startBase = existing?.started_at ?? body.startedAt;
    const startMs = Date.parse(startBase);
    const anchorMs = Number.isNaN(startMs) ? Date.now() : startMs;
    const durationMinAuth = clamp(Number(body.durationMin) || DEFAULT_DURATION_MIN, 1, MAX_DURATION_MIN);
    const deadlineAt = new Date(anchorMs + durationMinAuth * 60_000).toISOString();

    // --- Correzione + firma autorevoli SOLO alla consegna. ---
    let voto30: number | null = null;
    let esitoJson: string | null = null;
    let signature: string | null = null;
    let signedAt: string | null = null;
    let gradedForClient: { voto30: number; signature: string | null; signedAt: string | null; esito: unknown } | undefined;

    if (body.state === 'consegnata') {
      const ammonizioni = await loadAmmonizioni(env, id);
      const graded = await gradeAndSign(
        {
          verificaId: body.verificaId,
          answers: body.answers,
          studentName,
          studentClass,
          startedAt: startBase,
          consegnatoAt: body.consegnatoAt ?? new Date().toISOString(),
          motivoConsegna: body.motivoConsegna === 'timeout' ? 'timeout' : 'volontaria',
          eventiFocus: Array.isArray(body.eventiFocus) ? (body.eventiFocus as { startedAt: string; durataMs: number }[]) : [],
          ammonizioni,
        },
        env.VLSM_HMAC_SECRET
      );
      if (graded) {
        voto30 = graded.voto30;
        esitoJson = JSON.stringify(graded.esito);
        signature = graded.signature;
        signedAt = graded.signedAt;
        gradedForClient = {
          voto30: graded.voto30,
          signature: graded.signature,
          signedAt: graded.signedAt,
          esito: graded.esito,
        };
      }
      // Se graded === null (verifica non trovata / errore): consegna registrata
      // SENZA voto/firma (voto null) → il docente la vede e può correggere. Mai
      // si registra il voto del client.
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
        deadlineAt,
        body.consegnatoAt ?? null,
        updatedAt,
        durationMinAuth,
        answersJson,
        JSON.stringify(Array.isArray(body.eventiFocus) ? body.eventiFocus : []),
        esitoJson,
        voto30,
        signature,
        signedAt,
        body.clientId ?? auth.id,
        userAgent,
        clientIp,
        body.motivoConsegna ?? null
      )
      .run();

    return jsonOk({ ok: true, id, updatedAt, deadlineAt, graded: gradedForClient });
  } catch (e) {
    return jsonError(500, `Errore DB: ${e instanceof Error ? e.message : String(e)}`);
  }
};

export const onRequest: PagesFunction<Env> = () => new Response('Method not allowed', { status: 405 });
