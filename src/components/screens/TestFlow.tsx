import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import { useTheme } from '../../hooks/useTheme';
import { useFocusMonitor } from '../../hooks/useFocusMonitor';
import { useCloudSync } from '../../hooks/useCloudSync';
import { SyncIndicator } from '../ui/SyncIndicator';
import type { RecoverableSession } from '../../lib/cloudSync';
import type { MotivoConsegna, VerificaId } from '../../types/domain';
import { StudentInfoScreen } from './StudentInfoScreen';
import { TestScreen } from './TestScreen';
import { ReviewScreen } from './ReviewScreen';
import { ResultScreen } from './ResultScreen';
import { Header } from '../ui/Header';
import { Footer } from '../ui/Footer';
import { ThemeToggle } from '../ui/ThemeToggle';
import { DashboardLink } from '../ui/DashboardLink';
import { getVerifica } from '../../data/verifiche';
import { gradeVerifica } from '../../lib/grading';
import { buildSommario } from '../../lib/pdfData';
import { signSommario } from '../../lib/pdfSign';
import { StudentLoginGate } from './StudentLoginGate';

interface Props {
  categoria: 'verifica' | 'esercitazione';
}

export function TestFlow({ categoria }: Props) {
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
  // Auth SSO per la verifica ufficiale. Per l'esercitazione non serve login.
  const [auth, setAuth] = useState<{ name: string; approvedClasses: string[] } | null>(null);
  const studentLogged = categoria === 'esercitazione' || auth !== null;

  const themeToggle = (
    <>
      <DashboardLink />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
    </>
  );

  // Allinea la categoria della sessione corrente con la route.
  useEffect(() => {
    if (session.categoria !== categoria) {
      setCategoria(categoria);
    }
  }, [categoria, session.categoria, setCategoria]);

  // Anti-cheat solo durante la verifica vera e propria.
  const monitorActive = studentLogged && session.phase === 'test' && categoria === 'verifica';
  useFocusMonitor(monitorActive, addEventoFocus);

  // Cloud sync solo per verifiche ufficiali.
  const cloudEnabled =
    studentLogged &&
    categoria === 'verifica' &&
    session.phase !== 'info' &&
    !!session.studente &&
    !!session.verificaId;
  const cloudState = session.phase === 'result' ? 'consegnata' : 'in_progress';
  const cloud = useCloudSync({
    enabled: cloudEnabled,
    studente: session.studente,
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
  });

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
      if (!verifica || !session.answers || !session.studente) return;
      setSubmitError(null);
      let esito;
      try {
        const startedAt = session.startedAt ? new Date(session.startedAt) : undefined;
        const eventiFocus = session.eventiFocus ?? [];
        esito = gradeVerifica(
          verifica,
          session.answers,
          session.studente,
          motivo,
          new Date(),
          startedAt,
          eventiFocus
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('gradeVerifica failed', e);
        const msg = e instanceof Error ? e.message : String(e);
        setSubmitError(
          `Errore nel calcolo del voto: ${msg}. Le tue risposte sono salvate. Riprova o avvisa il docente.`
        );
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

      const finalEsito = sig
        ? { ...esito, signature: sig.signature, signedAt: sig.signedAt }
        : esito;
      try {
        setEsito(finalEsito);
        void cloud.flush();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('setEsito failed', e);
        setSubmitError(
          'Errore nel salvataggio della consegna. Riprova oppure ricarica la pagina (i dati restano salvati).'
        );
      }
    },
    [verifica, session.answers, session.studente, session.startedAt, session.eventiFocus, setEsito, cloud]
  );

  useEffect(() => {
    if (session.phase === 'test' && session.deadlineMs && Date.now() >= session.deadlineMs) {
      submit('timeout');
    }
  }, [session.phase, session.deadlineMs, submit]);

  // Gate SSO per la modalità verifica.
  if (categoria === 'verifica' && !auth && session.phase !== 'result') {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <StudentLoginGate onAuthenticated={setAuth} />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'info' || !verifica || !session.studente) {
    return (
      <div className="shell">
        <Header actions={themeToggle} />
        <div className="shell-back-row">
          <Link to="/" className="back-link">← Torna alla home</Link>
        </div>
        <StudentInfoScreen
          durataMin={session.durataMin}
          categoria={categoria}
          lockedNome={categoria === 'verifica' ? auth?.name : undefined}
          approvedClasses={categoria === 'verifica' ? auth?.approvedClasses : undefined}
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
        {categoria === 'verifica' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <SyncIndicator status={cloud.status} lastSyncAt={cloud.lastSyncAt} />
          </div>
        )}
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
        <ResultScreen
          esito={session.esito}
          onNuovaSessione={() => {
            reset();
            navigate('/');
          }}
        />
        <Footer />
      </div>
    );
  }

  return null;
}
