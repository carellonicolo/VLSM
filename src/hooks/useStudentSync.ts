import { useEffect, useRef, useState } from 'react';
import type { Categoria, EsitoFinale, EventoFocus, RispostaStudente } from '../types/domain';
import { getOrCreateClientId } from '../lib/cloudSync';
import { studentSaveSession, type StudentSavePayload } from '../lib/studentApi';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface UseStudentSyncOptions {
  enabled: boolean;
  categoria: Categoria;
  verificaId: string | undefined;
  verificaTitolo: string | undefined;
  difficolta?: string;
  startedAt: string | undefined;
  deadlineAt: string | undefined;
  durationMin: number;
  answers: RispostaStudente | undefined;
  eventiFocus: EventoFocus[];
  state: 'in_progress' | 'consegnata' | 'abbandonata';
  esito?: EsitoFinale;
  /** Chiamata quando il server segnala che la prova è stata annullata dal docente. */
  onAnnullata?: () => void;
}

const DEBOUNCE_MS = 1500;
const HEARTBEAT_MS = 30_000;

/**
 * Sincronizza la sessione dello studente loggato col server (token-based).
 * Debounce 1.5s + heartbeat 30s. Se il server risponde 409 'annullata',
 * interrompe il sync e notifica via onAnnullata.
 */
export function useStudentSync(opts: UseStudentSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlight = useRef(false);
  const pending = useRef(false);
  const stopped = useRef(false);
  const onAnnullataRef = useRef(opts.onAnnullata);
  onAnnullataRef.current = opts.onAnnullata;

  const payload: StudentSavePayload | null =
    opts.enabled && opts.verificaId && opts.verificaTitolo && opts.startedAt && opts.deadlineAt && opts.answers
      ? {
          categoria: opts.categoria,
          verificaId: opts.verificaId,
          verificaTitolo: opts.verificaTitolo,
          difficolta: opts.difficolta,
          startedAt: opts.startedAt,
          deadlineAt: opts.deadlineAt,
          durationMin: opts.durationMin,
          answers: opts.answers,
          eventiFocus: opts.eventiFocus,
          state: opts.state,
          esito: opts.esito,
          voto30: opts.esito?.voto30,
          signature: opts.esito?.signature,
          signedAt: opts.esito?.signedAt,
          consegnatoAt: opts.esito?.consegnatoAt,
          motivoConsegna: opts.esito?.motivoConsegna,
          clientId: getOrCreateClientId(),
        }
      : null;

  const latestPayload = useRef<StudentSavePayload | null>(payload);
  latestPayload.current = payload;

  const doSave = async () => {
    if (stopped.current || !latestPayload.current) return;
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    setStatus('syncing');
    const res = await studentSaveSession(latestPayload.current);
    inFlight.current = false;
    if (res.ok) {
      setStatus('synced');
      setLastSyncAt(res.updatedAt ?? new Date().toISOString());
      setLastError(null);
    } else if (res.annullata) {
      stopped.current = true;
      setStatus('error');
      setLastError('Prova annullata dal docente.');
      onAnnullataRef.current?.();
      return;
    } else {
      const msg = res.error ?? 'errore sconosciuto';
      setLastError(msg);
      setStatus(/HTTP 5|aborted|Failed to fetch|NetworkError|abort|timeout/i.test(msg) ? 'offline' : 'error');
    }
    if (pending.current) {
      pending.current = false;
      void doSave();
    }
  };

  useEffect(() => {
    if (!payload || stopped.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => void doSave(), DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(payload)]);

  useEffect(() => {
    if (!opts.enabled) return;
    heartbeatTimer.current = setInterval(() => {
      if (latestPayload.current && !stopped.current) void doSave();
    }, HEARTBEAT_MS);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  useEffect(() => {
    if (opts.enabled && payload && !stopped.current) void doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  const flush = async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    await doSave();
  };

  return { status, lastSyncAt, lastError, flush };
}
