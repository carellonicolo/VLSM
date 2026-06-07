import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../ui/AppShell';
import { ProgressView } from '../dashboard/ProgressView';
import { useAuth } from '../../hooks/useAuth';
import { studentHistory, type HistorySession } from '../../lib/studentApi';

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

export function StudentDashboard() {
  const { student, exam, loading, refresh } = useAuth();
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

  // Finché la verifica non è disponibile (account da convalidare o classe non
  // ancora attiva), ricontrolla lo stato ogni 20s: così la verifica si sblocca
  // da sola appena il docente interviene, senza che lo studente debba aggiornare.
  useEffect(() => {
    if (!student) return;
    if (student.status === 'validated' && exam?.available) return;
    const id = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 20_000);
    return () => clearInterval(id);
  }, [student?.status, exam?.available, refresh]);

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
      {!histLoading && !histError && (
        <ProgressView
          sessions={sessions}
          subject={{ name: student.fullName, subtitle: `${student.email}${student.class ? ` · ${student.class}` : ''}` }}
        />
      )}
    </AppShell>
  );
}
