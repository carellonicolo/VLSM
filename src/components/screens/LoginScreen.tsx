import { useEffect, useState } from 'react';
import { cloudGetConfig, cloudLoginStudent } from '../../lib/cloudSync';

interface Props {
  onSuccess: () => void;
  onEsercitazione: () => void;
  onAdmin: () => void;
}

const PASSWORD_ADMIN = import.meta.env.VITE_ADMIN_PASSWORD ?? 'docente2026';
const PASSWORD_STUDENT_FALLBACK = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';

export function LoginScreen({ onSuccess, onEsercitazione, onAdmin }: Props) {
  const [pwdStudent, setPwdStudent] = useState('');
  const [errStudent, setErrStudent] = useState<string | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [pwdAdmin, setPwdAdmin] = useState('');
  const [errAdmin, setErrAdmin] = useState<string | null>(null);
  const [verificaEnabled, setVerificaEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    void cloudGetConfig().then((c) => {
      if (active) setVerificaEnabled(c.verificaEnabled);
    });
    return () => { active = false; };
  }, []);

  const submitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrStudent(null);
    setLoadingStudent(true);
    // Prima prova auth server-side (rispecchia la password modificabile da admin).
    const res = await cloudLoginStudent(pwdStudent);
    setLoadingStudent(false);
    if (res.ok) {
      onSuccess();
      return;
    }
    if (res.status === 503) {
      // Server non configurato → fallback su confronto locale con la env var del bundle
      if (pwdStudent === PASSWORD_STUDENT_FALLBACK) {
        onSuccess();
        return;
      }
      setErrStudent('Password non valida.');
      return;
    }
    if (res.status === 403) {
      setErrStudent('Modalità verifica temporaneamente disattivata dal docente.');
      return;
    }
    if (res.status === 401) {
      setErrStudent('Password non valida.');
      return;
    }
    setErrStudent(res.error ?? 'Errore di connessione.');
  };

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdAdmin === PASSWORD_ADMIN) {
      setErrAdmin(null);
      onAdmin();
    } else {
      setErrAdmin('Password non valida.');
    }
  };

  return (
    <div className="login-grid">
      <form
        className="card login-card"
        onSubmit={submitStudent}
        style={verificaEnabled ? undefined : { opacity: 0.55, pointerEvents: 'none' }}
        aria-disabled={!verificaEnabled}
      >
        <h2 style={{ marginTop: 0 }}>🎓 Svolgi la verifica</h2>
        {!verificaEnabled ? (
          <p className="error-msg" style={{ background: 'var(--warn-bg)', color: 'var(--warn-text)', border: '1px solid var(--warn-border)', padding: '0.6rem 0.8rem', borderRadius: 6 }}>
            ⚠ Modalità verifica temporaneamente disattivata dal docente.
            Riprova più tardi o usa la modalità esercitazione qui a fianco.
          </p>
        ) : (
          <p className="muted">Sezione per gli studenti. Inserisci la password fornita dal docente per iniziare.</p>
        )}
        <div className="field">
          <label htmlFor="pwd-student">Password studente</label>
          <input
            id="pwd-student"
            type="password"
            value={pwdStudent}
            onChange={(e) => setPwdStudent(e.target.value)}
            autoFocus={verificaEnabled}
            autoComplete="off"
            disabled={!verificaEnabled || loadingStudent}
          />
          {errStudent && <div className="error-msg">{errStudent}</div>}
        </div>
        <button className="btn login-card-cta" type="submit" disabled={!verificaEnabled || loadingStudent}>
          {loadingStudent ? 'Verifica password…' : 'Entra nella verifica'}
        </button>
      </form>

      <form className="card login-card" onSubmit={submitAdmin}>
        <h2 style={{ marginTop: 0 }}>📊 Correzione bulk (docente)</h2>
        <p className="muted">
          Sezione riservata al docente. Carica i PDF, gestisci le sessioni live e configura le impostazioni.
        </p>
        <div className="field">
          <label htmlFor="pwd-admin">Password docente</label>
          <input
            id="pwd-admin"
            type="password"
            value={pwdAdmin}
            onChange={(e) => setPwdAdmin(e.target.value)}
            autoComplete="off"
          />
          {errAdmin && <div className="error-msg">{errAdmin}</div>}
        </div>
        <button className="btn btn-secondary login-card-cta" type="submit">
          Entra in modalità docente
        </button>
      </form>

      <div className="card login-card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>🎯 Esercitazione</h2>
        <p className="muted">
          Le simulazioni sono libere e <strong>non richiedono password</strong>. Non valgono come verifica
          ufficiale: sono pensate per esercitarti in autonomia.
        </p>
        <button className="btn btn-secondary login-card-cta" type="button" onClick={onEsercitazione}>
          Inizia esercitazione
        </button>
      </div>
    </div>
  );
}
