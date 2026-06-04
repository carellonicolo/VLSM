import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { ProgressView } from '../dashboard/ProgressView';
import { useAuth } from '../../hooks/useAuth';
import { studentHistory, type HistorySession } from '../../lib/studentApi';
import { apiChangePassword } from '../../lib/auth';

function StatusBanner() {
  const { student, exam, refresh } = useAuth();
  if (!student) return null;

  if (student.status === 'validated') {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
        <strong style={{ color: 'var(--success)' }}>✅ Account convalidato</strong>
        <div className="muted" style={{ marginTop: '0.25rem' }}>
          Classe: <strong>{student.class}</strong>.{' '}
          {exam?.available
            ? 'La modalità verifica è attiva per la tua classe: puoi svolgere una verifica.'
            : 'La modalità verifica non è attiva al momento. Potrai svolgerla quando il docente la sbloccherà per la tua classe.'}
        </div>
        <button className="btn btn-secondary" type="button" style={{ marginTop: '0.6rem' }} onClick={() => void refresh()}>
          🔄 Aggiorna stato
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--warn-border)', background: 'var(--warn-bg)' }}>
      <strong style={{ color: 'var(--warn-text)' }}>⏳ In attesa di convalida</strong>
      <div style={{ color: 'var(--warn-text)', marginTop: '0.25rem', fontSize: '0.92rem' }}>
        Il tuo account non è ancora stato convalidato dal docente. Puoi comunque allenarti con le
        <strong> esercitazioni libere</strong>. Per le verifiche ufficiali attendi la convalida
        {student.declaredClass ? <> (classe dichiarata: <strong>{student.declaredClass}</strong>)</> : null}.
      </div>
      <button className="btn btn-secondary" type="button" style={{ marginTop: '0.6rem' }} onClick={() => void refresh()}>
        🔄 Controlla di nuovo
      </button>
    </div>
  );
}

function ChangePasswordCard({ forced }: { forced: boolean }) {
  const { refresh } = useAuth();
  const [open, setOpen] = useState(forced);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) return setMsg({ type: 'err', text: 'La nuova password deve avere almeno 8 caratteri.' });
    if (next !== confirm) return setMsg({ type: 'err', text: 'Le due password non corrispondono.' });
    setBusy(true);
    const res = await apiChangePassword(current, next);
    setBusy(false);
    if (res.ok) {
      setMsg({ type: 'ok', text: 'Password aggiornata.' });
      setCurrent(''); setNext(''); setConfirm('');
      void refresh();
    } else {
      setMsg({ type: 'err', text: res.error ?? 'Errore.' });
    }
  };

  if (!open) {
    return (
      <div className="card">
        <button className="btn btn-secondary" type="button" onClick={() => setOpen(true)}>🔑 Cambia password</button>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3 style={{ marginTop: 0 }}>🔑 Cambia password</h3>
      {forced && (
        <div className="warn-banner" style={{ marginBottom: '0.75rem' }}>
          <strong>Il docente ha reimpostato la tua password.</strong>
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem' }}>Scegline una nuova per continuare.</p>
        </div>
      )}
      {!forced && (
        <div className="field">
          <label htmlFor="cp-cur">Password attuale</label>
          <input id="cp-cur" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </div>
      )}
      <div className="field-row">
        <div className="field">
          <label htmlFor="cp-new">Nuova password (min 8)</label>
          <input id="cp-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="field">
          <label htmlFor="cp-confirm">Conferma</label>
          <input id="cp-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </div>
      </div>
      {msg && <div className={msg.type === 'ok' ? 'muted' : 'error-msg'} style={msg.type === 'ok' ? { color: 'var(--success)', marginBottom: '0.5rem' } : { marginBottom: '0.5rem' }}>{msg.text}</div>}
      <div className="actions">
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Salvataggio…' : 'Salva password'}</button>
        {!forced && <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>Chiudi</button>}
      </div>
    </form>
  );
}

export function StudentDashboard() {
  const { student, exam, loading } = useAuth();
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [histLoading, setHistLoading] = useState(true);
  const [histError, setHistError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    const res = await studentHistory();
    setHistLoading(false);
    if (res.ok && res.data) {
      setSessions(res.data.sessions);
      setHistError(null);
    } else {
      setHistError(res.error ?? 'Impossibile caricare lo storico.');
    }
  }, []);

  useEffect(() => {
    if (student) void loadHistory();
  }, [student, loadHistory]);

  if (loading) return <AppShell><div className="card">Caricamento…</div></AppShell>;
  if (!student) return null; // RequireAuth gestisce il redirect

  const verificaAvailable = !!exam?.available;
  const verificaReason = student.status !== 'validated'
    ? 'Account non ancora convalidato dal docente.'
    : !exam?.enabledForClass
      ? `La verifica non è attiva per la classe ${student.class ?? ''}.`
      : '';

  return (
    <AppShell>
      <div className="dash-head">
        <div>
          <h2 style={{ margin: 0 }}>Ciao, {student.fullName.split(' ')[0]} 👋</h2>
          <div className="muted">{student.email}{student.class ? ` · ${student.class}` : ''}</div>
        </div>
      </div>

      {student.mustChangePassword && <ChangePasswordCard forced />}
      <StatusBanner />

      <div className="dash-actions">
        <Link to="/esercitazione" className="card landing-card dash-action">
          <div className="landing-card-icon" aria-hidden>🎯</div>
          <h3 className="landing-card-title">Esercitazione</h3>
          <p className="landing-card-text">Allenati con una simulazione. Sempre disponibile, entra nel tuo storico.</p>
          <span className="landing-card-cta">Inizia →</span>
        </Link>

        {verificaAvailable ? (
          <Link to="/verifica" className="card landing-card dash-action">
            <div className="landing-card-icon" aria-hidden>📝</div>
            <h3 className="landing-card-title">Verifica</h3>
            <p className="landing-card-text">Modalità ufficiale con timer e correzione automatica. Attiva per la tua classe.</p>
            <span className="landing-card-cta">Inizia la verifica →</span>
          </Link>
        ) : (
          <div className="card landing-card dash-action dash-action-disabled" aria-disabled title={verificaReason}>
            <div className="landing-card-icon" aria-hidden>🔒</div>
            <h3 className="landing-card-title">Verifica</h3>
            <p className="landing-card-text">{verificaReason || 'Verifica non disponibile al momento.'}</p>
            <span className="landing-card-cta" style={{ opacity: 0.6 }}>Non disponibile</span>
          </div>
        )}

        <Link to="/calcolatori" className="card landing-card dash-action">
          <div className="landing-card-icon" aria-hidden>🧮</div>
          <h3 className="landing-card-title">Calcolatori</h3>
          <p className="landing-card-text">Subnet IPv4/IPv6, VLSM, FLSM e guida didattica. Accesso libero.</p>
          <span className="landing-card-cta">Apri →</span>
        </Link>
      </div>

      <h2 style={{ marginBottom: '0.5rem' }}>Il tuo andamento</h2>
      {histLoading && <div className="card muted">⏳ Caricamento storico…</div>}
      {histError && <div className="card error-msg">{histError}</div>}
      {!histLoading && !histError && <ProgressView sessions={sessions} />}

      {!student.mustChangePassword && <ChangePasswordCard forced={false} />}
    </AppShell>
  );
}
