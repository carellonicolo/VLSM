import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

const PASSWORD = import.meta.env.VITE_APP_PASSWORD ?? 'vlsm2026';

export function LoginScreen({ onSuccess }: Props) {
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
    <form className="card" onSubmit={submit} style={{ maxWidth: 420, margin: '3rem auto' }}>
      <h2 style={{ marginTop: 0 }}>Accedi alla verifica VLSM</h2>
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
        Entra
      </button>
    </form>
  );
}
