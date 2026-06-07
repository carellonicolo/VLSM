import { Link } from 'react-router-dom';

/**
 * Pulsante "casa" nell'header: riporta sempre alla schermata principale di VLSM
 * (`/`), così da uscire da qualunque modalità (verifica, esercitazione, admin,
 * calcolatori, dashboard) tornando all'inizio dell'app.
 *
 * NB: in precedenza puntava all'hub esterno delle applicazioni (nicolocarello.it).
 * Il link all'hub verrà reintrodotto separatamente quando lavoreremo su carello-hub.
 */
export function HomeLink() {
  return (
    <Link
      to="/"
      className="theme-toggle"
      aria-label="Torna alla schermata principale di VLSM"
      title="Home VLSM"
    >
      <span aria-hidden>🏠</span>
    </Link>
  );
}
