import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { useTheme } from '../../hooks/useTheme';
import { useFocusMonitor } from '../../hooks/useFocusMonitor';
import { useStudentSync } from '../../hooks/useStudentSync';
import { useTeacherCommands } from '../../hooks/useTeacherCommands';
import { useAuth } from '../../hooks/useAuth';
import { SyncIndicator } from '../ui/SyncIndicator';
import type { RecoverableSession } from '../../lib/studentApi';
import type { DatiStudente, MotivoConsegna, VerificaId } from '../../types/domain';
import { StudentInfoScreen } from './StudentInfoScreen';
import { TestScreen } from './TestScreen';
import { ReviewScreen } from './ReviewScreen';
import { ResultScreen } from './ResultScreen';
import { InterruptedOverlay, TeacherMessageModal } from './ExamInterventions';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { DashboardLink } from '../ui/DashboardLink';
import { getVerifica } from '../../data/verifiche';
import { gradeVerifica } from '../../lib/grading';
import { buildSommario } from '../../lib/pdfData';
import { signSommario } from '../../lib/pdfSign';

interface Props {
  categoria: 'verifica' | 'esercitazione';
}

export function TestFlow({ categoria }: Props) {
  const { student, exam, loading } = useAuth();
  const {
    session,
    startTest,
    resumeFromCloud,
    updateRiga,
    updateParteC,
    goPhase,
    setEsito,
    reset,
    setCategoria,
    addEventoFocus,
  } = useSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();

  const themeToggle = (
    <>
      <DashboardLink />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </>
  );

  // Identità presa dall'account (non più digitata dallo studente).
  const studente: DatiStudente | null = useMemo(
    () => (student ? { nome: student.fullName, classe: student.class || student.declaredClass || '' } : null),
    [student]
  );

  // Allinea la categoria della sessione con la route.
  useEffect(() => {
    if (session.categoria !== categoria) setCategoria(categoria);
  }, [categoria, session.categoria, setCategoria]);

  // Evita che la sessione di un altro account resti su questo browser.
  useEffect(() => {
    if (studente && session.studente && session.studente.nome !== studente.nome && session.phase !== 'info') {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studente?.nome]);

  // Anti-cheat: solo durante la verifica vera e propria.
  const monitorActive = session.phase === 'test' && categoria === 'verifica';
  useFocusMonitor(monitorActive, addEventoFocus);

  const [annulled, setAnnulled] = useState(false);
  const [annullataMotivo, setAnnullataMotivo] = useState<string | null>(null);

  // Sync server (verifiche + esercitazioni → storico personale).
  const cloudEnabled =
    !!student && session.phase !== 'info' && !!session.verificaId && !!session.answers && !annulled;
  const cloudState = session.phase === 'result' ? 'consegnata' : 'in_progress';
  const cloud = useStudentSync({
    enabled: cloudEnabled,
    categoria,
    verificaId: session.verificaId,
    verificaTitolo: session.verificaId ? getVerifica(session.verificaId)?.titolo : undefined,
    difficolta: session.verificaId ? getVerifica(session.verificaId)?.difficolta : undefined,
    startedAt: session.startedAt,
    deadlineAt: session.deadlineMs ? new Date(session.deadlineMs).toISOString() : undefined,
    durationMin: session.durataMin,
    answers: session.answers,
    eventiFocus: session.eventiFocus ?? [],
    state: cloudState,
    esito: session.esito,
    onAnnullata: () => setAnnulled(true),
  });

  // Comandi docente in tempo reale (solo durante la verifica in corso).
  const commandsActive = categoria === 'verifica' && session.phase === 'test' && !annulled;
  const commands = useTeacherCommands(commandsActive);

  useEffect(() => {
    if (commands.annulled && !annulled) {
      setAnnulled(true);
      setAnnullataMotivo(commands.annullataMotivo);
    }
  }, [commands.annulled, commands.annullataMotivo, annulled]);

  const handleResume = (s: RecoverableSession) => {
    resumeFromCloud({
      studente: s.studente,
      verificaId: s.verificaId as VerificaId,
      categoria: s.categoria,
      startedAt: s.startedAt,
      deadlineAt: s.deadlineAt,
      durationMin: s.durationMin,
      answers: s.answers,
      eventiFocus: s.eventiFocus,
    });
  };

  const verifica = useMemo(
    () => (session.verificaId ? getVerifica(session.verificaId) : undefined),
    [session.verificaId]
  );

  const [signing, setSigning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(
    async (motivo: MotivoConsegna) => {
      if (!verifica || !session.answers || !session.studente || annulled) return;
      setSubmitError(null);
      let esito;
      try {
        const startedAt = session.startedAt ? new Date(session.startedAt) : undefined;
        const eventiFocus = session.eventiFocus ?? [];
        esito = gradeVerifica(verifica, session.answers, session.studente, motivo, new Date(), startedAt, eventiFocus);
        if (commands.ammonizioni.length > 0) esito.ammonizioni = commands.ammonizioni;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('gradeVerifica failed', e);
        const msg = e instanceof Error ? e.message : String(e);
        setSubmitError(`Errore nel calcolo del voto: ${msg}. Le tue risposte sono salvate. Riprova o avvisa il docente.`);
        return;
      }

      setSigning(true);
      let sig = null;
      try {
        sig = await signSommario(buildSommario(esito));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('signSommario failed', e);
      }
      setSigning(false);

      const finalEsito = sig ? { ...esito, signature: sig.signature, signedAt: sig.signedAt } : esito;
      try {
        setEsito(finalEsito);
        void cloud.flush();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('setEsito failed', e);
        setSubmitError('Errore nel salvataggio della consegna. Riprova oppure ricarica la pagina (i dati restano salvati).');
      }
    },
    [verifica, session.answers, session.studente, session.startedAt, session.eventiFocus, annulled, commands.ammonizioni, setEsito, cloud]
  );

  useEffect(() => {
    if (!annulled && session.phase === 'test' && session.deadlineMs && Date.now() >= session.deadlineMs) {
      submit('timeout');
    }
  }, [session.phase, session.deadlineMs, submit, annulled]);

  const exitToDashboard = () => {
    reset();
    navigate('/dashboard');
  };

  // ---- Render ----

  if (loading) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <div className="card">Caricamento…</div>
        <Footer />
      </div>
    );
  }

  if (!student || !studente) {
    return <Navigate to={`/login?next=${encodeURIComponent(categoria === 'verifica' ? '/verifica' : '/esercitazione')}`} replace />;
  }

  // Overlay di prova interrotta: copre tutto finché lo studente non esce.
  if (annulled) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <InterruptedOverlay motivo={annullataMotivo} onExit={exitToDashboard} />
        <Footer />
      </div>
    );
  }

  // Gate verifica: serve account convalidato + classe abilitata.
  if (categoria === 'verifica' && session.phase !== 'result' && !exam?.available) {
    const reason =
      student.status !== 'validated'
        ? 'Il tuo account non è ancora stato convalidato dal docente.'
        : `La modalità verifica non è attiva per la tua classe${student.class ? ` (${student.class})` : ''}.`;
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <div className="card" style={{ maxWidth: 560, margin: '2rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.6rem' }} aria-hidden>🔒</div>
          <h2 style={{ marginTop: '0.4rem' }}>Verifica non disponibile</h2>
          <p className="muted">{reason}</p>
          <div className="actions" style={{ justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link to="/esercitazione" className="btn">🎯 Vai all'esercitazione</Link>
            <Link to="/dashboard" className="btn btn-secondary">Torna alla dashboard</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (session.phase === 'info' || !verifica || !session.studente) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <div className="shell-back-row">
          <Link to="/dashboard" className="back-link">← Torna alla dashboard</Link>
        </div>
        <StudentInfoScreen
          studente={studente}
          durataMin={session.durataMin}
          categoria={categoria}
          onStart={(s, v, d) => startTest(s, v, d)}
          onResume={handleResume}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'test' && session.answers && session.deadlineMs) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        {commands.current && (
          <TeacherMessageModal type={commands.current.type} message={commands.current.message} onDismiss={commands.dismiss} />
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          <SyncIndicator status={cloud.status} lastSyncAt={cloud.lastSyncAt} />
        </div>
        <TestScreen
          verifica={verifica}
          answers={session.answers}
          deadlineMs={session.deadlineMs}
          nome={session.studente.nome}
          classe={session.studente.classe}
          eventiFocus={session.eventiFocus ?? []}
          isEsercitazione={categoria === 'esercitazione'}
          onUpdateRiga={updateRiga}
          onUpdateParteC={updateParteC}
          onTermina={() => goPhase('review')}
          onTimeout={() => submit('timeout')}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'review' && session.answers) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <ReviewScreen
          verifica={verifica}
          answers={session.answers}
          onConferma={() => {
            void submit('volontaria');
          }}
          onIndietro={() => goPhase('test')}
          signing={signing}
          errore={submitError}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'result' && session.esito) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <ResultScreen esito={session.esito} onNuovaSessione={exitToDashboard} />
        <Footer />
      </div>
    );
  }

  return null;
}
