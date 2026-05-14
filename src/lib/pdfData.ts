import type { EsitoFinale, EventoFocus } from '../types/domain';

export interface EsitoSommario {
  schema: 1;
  nome: string;
  classe: string;
  categoria: EsitoFinale['categoria'];
  verificaId: string;
  verificaTitolo: string;
  voto30: number;
  voto10: number;
  durataMs: number;
  startedAt: string;
  consegnatoAt: string;
  motivoConsegna: EsitoFinale['motivoConsegna'];
  esercizi: { id: string; titolo: string; punteggio: number; puntiMax: number }[];
  eventiFocus: EventoFocus[];
}

export interface PdfEnvelope {
  schemaEnv: 2;
  payload: EsitoSommario;
  signature?: string;
  signedAt?: string;
}

const PREFIX = 'VLSM_DATA:';

export function buildSommario(esito: EsitoFinale): EsitoSommario {
  return {
    schema: 1,
    nome: esito.studente.nome,
    classe: esito.studente.classe,
    categoria: esito.categoria,
    verificaId: esito.verificaId,
    verificaTitolo: esito.verificaTitolo,
    voto30: esito.voto30,
    voto10: esito.voto10,
    durataMs: esito.durataMs,
    startedAt: esito.startedAt,
    consegnatoAt: esito.consegnatoAt,
    motivoConsegna: esito.motivoConsegna,
    esercizi: esito.esercizi.map((e) => ({
      id: e.esercizioId,
      titolo: e.titolo,
      punteggio: Math.round(e.punteggio * 10) / 10,
      puntiMax: e.puntiMax,
    })),
    eventiFocus: esito.eventiFocus ?? [],
  };
}

// Canonical JSON con chiavi ordinate per HMAC deterministico cross-runtime.
// Stessa implementazione lato Function: vedi functions/_lib/canonical.ts
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  const o = value as Record<string, unknown>;
  const keys = Object.keys(o).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(o[k])).join(',') + '}';
}

function utf8ToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function base64ToUtf8(s: string): string {
  return decodeURIComponent(escape(atob(s)));
}

export function encodeEnvelope(env: PdfEnvelope): string {
  return PREFIX + utf8ToBase64(JSON.stringify(env));
}

export function decodeEnvelope(s: string | undefined | null): PdfEnvelope | null {
  if (!s) return null;
  const idx = s.indexOf(PREFIX);
  if (idx === -1) return null;
  const payload = s.slice(idx + PREFIX.length).trim();
  try {
    const parsed = JSON.parse(base64ToUtf8(payload));
    if (parsed?.schemaEnv === 2 && parsed.payload?.schema === 1) {
      const env = parsed as PdfEnvelope;
      if (!Array.isArray(env.payload.eventiFocus)) env.payload.eventiFocus = [];
      return env;
    }
    if (parsed?.schema === 1 && typeof parsed.nome === 'string') {
      const sommario = parsed as EsitoSommario;
      if (!Array.isArray(sommario.eventiFocus)) sommario.eventiFocus = [];
      return { schemaEnv: 2, payload: sommario };
    }
    return null;
  } catch {
    return null;
  }
}
