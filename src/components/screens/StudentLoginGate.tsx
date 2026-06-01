import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cloudGetConfig, cloudLoginStudent, setStudentPassword } from '../../lib/cloudSync';

interface Props {
  onSuccess: () => void;
}

const PASSWORD_STUDENT_FALLBACK = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';

export function StudentLoginGate({ onSuccess }: Props) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificaEnabled, setVerificaEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    void cloudGetConfig().then((c) => {
      if (active) setVerificaEnabled(c.verificaEnabled);
    });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await cloudLoginStudent(pwd);
    setLoading(false);
    if (res.ok) {
      // Memorizza la password EFFETTIVA digitata: è quella che il server si
      // aspetta nell'header X-VLSM-Auth per i salvataggi della sessione.
      // Senza questo, il client ripiega sulla VITE_APP_PASSWORD compilata nel
      // bundle e il sync va in 401 (es. dopo un cambio password lato docente).
      setStudentPassword(pwd);
      onSuccess();
      return;
    }
    if (res.status === 503) {
      if (pwd === PASSWORD_STUDENT_FALLBACK) {
        setStudentPassword(pwd);
        onSuccess();
        return;
      }
      setErr('Password non valida.');
      return;
    }
    if (res.status === 403) {
      setErr('Modalità verifica temporaneamente disattivata dal docente.');
      return;
    }
    if (res.status === 401) {
      setErr('Password non valida.');
      return;
    }
    setErr(res.error ?? 'Errore di connessione.');
  };

  return (
    <div className="login-grid login-grid-single">
      <div className="login-back-row">
        <Link to="/" className="back-link">← Torna alla home</Link>
      </div>
      <form
        className="card login-card"
        onSubmit={submit}
        style={verificaEnabled ? undefined : { opacity: 0.55, pointerEvents: 'none' }}
        aria-disabled={!verificaEnabled}
      >
        <h2 style={{ marginTop: 0 }}>🎓 Svolgi la verifica</h2>
        {!verificaEnabled ? (
          <p
            className="error-msg"
            style={{
              background: 'var(--warn-bg)',
              color: 'var(--warn-text)',
              border: '1px solid var(--warn-border)',
              padding: '0.6rem 0.8rem',
              borderRadius: 6,
            }}
          >
            ⚠ Modalità verifica temporaneamente disattivata dal docente.
            Riprova più tardi o usa la modalità esercitazione.
          </p>
        ) : (
          <p className="muted">
            Inserisci la password fornita dal docente per iniziare la verifica.
          </p>
        )}
        <div className="field">
          <label htmlFor="pwd-student">Password studente</label>
          <input
            id="pwd-student"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus={verificaEnabled}
            autoComplete="off"
            disabled={!verificaEnabled || loading}
          />
          {err && <div className="error-msg">{err}</div>}
        </div>
        <button
          className="btn login-card-cta"
          type="submit"
          disabled={!verificaEnabled || loading}
        >
          {loading ? 'Verifica password…' : 'Entra nella verifica'}
        </button>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Vuoi solo esercitarti? <Link to="/esercitazione">Vai all'esercitazione libera →</Link>
        </p>
      </form>
    </div>
  );
}
