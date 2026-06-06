import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMe, redirectToLogin, redirectToLogout, type MeResponse } from '../../lib/auth';

interface Props {
  onSuccess: () => void;
}

type GateState = 'loading' | 'anon' | 'forbidden' | 'ok';

/**
 * Gate SSO per la modalità docente.
 * L'accesso è concesso solo agli utenti con isSuperAdmin=true sull'IdP
 * (auth.nicolocarello.it). Sostituisce la vecchia password docente condivisa.
 */
export function AdminLoginGate({ onSuccess }: Props) {
  const [state, setState] = useState<GateState>('loading');
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const meRes = await fetchMe();
      if (!active) return;
      setMe(meRes);
      if (!meRes.authenticated || !meRes.user) { setState('anon'); return; }
      if (!meRes.isSuperAdmin) { setState('forbidden'); return; }
      setState('ok');
      onSuccess();
    })();
    return () => { active = false; };
  }, [onSuccess]);

  return (
    <div className="login-grid login-grid-single">
      <div className="login-back-row">
        <Link to="/" className="back-link">← Torna alla home</Link>
      </div>
      <div className="card login-card">
        <h2 style={{ marginTop: 0 }}>📊 Modalità docente</h2>

        {state === 'loading' && <p className="muted">⏳ Verifica dell'accesso in corso…</p>}

        {state === 'anon' && (
          <>
            <p className="muted">
              Sezione riservata al docente. Accedi con il tuo account super-admin per
              caricare i PDF, gestire le sessioni live e configurare l'applicazione.
            </p>
            <button className="btn btn-secondary login-card-cta" type="button" onClick={redirectToLogin}>
              Accedi come docente
            </button>
          </>
        )}

        {state === 'forbidden' && (
          <>
            <p
              className="error-msg"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)', padding: '0.6rem 0.8rem', borderRadius: 6 }}
            >
              ⛔ Sei loggato come <strong>{me?.user?.name || me?.user?.email}</strong> ma questo
              account non ha i privilegi di docente. Questa sezione è riservata al super-admin.
            </p>
            <button className="btn btn-secondary login-card-cta" type="button" onClick={redirectToLogout}>
              Esci e cambia account
            </button>
          </>
        )}

        {state === 'ok' && <p className="muted">✅ Accesso effettuato. Caricamento…</p>}
      </div>
    </div>
  );
}
