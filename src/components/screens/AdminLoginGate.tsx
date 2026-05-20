import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  onSuccess: () => void;
}

const PASSWORD_ADMIN = import.meta.env.VITE_ADMIN_PASSWORD ?? 'docente2026';

export function AdminLoginGate({ onSuccess }: Props) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD_ADMIN) {
      setErr(null);
      onSuccess();
    } else {
      setErr('Password non valida.');
    }
  };

  return (
    <div className="login-grid login-grid-single">
      <div className="login-back-row">
        <Link to="/" className="back-link">← Torna alla home</Link>
      </div>
      <form className="card login-card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>📊 Modalità docente</h2>
        <p className="muted">
          Sezione riservata al docente. Carica i PDF, gestisci le sessioni live
          e configura le impostazioni dell'applicazione.
        </p>
        <div className="field">
          <label htmlFor="pwd-admin">Password docente</label>
          <input
            id="pwd-admin"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {err && <div className="error-msg">{err}</div>}
        </div>
        <button className="btn btn-secondary login-card-cta" type="submit">
          Entra in modalità docente
        </button>
      </form>
    </div>
  );
}
