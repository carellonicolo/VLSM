import { Link } from 'react-router-dom';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { DashboardLink } from '../ui/DashboardLink';
import { useTheme } from '../../hooks/useTheme';

export function HomePage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="shell">
      <Header
        actions={
          <>
            <DashboardLink />
            <ThemeToggle theme={theme} onToggle={toggle} />
          </>
        }
      />

      <main className="landing">
        <div className="landing-intro">
          <h2 className="landing-title">VLSM &amp; Subnet — Toolkit didattico</h2>
          <p className="landing-subtitle">
            Calcolatori IPv4/IPv6, esercitazioni libere e verifiche ufficiali.
            Scegli da dove vuoi iniziare.
          </p>
        </div>

        <div className="landing-grid">
          <Link to="/calcolatori" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>🧮</div>
            <h3 className="landing-card-title">Calcolatori</h3>
            <p className="landing-card-text">
              Subnet IPv4, IPv6, VLSM, FLSM, visualizzatori e guida didattica.
              Accesso libero — nessuna password.
            </p>
            <span className="landing-card-cta">Apri i calcolatori →</span>
          </Link>

          <Link to="/verifica" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>📝</div>
            <h3 className="landing-card-title">Verifica</h3>
            <p className="landing-card-text">
              Modalità ufficiale con timer, correzione automatica e PDF firmato.
              Richiede l'accesso con il tuo account scolastico.
            </p>
            <span className="landing-card-cta">Inizia la verifica →</span>
          </Link>

          <Link to="/esercitazione" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>🎯</div>
            <h3 className="landing-card-title">Esercitazione</h3>
            <p className="landing-card-text">
              Simulazioni libere per esercitarsi sulle verifiche VLSM.
              Nessuna password, nessun voto registrato.
            </p>
            <span className="landing-card-cta">Inizia l'esercitazione →</span>
          </Link>

          <Link to="/admin" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>👨‍🏫</div>
            <h3 className="landing-card-title">Modalità docente</h3>
            <p className="landing-card-text">
              Correzione bulk, gestione sessioni live e impostazioni.
              Riservata al docente (accesso SSO super-admin).
            </p>
            <span className="landing-card-cta">Area docente →</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
