import { useEffect, useRef } from 'react';

/**
 * Chiama `onCross(minutesLeft)` UNA SOLA VOLTA per ogni soglia (in minuti)
 * quando il tempo residuo scende sotto la soglia.
 *
 * Esempio: thresholds=[5,2,1] → onCross(5) quando rimangono ≤5 min,
 * onCross(2) quando rimangono ≤2 min, onCross(1) quando rimangono ≤1 min.
 *
 * Soglie già "perse" all'avvio (es. refresh con 3 min residui → soglia 5
 * già scaduta) vengono marcate come consumate e non vengono rifirate.
 */
export function useTimerWarnings(
  active: boolean,
  deadlineMs: number | undefined,
  thresholds: number[],
  onCross: (minutesLeft: number) => void
) {
  const firedRef = useRef<Set<number>>(new Set());
  const onCrossRef = useRef(onCross);
  onCrossRef.current = onCross;

  useEffect(() => {
    if (!active || !deadlineMs) return;

    const remainingMs = deadlineMs - Date.now();
    const remainingMin = remainingMs / 60000;
    // Soglie già passate al mount → marcate come fired senza notificare
    for (const t of thresholds) {
      if (remainingMin <= t) firedRef.current.add(t);
    }

    const id = setInterval(() => {
      const rMs = deadlineMs - Date.now();
      const rMin = rMs / 60000;
      for (const t of thresholds) {
        if (rMin <= t && !firedRef.current.has(t) && rMs > 0) {
          firedRef.current.add(t);
          onCrossRef.current(t);
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [active, deadlineMs, thresholds]);
}
