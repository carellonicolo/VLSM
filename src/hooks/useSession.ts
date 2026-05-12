import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  DatiStudente,
  EsitoFinale,
  RispostaEsercizio,
  RispostaRiga,
  VerificaId,
} from '../types/domain';
import {
  clearSession,
  readSession,
  writeSession,
  type PersistedSession,
  type Phase,
} from '../lib/storage';

const RAW_DURATA = Number(import.meta.env.VITE_DURATA_DEFAULT_MIN ?? '0');
const DURATA_DEFAULT_MIN = Number.isFinite(RAW_DURATA) && RAW_DURATA > 0 ? RAW_DURATA : 60;

const INITIAL: PersistedSession = {
  version: 1,
  phase: 'info',
  durataMin: DURATA_DEFAULT_MIN,
};

export function useSession() {
  const [session, setSession] = useState<PersistedSession>(() => readSession() ?? INITIAL);
  const writeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persist (300ms)
  useEffect(() => {
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(() => writeSession(session), 300);
    return () => {
      if (writeTimer.current) clearTimeout(writeTimer.current);
    };
  }, [session]);

  const startTest = useCallback((studente: DatiStudente, verificaId: VerificaId, durataMin?: number) => {
    const minuti = durataMin ?? DURATA_DEFAULT_MIN;
    setSession({
      version: 1,
      phase: 'test',
      studente,
      verificaId,
      durataMin: minuti,
      deadlineMs: Date.now() + minuti * 60_000,
      answers: { verificaId, esercizi: {} },
      startedAt: new Date().toISOString(),
    });
  }, []);

  const updateRiga = useCallback(
    (esercizioId: string, section: 'righe' | 'parteA' | 'parteB', rowIndex: number, riga: RispostaRiga) => {
      setSession((s) => {
        if (!s.answers) return s;
        const exAns: RispostaEsercizio = s.answers.esercizi[esercizioId] ?? { esercizioId };
        const existing = (exAns[section] as RispostaRiga[] | undefined) ?? [];
        const updated = [...existing];
        updated[rowIndex] = { ...updated[rowIndex], ...riga };
        const newEx = { ...exAns, [section]: updated };
        return {
          ...s,
          answers: {
            ...s.answers,
            esercizi: { ...s.answers.esercizi, [esercizioId]: newEx },
          },
        };
      });
    },
    []
  );

  const updateParteC = useCallback((esercizioId: string, riga: RispostaRiga) => {
    setSession((s) => {
      if (!s.answers) return s;
      const exAns: RispostaEsercizio = s.answers.esercizi[esercizioId] ?? { esercizioId };
      const newEx = { ...exAns, parteC: { ...(exAns.parteC ?? {}), ...riga } };
      return {
        ...s,
        answers: {
          ...s.answers,
          esercizi: { ...s.answers.esercizi, [esercizioId]: newEx },
        },
      };
    });
  }, []);

  const goPhase = useCallback((phase: Phase) => {
    setSession((s) => ({ ...s, phase }));
  }, []);

  const setEsito = useCallback((esito: EsitoFinale) => {
    setSession((s) => ({ ...s, phase: 'result', esito }));
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setSession(INITIAL);
  }, []);

  return {
    session,
    startTest,
    updateRiga,
    updateParteC,
    goPhase,
    setEsito,
    reset,
  };
}
