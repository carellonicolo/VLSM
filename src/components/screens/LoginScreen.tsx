import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onEsercitazione: () => void;
  onAdmin: () => void;
}

const PASSWORD_STUDENT = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';
const PASSWORD_ADMIN = import.meta.env.VITE_ADMIN_PASSWORD ?? 'docente2026';

export function LoginScreen({ onSuccess, onEsercitazione, onAdmin }: Props) {
  const [pwdStudent, setPwdStudent] = useState('');
  const [errStudent, setErrStudent] = useState(false);
  const [pwdAdmin, setPwdAdmin] = useState('');
  const [errAdmin, setErrAdmin] = useState(false);

  const submitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdStudent === PASSWORD_STUDENT) {
      setErrStudent(false);
      onSuccess();
    } else {
      setErrStudent(true);
    }
  };

  const submitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdAdmin === PASSWORD_ADMIN) {
      setErrAdmin(false);
      onAdmin();
    } else {
      setErrAdmin(true);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '2rem auto' }}>
      <form className="card" onSubmit={submitStudent}>
        <h2 style={{ marginTop: 0 }}>🎓 Svolgi la verifica</h2>
        <p className="muted">Sezione per gli studenti. Inserisci la password fornita dal docente per iniziare.</p>
        <div className="field">
          <label htmlFor="pwd-student">Password studente</label>
          <input
            id="pwd-student"
            type="password"
            value={pwdStudent}
            onChange={(e) => setPwdStudent(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {errStudent && <div className="error-msg">Password non valida.</div>}
        </div>
        <button className="btn" type="submit" style={{ width: '100%' }}>
          Entra nella verifica
        </button>
      </form>

      <form className="card" onSubmit={submitAdmin} style={{ marginTop: '1rem' }}>
        <h2 style={{ marginTop: 0 }}>📊 Correzione bulk (docente)</h2>
        <p className="muted">
          Sezione riservata al docente. Carica i PDF delle consegne per aggregare i voti e generare il report.
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
          {errAdmin && <div className="error-msg">Password non valida.</div>}
        </div>
        <button className="btn btn-secondary" type="submit" style={{ width: '100%' }}>
          Entra in modalità docente
        </button>
      </form>

      <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>🎯 Vuoi solo esercitarti?</h3>
        <p className="muted" style={{ margin: '0.5rem 0 1rem' }}>
          Le simulazioni sono libere e non richiedono password. Non valgono come verifica ufficiale.
        </p>
        <button className="btn btn-secondary" type="button" onClick={onEsercitazione} style={{ width: '100%' }}>
          Modalità esercitazione
        </button>
      </div>
    </div>
  );
}
