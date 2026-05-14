import { useEffect, useRef } from 'react';
import type { EventoFocus } from '../types/domain';

/**
 * Traccia quando lo studente lascia la pagina (cambio tab, minimize, blur su altra app).
 * Quando torna sulla pagina chiama `onEvent` con start + durata.
 *
 * Usa sia `visibilitychange` (per tab/minimize) che `blur`/`focus` (per app switch).
 * Lo stato di "lontano" è un singolo flag che rappresenta l'unione dei due segnali:
 * qualunque dei due lo accende, entrambi devono spegnersi per chiuderlo.
 */
export function useFocusMonitor(active: boolean, onEvent: (e: EventoFocus) => void) {
  const stateRef = useRef<{
    awayStart: number | null;
    visibilityHidden: boolean;
    windowBlurred: boolean;
  }>({ awayStart: null, visibilityHidden: false, windowBlurred: false });
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!active) return;

    const startAway = () => {
      const s = stateRef.current;
      if (s.awayStart === null) s.awayStart = Date.now();
    };

    const endAwayIfBoth = () => {
      const s = stateRef.current;
      if (!s.visibilityHidden && !s.windowBlurred && s.awayStart !== null) {
        const startedAt = s.awayStart;
        const now = Date.now();
        const durataMs = now - startedAt;
        s.awayStart = null;
        // Filtra blur < 250ms (probabilmente popup di sistema involontario)
        if (durataMs >= 250) {
          onEventRef.current({
            startedAt: new Date(startedAt).toISOString(),
            durataMs,
          });
        }
      }
    };

    const onVisibility = () => {
      const s = stateRef.current;
      s.visibilityHidden = document.hidden;
      if (document.hidden) startAway();
      else endAwayIfBoth();
    };

    const onBlur = () => {
      stateRef.current.windowBlurred = true;
      startAway();
    };

    const onFocus = () => {
      stateRef.current.windowBlurred = false;
      endAwayIfBoth();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    // Inizializza con lo stato corrente (se la pagina parte già nascosta)
    stateRef.current.visibilityHidden = document.hidden;
    if (document.hidden) startAway();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [active]);
}
