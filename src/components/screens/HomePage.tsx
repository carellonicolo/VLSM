import { Link } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { useAuth } from '../../hooks/useAuth';
import { redirectToLogin } from '../../lib/auth';

export function HomePage() {
  const { student, loading } = useAuth();

  return (
    <AppShell>
      <main className="landing">
        <div className="landing-intro">
          <h2 className="landing-title">VLSM &amp; Subnet — Toolkit didattico</h2>
          <p className="landing-subtitle">
            Calcolatori IPv4/IPv6, esercitazioni e verifiche ufficiali con il tuo account.
            Scegli da dove iniziare.
          </p>
        </div>

        <div className="landing-grid">
          <Link to="/calcolatori" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>🧮</div>
            <h3 className="landing-card-title">Calcolatori</h3>
            <p className="landing-card-text">
              Subnet IPv4, IPv6, VLSM, FLSM, visualizzatori e guida didattica.
              Accesso libero — nessun login.
            </p>
            <span className="landing-card-cta">Apri i calcolatori →</span>
          </Link>

          {student ? (
            <>
              <Link to="/dashboard" className="card landing-card">
                <div className="landing-card-icon" aria-hidden>📊</div>
                <h3 className="landing-card-title">La mia dashboard</h3>
                <p className="landing-card-text">
                  Il tuo andamento, le verifiche e le esercitazioni svolte, lo stato del tuo account.
                </p>
                <span className="landing-card-cta">Vai alla dashboard →</span>
              </Link>
              <Link to="/esercitazione" className="card landing-card">
                <div className="landing-card-icon" aria-hidden>🎯</div>
                <h3 className="landing-card-title">Esercitazione</h3>
                <p className="landing-card-text">
                  Simulazioni libere per allenarti. Vengono salvate nel tuo storico personale.
                </p>
                <span className="landing-card-cta">Inizia l'esercitazione →</span>
              </Link>
              <Link to="/verifica" className="card landing-card">
                <div className="landing-card-icon" aria-hidden>📝</div>
                <h3 className="landing-card-title">Verifica</h3>
                <p className="landing-card-text">
                  Modalità ufficiale con timer e correzione automatica. Richiede account convalidato.
                </p>
                <span className="landing-card-cta">Inizia la verifica →</span>
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="card landing-card"
              onClick={redirectToLogin}
              style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
            >
              <div className="landing-card-icon" aria-hidden>🔐</div>
              <h3 className="landing-card-title">Accedi</h3>
              <p className="landing-card-text">
                Entra con il tuo account scolastico (accesso unico). Registrazione, recupero
                password e gestione del profilo si fanno sul portale centrale.
              </p>
              <span className="landing-card-cta">Vai al login →</span>
            </button>
          )}

          <Link to="/admin" className="card landing-card">
            <div className="landing-card-icon" aria-hidden>👨‍🏫</div>
            <h3 className="landing-card-title">Modalità docente</h3>
            <p className="landing-card-text">
              Gestione studenti e classi, sessioni live, correzione e impostazioni.
              Riservata al docente.
            </p>
            <span className="landing-card-cta">Area docente →</span>
          </Link>
        </div>

        {!student && !loading && (
          <p className="muted" style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            Esercitazioni e verifiche richiedono l'accesso con account.
          </p>
        )}
      </main>
    </AppShell>
  );
}
