import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { useAuth } from '../../hooks/useAuth';

const EMAIL_DOMAIN = 'marconiverona.edu.it';

export function RegisterScreen() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [declaredClass, setDeclaredClass] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const mail = email.trim().toLowerCase();
    if (!new RegExp(`^[^\\s@]+@${EMAIL_DOMAIN}$`, 'i').test(mail)) {
      setErr(`Usa la tua email scolastica @${EMAIL_DOMAIN}.`);
      return;
    }
    if (fullName.trim().length < 3) {
      setErr('Inserisci nome e cognome.');
      return;
    }
    if (password.length < 8) {
      setErr('La password deve avere almeno 8 caratteri.');
      return;
    }
    if (password !== confirm) {
      setErr('Le due password non corrispondono.');
      return;
    }
    setLoading(true);
    const res = await register({
      email: mail,
      password,
      fullName: fullName.trim(),
      declaredClass: declaredClass.trim(),
    });
    setLoading(false);
    if (res.ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setErr(res.error ?? 'Registrazione non riuscita.');
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
          <h2 style={{ marginTop: 0 }}>📝 Crea il tuo account</h2>
          <div className="warn-banner" style={{ marginBottom: '1rem' }}>
            <strong>ℹ️ Come funziona</strong>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.88rem' }}>
              Puoi registrarti subito e usare le <strong>esercitazioni</strong>. Per svolgere le
              <strong> verifiche ufficiali</strong> il docente deve prima <strong>convalidare</strong> il tuo
              account e confermare la tua classe.
            </p>
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email scolastica</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              autoFocus
              placeholder={`nome.cognome@${EMAIL_DOMAIN}`}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-name">Nome e cognome</label>
              <input id="reg-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="reg-class">Classe</label>
              <input id="reg-class" type="text" value={declaredClass} onChange={(e) => setDeclaredClass(e.target.value)} placeholder="es. 5A SRI" />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="reg-pwd">Password (min 8)</label>
              <input id="reg-pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="field">
              <label htmlFor="reg-pwd2">Conferma password</label>
              <input id="reg-pwd2" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </div>
          </div>
          {err && <div className="error-msg" style={{ marginBottom: '0.75rem' }}>{err}</div>}
          <button className="btn login-card-cta" type="submit" disabled={loading}>
            {loading ? 'Creazione account…' : 'Registrati'}
          </button>
          <p className="muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Hai già un account? <Link to="/login">Accedi →</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
