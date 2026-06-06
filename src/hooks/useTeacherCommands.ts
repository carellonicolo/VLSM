import { useEffect, useRef, useState } from 'react';
import { studentPollEvents } from '../lib/studentApi';
import type { Ammonizione } from '../types/domain';

const POLL_MS = 3000;

export interface CurrentMessage {
  type: 'alert' | 'ammonizione';
  message: string;
  id: number;
}

export interface TeacherCommandsState {
  /** Messaggio (alert o ammonizione) attualmente da mostrare, se presente. */
  current: CurrentMessage | null;
  /** Tutte le ammonizioni ricevute durante la prova (per il PDF/esito). */
  ammonizioni: Ammonizione[];
  /** True quando il docente ha annullato la prova. */
  annulled: boolean;
  annullataMotivo: string | null;
  dismiss: () => void;
}

/**
 * Durante una verifica, fa polling degli interventi del docente
 * (alert / ammonizione / annulla) e ne espone lo stato per la UI.
 * I messaggi vengono mostrati uno alla volta (coda).
 */
export function useTeacherCommands(enabled: boolean): TeacherCommandsState {
  const [current, setCurrent] = useState<CurrentMessage | null>(null);
  const [ammonizioni, setAmmonizioni] = useState<Ammonizione[]>([]);
  const [annulled, setAnnulled] = useState(false);
  const [annullataMotivo, setAnnullataMotivo] = useState<string | null>(null);

  const sinceRef = useRef(0);
  const queueRef = useRef<CurrentMessage[]>([]);
  const currentRef = useRef<CurrentMessage | null>(null);
  const stoppedRef = useRef(false);

  // Mostra il prossimo messaggio in coda se non ce n'è già uno attivo.
  const pump = () => {
    if (currentRef.current) return;
    const next = queueRef.current.shift();
    if (!next) return;
    currentRef.current = next;
    setCurrent(next);
  };

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    stoppedRef.current = false;

    const tick = async () => {
      const res = await studentPollEvents(sinceRef.current);
      if (!active) return;

      if (res.found) {
        if (res.state === 'annullata') {
          stoppedRef.current = true;
          setAnnulled(true);
          setAnnullataMotivo(res.annullataMotivo ?? null);
        }
        for (const ev of res.events) {
          sinceRef.current = Math.max(sinceRef.current, ev.id);
          if (ev.type === 'ammonizione') {
            setAmmonizioni((prev) => [...prev, { at: ev.createdAt, message: ev.message ?? 'Ammonizione dal docente.' }]);
          }
          if (ev.type === 'alert' || ev.type === 'ammonizione') {
            queueRef.current.push({
              type: ev.type === 'ammonizione' ? 'ammonizione' : 'alert',
              message: ev.message ?? (ev.type === 'ammonizione' ? 'Ammonizione dal docente.' : 'Messaggio dal docente.'),
              id: ev.id,
            });
          }
        }
        pump();
      }

      if (active && !stoppedRef.current) timer = setTimeout(tick, POLL_MS);
    };

    void tick();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);

  const dismiss = () => {
    currentRef.current = null;
    setCurrent(null);
    // mostra l'eventuale prossimo messaggio
    setTimeout(pump, 0);
  };

  return { current, ammonizioni, annulled, annullataMotivo, dismiss };
}
