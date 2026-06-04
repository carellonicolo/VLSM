/**
 * Chiamate dello studente loggato verso il server (sessioni + comandi docente
 * + storico). Tutte autenticate via token (vedi lib/auth.ts).
 */
import { authFetch, type ApiResult } from './auth';
import type { EsitoFinale, EventoFocus, RispostaStudente } from '../types/domain';

export interface StudentSavePayload {
  categoria: 'verifica' | 'esercitazione';
  verificaId: string;
  verificaTitolo: string;
  difficolta?: string;
  startedAt: string;
  deadlineAt: string;
  durationMin: number;
  answers: RispostaStudente;
  eventiFocus: EventoFocus[];
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  consegnatoAt?: string;
  esito?: EsitoFinale;
  voto30?: number;
  signature?: string;
  signedAt?: string;
  motivoConsegna?: 'volontaria' | 'timeout';
  clientId?: string;
}

export interface StudentSaveResult {
  ok: boolean;
  id?: string;
  updatedAt?: string;
  error?: string;
  annullata?: boolean;
}

export async function studentSaveSession(payload: StudentSavePayload): Promise<StudentSaveResult> {
  const res = await authFetch<{ ok: boolean; id?: string; updatedAt?: string; state?: string }>(
    '/api/student/session/save',
    { method: 'POST', body: JSON.stringify(payload) },
    8000
  );
  if (res.ok && res.data?.ok) {
    return { ok: true, id: res.data.id, updatedAt: res.data.updatedAt };
  }
  const annullata = res.status === 409 && (res.data as { state?: string } | undefined)?.state === 'annullata';
  return { ok: false, error: res.error, annullata };
}

export interface RecoverableSession {
  id: string;
  studente: { nome: string; classe: string };
  categoria: 'verifica' | 'esercitazione';
  verificaId: string;
  verificaTitolo: string;
  difficolta?: string | null;
  startedAt: string;
  deadlineAt: string;
  updatedAt: string;
  durationMin: number;
  answers: RispostaStudente;
  eventiFocus: EventoFocus[];
  clientId: string;
}

export async function studentRecover(): Promise<RecoverableSession | null> {
  const res = await authFetch<{ found: boolean; session?: RecoverableSession }>(
    '/api/student/session/recover',
    { method: 'GET' },
    6000
  );
  if (res.ok && res.data?.found && res.data.session) return res.data.session;
  return null;
}

export type TeacherEventType = 'alert' | 'ammonizione' | 'annulla';

export interface TeacherEvent {
  id: number;
  type: TeacherEventType;
  message: string | null;
  createdAt: string;
}

export interface EventsPollResult {
  found: boolean;
  sessionId?: string;
  state?: string;
  annullataMotivo?: string | null;
  events: TeacherEvent[];
}

export async function studentPollEvents(since: number): Promise<EventsPollResult> {
  const res = await authFetch<EventsPollResult>(
    `/api/student/session/events?since=${encodeURIComponent(String(since))}`,
    { method: 'GET' },
    6000
  );
  if (res.ok && res.data) return { ...res.data, events: res.data.events ?? [] };
  return { found: false, events: [] };
}

export interface HistorySession {
  id: string;
  categoria: 'verifica' | 'esercitazione';
  verifica_id: string;
  verifica_titolo: string;
  difficolta: string | null;
  state: string;
  started_at: string;
  consegnato_at: string | null;
  updated_at: string;
  duration_min: number;
  voto30: number | null;
  motivo_consegna: string | null;
  annullata_motivo: string | null;
  distrazioni_count: number;
  ammonizioni_count: number;
}

export async function studentHistory(): Promise<ApiResult<{ sessions: HistorySession[] }>> {
  return authFetch<{ sessions: HistorySession[] }>('/api/student/history', { method: 'GET' });
}
