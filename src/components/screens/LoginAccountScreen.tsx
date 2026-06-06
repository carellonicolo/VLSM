import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { useAuth } from '../../hooks/useAuth';

export function LoginAccountScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (res.ok) {
      navigate(next, { replace: true });
    } else {
      setErr(res.error ?? 'Accesso non riuscito.');
    }
  };

  return (
    <AppShell
      hideAccount
      back={
        <div className="login-back-row">
          <Link to="/" className="back-link">← Torna alla home</Link>
        </div>
      }
    >
      <div className="login-grid login-grid-single">
        <form className="card login-card" onSubmit={submit}>
          <h2 style={{ marginTop: 0 }}>🔐 Accedi</h2>
          <p className="muted">Entra con la tua email scolastica per svolgere esercitazioni e verifiche.</p>
          <div className="field">
            <label htmlFor="login-email">Email scolastica</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              placeholder="nome.cognome@marconiverona.edu.it"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {err && <div className="error-msg">{err}</div>}
          </div>
          <button className="btn login-card-cta" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
          <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Non hai un account? <Link to="/registrazione">Registrati →</Link>
          </p>
          <p className="muted" style={{ marginTop: '0.25rem', fontSize: '0.82rem' }}>
            Password dimenticata? Chiedi al docente di reimpostarla.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
