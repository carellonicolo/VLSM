import type { EsitoFinale } from '../types/domain';

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
  };
}

function utf8ToBase64(s: string): string {
  return btoa(unescape(encodeURIComponent(s)));
}

function base64ToUtf8(s: string): string {
  return decodeURIComponent(escape(atob(s)));
}

export function encodeSommario(sommario: EsitoSommario): string {
  return PREFIX + utf8ToBase64(JSON.stringify(sommario));
}

export function decodeSommario(s: string | undefined | null): EsitoSommario | null {
  if (!s) return null;
  const idx = s.indexOf(PREFIX);
  if (idx === -1) return null;
  const payload = s.slice(idx + PREFIX.length).trim();
  try {
    const parsed = JSON.parse(base64ToUtf8(payload));
    if (parsed?.schema === 1 && typeof parsed.nome === 'string') return parsed as EsitoSommario;
    return null;
  } catch {
    return null;
  }
}
