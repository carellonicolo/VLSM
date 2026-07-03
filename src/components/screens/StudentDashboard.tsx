import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  TrendingUp,
  History,
  Check,
  Clock,
  RefreshCw,
  Lock,
  Calculator,
} from 'lucide-react';
import { AppShell } from '../ui/AppShell';
import { SidebarShell, type SidebarItem } from '../ui/SidebarShell';
import { ProgressView } from '../dashboard/ProgressView';
import { useAuth } from '../../hooks/useAuth';
import { studentGetSession, studentHistory, type HistorySession } from '../../lib/studentApi';

type Section = 'overview' | 'verifica' | 'andamento' | 'storico';

function StatusBanner() {
  const { student, exam, refresh } = useAuth();
  if (!student) return null;

  if (student.status === 'validated') {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} color="var(--success)" />
          <strong style={{ color: 'var(--success)' }}>Account convalidato</strong>
          <button
            type="button"
            onClick={() => void refresh()}
            title="Aggiorna stato"
            aria-label="Aggiorna stato"
            style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0.1rem', color: 'var(--muted)', display: 'inline-flex' }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
        <div className="muted" style={{ marginTop: '0.25rem' }}>
          Classe: <strong>{student.class}</strong>.{' '}
          {exam?.available
            ? 'La modalità verifica è attiva per la tua classe: puoi svolgere una verifica.'
            : 'La modalità verifica non è attiva al momento. Potrai svolgerla quando il docente la sbloccherà per la tua classe.'}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--warn-border)', background: 'var(--warn-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Clock size={18} color="var(--warn-text)" />
        <strong style={{ color: 'var(--warn-text)' }}>In attesa di convalida</strong>
      </div>
      <div style={{ color: 'var(--warn-text)', marginTop: '0.25rem', fontSize: '0.92rem' }}>
        Il tuo account non è ancora stato convalidato dal docente. Puoi comunque allenarti con le
        <strong> esercitazioni libere</strong>. Per le verifiche ufficiali attendi la convalida
        {student.declaredClass ? <> (classe dichiarata: <strong>{student.declaredClass}</strong>)</> : null}.
      </div>
      <button
        className="btn btn-secondary"
        type="button"
        style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        onClick={() => void refresh()}
      >
        <RefreshCw size={15} /> Controlla di nuovo
      </button>
    </div>
  );
}

export function StudentDashboard() {
  const { student, exam, loading, refresh } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('overview');
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

  const items: SidebarItem[] = [
    { id: 'overview', label: 'Panoramica', icon: <LayoutDashboard size={18} />, active: section === 'overview', onClick: () => setSection('overview') },
    // Scorciatoie dirette: portano subito alla prova/strumento senza passaggi intermedi.
    { id: 'esercitazione', label: 'Esercitazione', icon: <Target size={18} />, active: false, onClick: () => navigate('/esercitazione') },
    { id: 'verifica', label: 'Verifica', icon: <ClipboardCheck size={18} />, dot: verificaAvailable, active: section === 'verifica', onClick: () => (verificaAvailable ? navigate('/verifica') : setSection('verifica')) },
    { id: 'calcolatori', label: 'Calcolatori', icon: <Calculator size={18} />, active: false, onClick: () => navigate('/calcolatori') },
    { id: 'andamento', label: 'Andamento', icon: <TrendingUp size={18} />, active: section === 'andamento', onClick: () => setSection('andamento') },
    { id: 'storico', label: 'Storico', icon: <History size={18} />, active: section === 'storico', onClick: () => setSection('storico') },
  ];

  const esercitazioneCard = (
    <Link to="/esercitazione" className="card landing-card dash-action">
      <div className="landing-card-icon" aria-hidden><Target size={30} /></div>
      <h3 className="landing-card-title">Esercitazione</h3>
      <p className="landing-card-text">Allenati con una simulazione. Sempre disponibile, entra nel tuo storico.</p>
      <span className="landing-card-cta">Inizia →</span>
    </Link>
  );

  const verificaCard = verificaAvailable ? (
    <Link to="/verifica" className="card landing-card dash-action">
      <div className="landing-card-icon" aria-hidden><ClipboardCheck size={30} /></div>
      <h3 className="landing-card-title">Verifica</h3>
      <p className="landing-card-text">Modalità ufficiale con timer e correzione automatica. Attiva per la tua classe.</p>
      <span className="landing-card-cta">Inizia la verifica →</span>
    </Link>
  ) : (
    <div className="card landing-card dash-action dash-action-disabled" aria-disabled title={verificaReason}>
      <div className="landing-card-icon" aria-hidden><Lock size={30} /></div>
      <h3 className="landing-card-title">Verifica</h3>
      <p className="landing-card-text">{verificaReason || 'Verifica non disponibile al momento.'}</p>
      <span className="landing-card-cta" style={{ opacity: 0.6 }}>Non disponibile</span>
    </div>
  );

  const calcolatoriCard = (
    <Link to="/calcolatori" className="card landing-card dash-action">
      <div className="landing-card-icon" aria-hidden><Calculator size={30} /></div>
      <h3 className="landing-card-title">Calcolatori</h3>
      <p className="landing-card-text">Subnet IPv4/IPv6, VLSM, FLSM e guida didattica. Accesso libero.</p>
      <span className="landing-card-cta">Apri →</span>
    </Link>
  );

  const progress = histLoading ? (
    <div className="card muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Clock size={15} /> Caricamento storico…
    </div>
  ) : histError ? (
    <div className="card error-msg">{histError}</div>
  ) : (
    <ProgressView
      sessions={sessions}
      subject={{ name: student.fullName, subtitle: `${student.email}${student.class ? ` · ${student.class}` : ''}` }}
      fetchSessionForPdf={async (id) => {
        const r = await studentGetSession(id);
        return r.ok && r.detail ? r.detail : null;
      }}
    />
  );

  const footer = <>Sistemi e Reti · ITIS Marconi VR</>;

  return (
    <AppShell>
      <SidebarShell groupLabel="La mia area" items={items} footer={footer}>
        <div className="dash-head">
          <div>
            <h2 style={{ margin: 0 }}>Ciao, {student.fullName.split(' ')[0]}</h2>
            <div className="muted">{student.email}{student.class ? ` · ${student.class}` : ''}</div>
          </div>
        </div>

        {section === 'overview' && (
          <>
            <StatusBanner />
            <div className="dash-actions">
              {esercitazioneCard}
              {verificaCard}
              {calcolatoriCard}
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Il tuo andamento</h2>
            {progress}
          </>
        )}

        {section === 'verifica' && (
          <>
            <StatusBanner />
            <div className="dash-actions">{verificaCard}</div>
          </>
        )}

        {section === 'andamento' && progress}

        {section === 'storico' && progress}
      </SidebarShell>
    </AppShell>
  );
}
