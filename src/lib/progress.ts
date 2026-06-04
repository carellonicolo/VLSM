/**
 * Calcolo statistiche per la dashboard "andamento" a partire dallo storico
 * sessioni. Condiviso tra vista studente (le proprie) e vista docente (di un
 * singolo studente).
 */
import type { HistorySession } from './studentApi';
import type { Difficolta } from '../types/domain';
import { DIFFICOLTA_ORDER } from '../types/domain';

export interface ProgressStats {
  nVerificheConsegnate: number;
  nVerificheAnnullate: number;
  nEsercitazioni: number;
  mediaVoto30: number | null;
  mediaVoto10: number | null;
  ultimoVoto30: number | null;
  miglioreVoto30: number | null;
  totDistrazioni: number;
  totAmmonizioni: number;
  perLivello: { livello: Difficolta; media: number | null; count: number }[];
  /** Verifiche consegnate in ordine cronologico (vecchia → recente), per il grafico. */
  trend: { at: string; voto30: number; voto10: number; titolo: string; difficolta: string | null }[];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function isGradedVerifica(s: HistorySession): boolean {
  return s.categoria === 'verifica' && s.state === 'consegnata' && s.voto30 != null;
}

export function computeStats(sessions: HistorySession[]): ProgressStats {
  const verificheConsegnate = sessions.filter(isGradedVerifica);
  const voti = verificheConsegnate.map((s) => s.voto30 as number);

  const media = voti.length ? round1(voti.reduce((a, b) => a + b, 0) / voti.length) : null;

  const trend = [...verificheConsegnate]
    .sort((a, b) => new Date(a.consegnato_at ?? a.started_at).getTime() - new Date(b.consegnato_at ?? b.started_at).getTime())
    .map((s) => ({
      at: s.consegnato_at ?? s.started_at,
      voto30: s.voto30 as number,
      voto10: round1((s.voto30 as number) / 3),
      titolo: s.verifica_titolo,
      difficolta: s.difficolta,
    }));

  const perLivello = DIFFICOLTA_ORDER.map((livello) => {
    const subset = verificheConsegnate.filter((s) => s.difficolta === livello);
    const vv = subset.map((s) => s.voto30 as number);
    return {
      livello,
      count: subset.length,
      media: vv.length ? round1(vv.reduce((a, b) => a + b, 0) / vv.length) : null,
    };
  });

  return {
    nVerificheConsegnate: verificheConsegnate.length,
    nVerificheAnnullate: sessions.filter((s) => s.categoria === 'verifica' && s.state === 'annullata').length,
    nEsercitazioni: sessions.filter((s) => s.categoria === 'esercitazione').length,
    mediaVoto30: media,
    mediaVoto10: media != null ? round1(media / 3) : null,
    ultimoVoto30: trend.length ? trend[trend.length - 1].voto30 : null,
    miglioreVoto30: voti.length ? Math.max(...voti) : null,
    totDistrazioni: sessions.reduce((a, s) => a + (s.distrazioni_count ?? 0), 0),
    totAmmonizioni: sessions.reduce((a, s) => a + (s.ammonizioni_count ?? 0), 0),
    perLivello,
    trend,
  };
}
