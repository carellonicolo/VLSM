import { useEffect, useRef, useState } from 'react';
import type { Categoria, EsitoFinale, EventoFocus, RispostaStudente } from '../types/domain';
import { cloudSave, getOrCreateClientId, type CloudSessionPayload } from '../lib/cloudSync';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline' | 'error';

interface UseCloudSyncOptions {
  enabled: boolean;
  studente: { nome: string; classe: string } | undefined;
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
}

const DEBOUNCE_MS = 1500;     // attende 1.5s di idle prima di salvare
const HEARTBEAT_MS = 30_000;  // forza save almeno ogni 30s anche senza cambi

/**
 * Sincronizza la sessione corrente con il server.
 * Strategia: debounce 1.5s + heartbeat 30s + retry esponenziale soft in caso di errore.
 * Mantiene `lastSyncAt` e `status` per UI.
 */
export function useCloudSync(opts: UseCloudSyncOptions) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inFlight = useRef(false);
  const pending = useRef(false);

  // Costruisce il payload corrente. Se mancano dati essenziali → null.
  const payload: CloudSessionPayload | null =
    opts.enabled &&
    opts.studente &&
    opts.verificaId &&
    opts.verificaTitolo &&
    opts.startedAt &&
    opts.deadlineAt &&
    opts.answers
      ? {
          clientId: getOrCreateClientId(),
          studente: opts.studente,
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
        }
      : null;

  // Riferimento stabile al payload più recente
  const latestPayload = useRef<CloudSessionPayload | null>(payload);
  latestPayload.current = payload;

  const doSave = async () => {
    if (!latestPayload.current) return;
    if (inFlight.current) {
      pending.current = true;
      return;
    }
    inFlight.current = true;
    setStatus('syncing');
    const res = await cloudSave(latestPayload.current);
    inFlight.current = false;
    if (res.ok) {
      setStatus('synced');
      setLastSyncAt(res.updatedAt ?? new Date().toISOString());
      setLastError(null);
    } else {
      const msg = res.error ?? 'errore sconosciuto';
      setLastError(msg);
      // Heuristic: 5xx/network/timeout → offline; altrimenti error
      setStatus(/HTTP 5|aborted|Failed to fetch|NetworkError|abort/i.test(msg) ? 'offline' : 'error');
    }
    if (pending.current) {
      pending.current = false;
      // Coalescenza: subito un altro save con i dati più recenti
      doSave();
    }
  };

  // Debounce sui cambi: ogni volta che payload cambia, schedula save dopo 1.5s
  useEffect(() => {
    if (!payload) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      void doSave();
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(payload)]);

  // Heartbeat: forza save periodico anche se nulla cambia
  useEffect(() => {
    if (!opts.enabled) return;
    heartbeatTimer.current = setInterval(() => {
      if (latestPayload.current) void doSave();
    }, HEARTBEAT_MS);
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  // Forza un save all'avvio (e quando si abilita)
  useEffect(() => {
    if (opts.enabled && payload) void doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.enabled]);

  // Save finale alla terminazione (su consegna)
  const flush = async () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    await doSave();
  };

  return { status, lastSyncAt, lastError, flush };
}
