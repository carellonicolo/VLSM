import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMe, redirectToLogin, redirectToLogout, approvedClassNames, type MeResponse } from '../../lib/auth';
import { cloudGetConfig } from '../../lib/cloudSync';

interface Props {
  /** Chiamato quando l'utente è loggato, attivo e con almeno una classe approvata. */
  onAuthenticated: (auth: { name: string; approvedClasses: string[] }) => void;
}

type GateState = 'loading' | 'disabled' | 'anon' | 'inactive' | 'noclass' | 'ok';

/**
 * Gate SSO per la modalità verifica ufficiale.
 * Sostituisce la vecchia password condivisa: l'identità arriva dal login
 * centralizzato (auth.nicolocarello.it). Per entrare servono account attivo
 * E almeno una classe approvata dal docente. L'esercitazione resta libera.
 */
export function StudentLoginGate({ onAuthenticated }: Props) {
  const [state, setState] = useState<GateState>('loading');
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const [meRes, cfg] = await Promise.all([fetchMe(), cloudGetConfig()]);
      if (!active) return;
      setMe(meRes);

      if (!cfg.verificaEnabled) { setState('disabled'); return; }
      if (!meRes.authenticated || !meRes.user) { setState('anon'); return; }
      if ((meRes.status ?? meRes.user.status) !== 'active') { setState('inactive'); return; }
      const classes = approvedClassNames(meRes.approvedClasses);
      if (classes.length === 0) { setState('noclass'); return; }

      setState('ok');
      onAuthenticated({ name: meRes.user.name, approvedClasses: classes });
    })();
    return () => { active = false; };
  }, [onAuthenticated]);

  return (
    <div className="login-grid login-grid-single">
      <div className="login-back-row">
        <Link to="/" className="back-link">← Torna alla home</Link>
      </div>
      <div className="card login-card">
        <h2 style={{ marginTop: 0 }}>🎓 Svolgi la verifica</h2>

        {state === 'loading' && <p className="muted">⏳ Verifica dell'accesso in corso…</p>}

        {state === 'disabled' && (
          <>
            <p
              className="error-msg"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)', padding: '0.6rem 0.8rem', borderRadius: 6 }}
            >
              ⚠ Modalità verifica temporaneamente disattivata dal docente.
              Riprova più tardi o usa la modalità esercitazione.
            </p>
            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              Vuoi solo esercitarti? <Link to="/esercitazione">Vai all'esercitazione libera →</Link>
            </p>
          </>
        )}

        {state === 'anon' && (
          <>
            <p className="muted">
              Per svolgere la verifica ufficiale accedi con il tuo account scolastico.
              Verrai riportato qui dopo il login.
            </p>
            <button className="btn login-card-cta" type="button" onClick={redirectToLogin}>
              Accedi e inizia la verifica
            </button>
            <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              Vuoi solo esercitarti? <Link to="/esercitazione">Vai all'esercitazione libera →</Link>
            </p>
          </>
        )}

        {state === 'inactive' && (
          <>
            <p
              className="error-msg"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)', padding: '0.6rem 0.8rem', borderRadius: 6 }}
            >
              ⚠ Il tuo account risulta <strong>sospeso</strong>. Contatta il docente per la riattivazione.
            </p>
            <button className="btn btn-secondary login-card-cta" type="button" onClick={redirectToLogout}>
              Esci dall'account
            </button>
          </>
        )}

        {state === 'noclass' && (
          <>
            <p
              className="error-msg"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)', padding: '0.6rem 0.8rem', borderRadius: 6 }}
            >
              ⚠ Sei loggato come <strong>{me?.user?.name || me?.user?.email}</strong> ma non hai ancora
              una <strong>classe approvata</strong> dal docente. Chiedi al docente di approvare la tua
              iscrizione, poi ricarica la pagina.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Link to="/esercitazione" className="btn btn-secondary">Vai all'esercitazione</Link>
              <button className="btn btn-secondary" type="button" onClick={redirectToLogout}>Esci dall'account</button>
            </div>
          </>
        )}

        {state === 'ok' && <p className="muted">✅ Accesso effettuato. Caricamento…</p>}
      </div>
    </div>
  );
}
