import type { DatiStudente, EsitoFinale, RispostaStudente, VerificaId } from '../types/domain';

const KEY = 'vlsm_session';

export type Phase = 'info' | 'test' | 'review' | 'result';

export interface PersistedSession {
  version: 1;
  phase: Phase;
  studente?: DatiStudente;
  verificaId?: VerificaId;
  deadlineMs?: number;
  durataMin: number;
  answers?: RispostaStudente;
  esito?: EsitoFinale;
  startedAt?: string;
}

export function readSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(s: PersistedSession): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage non disponibile (incognito): in-memory only
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
