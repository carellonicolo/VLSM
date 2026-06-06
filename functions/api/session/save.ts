import { jsonError, jsonOk, normalizeText, requireIdentity, sessionIdFor, type SharedEnv } from '../../_lib/shared';
import { getVerificaEnabled } from '../../_lib/settings';

interface SavePayload {
  clientId: string;
  studente: { nome: string; classe: string };
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
  // Campi popolati solo a consegna
  consegnatoAt?: string;
  esito?: unknown;
  voto30?: number;
  signature?: string;
  signedAt?: string;
  motivoConsegna?: 'volontaria' | 'timeout';
}

export const onRequestPost: PagesFunction<SharedEnv> = async ({ request, env }) => {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;

  let body: SavePayload;
  try {
    body = (await request.json()) as SavePayload;
  } catch {
    return jsonError(400, 'JSON non valido.');
  }
  if (!body || !body.studente?.classe || !body.verificaId || !body.startedAt) {
    return jsonError(400, 'Campi obbligatori mancanti.');
  }

  // Il NOME ufficiale è quello autenticato dall'SSO (non quello del payload):
  // garantisce che la verifica firmata porti l'identità reale dello studente.
  const nome = (identity.name && identity.name.trim()) || body.studente.nome || '';
  if (!nome) return jsonError(400, 'Identità senza nome: impossibile salvare.');

  // Se la modalità verifica è disabilitata, blocchiamo solo le NUOVE verifiche
  // (state='in_progress' senza esito precedente). Le sessioni esistenti possono
  // continuare a salvare normalmente fino a consegna.
  if (body.categoria === 'verifica' && body.state === 'in_progress') {
    const enabled = await getVerificaEnabled(env);
    if (!enabled) {
      const id = await sessionIdFor(nome, body.studente.classe, body.startedAt);
      const existing = await env.DB.prepare(`SELECT id FROM sessions WHERE id = ?`).bind(id).first();
      if (!existing) {
        return jsonError(403, 'Modalità verifica disattivata dal docente.');
      }
    }
  }

  const id = await sessionIdFor(nome, body.studente.classe, body.startedAt);
  const nameNorm = normalizeText(nome);
  const classNorm = normalizeText(body.studente.classe);
  const updatedAt = new Date().toISOString();
  const clientIp = request.headers.get('cf-connecting-ip') ?? '';
  const userAgent = request.headers.get('user-agent') ?? '';

  try {
    await env.DB.prepare(
      `INSERT INTO sessions (
         id, student_name, student_name_norm, student_class, student_class_norm,
         categoria, verifica_id, verifica_titolo, difficolta, state,
         started_at, deadline_at, consegnato_at, updated_at, duration_min,
         answers_json, eventi_focus_json, esito_json, voto30, signature, signed_at,
         client_id, client_user_agent, client_ip, motivo_consegna
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
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
         motivo_consegna    = excluded.motivo_consegna
      `
    )
      .bind(
        id,
        nome,
        nameNorm,
        body.studente.classe,
        classNorm,
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
        body.clientId,
        userAgent,
        clientIp,
        body.motivoConsegna ?? null
      )
      .run();

    return jsonOk({ ok: true, id, updatedAt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(500, `Errore DB: ${msg}`);
  }
};

export const onRequest: PagesFunction<SharedEnv> = () =>
  new Response('Method not allowed', { status: 405 });
