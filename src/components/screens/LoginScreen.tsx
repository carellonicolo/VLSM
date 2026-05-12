import { useState } from 'react';

interface Props {
  onSuccess: () => void;
  onEsercitazione: () => void;
}

const PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';

export function LoginScreen({ onSuccess, onEsercitazione }: Props) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '3rem auto' }}>
      <form className="card" onSubmit={submit}>
        <h2 style={{ marginTop: 0 }}>Verifica VLSM</h2>
        <p className="muted">Inserisci la password fornita dal docente.</p>
        <div className="field">
          <label htmlFor="pwd">Password</label>
          <input
            id="pwd"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {error && <div className="error-msg">Password non valida.</div>}
        </div>
        <button className="btn" type="submit" style={{ width: '100%' }}>
          Entra nella verifica
        </button>
      </form>

      <div className="card" style={{ marginTop: '1rem', textAlign: 'center' }}>
        <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Vuoi solo esercitarti?</h3>
        <p className="muted" style={{ margin: '0.5rem 0 1rem' }}>
          Le simulazioni sono libere e non richiedono password. Non valgono come verifica ufficiale.
        </p>
        <button className="btn btn-secondary" type="button" onClick={onEsercitazione} style={{ width: '100%' }}>
          🎯 Modalità esercitazione
        </button>
      </div>
    </div>
  );
}
