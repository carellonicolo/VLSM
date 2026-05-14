import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from './hooks/useSession';
import { useTheme } from './hooks/useTheme';
import { useFocusMonitor } from './hooks/useFocusMonitor';
import { LoginScreen } from './components/screens/LoginScreen';
import { StudentInfoScreen } from './components/screens/StudentInfoScreen';
import { TestScreen } from './components/screens/TestScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { Header } from './components/ui/Header';
import { Footer } from './components/ui/Footer';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { getVerifica } from './data/verifiche';
import { gradeVerifica } from './lib/grading';
import { buildSommario } from './lib/pdfData';
import { signSommario } from './lib/pdfSign';
import type { MotivoConsegna } from './types/domain';

const AdminScreen = lazy(() => import('./components/admin/AdminScreen').then((m) => ({ default: m.AdminScreen })));

type AppMode = 'login' | 'student' | 'admin';

export default function App() {
  const { session, startTest, updateRiga, updateParteC, goPhase, setEsito, reset, setCategoria, addEventoFocus } = useSession();
  const { theme, toggle: toggleTheme } = useTheme();
  const [mode, setMode] = useState<AppMode>('login');

  const themeToggle = <ThemeToggle theme={theme} onToggle={toggleTheme} />;

  // Monitora i cambi di focus solo durante la verifica vera e propria.
  const monitorActive = mode === 'student' && session.phase === 'test' && session.categoria === 'verifica';
  useFocusMonitor(monitorActive, addEventoFocus);

  const verifica = useMemo(() => (session.verificaId ? getVerifica(session.verificaId) : undefined), [session.verificaId]);
  const categoria = session.categoria ?? 'verifica';

  const [signing, setSigning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = useCallback(
    async (motivo: MotivoConsegna) => {
      if (!verifica || !session.answers || !session.studente) return;
      setSubmitError(null);
      // Calcolo del voto: avvolto in try/catch per non lasciare mai lo studente
      // in una schermata bloccata. Se anche il grading fallisse, gli mostriamo
      // un errore visibile e i suoi dati restano in localStorage.
      let esito;
      try {
        const startedAt = session.startedAt ? new Date(session.startedAt) : undefined;
        const eventiFocus = session.eventiFocus ?? [];
        esito = gradeVerifica(verifica, session.answers, session.studente, motivo, new Date(), startedAt, eventiFocus);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('gradeVerifica failed', e);
        const msg = e instanceof Error ? e.message : String(e);
        setSubmitError(`Errore nel calcolo del voto: ${msg}. Le tue risposte sono salvate. Riprova o avvisa il docente.`);
        return;
      }

      // Firma HMAC: tutto opzionale, errori vengono ignorati lasciando esito
      // non firmato (l'admin lo vedrà come "non firmato" ma resta valido).
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
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('setEsito failed', e);
        setSubmitError('Errore nel salvataggio della consegna. Riprova oppure ricarica la pagina (i dati restano salvati).');
      }
    },
    [verifica, session.answers, session.studente, session.startedAt, session.eventiFocus, setEsito]
  );

  useEffect(() => {
    if (session.phase === 'test' && session.deadlineMs && Date.now() >= session.deadlineMs) {
      submit('timeout');
    }
  }, [session.phase, session.deadlineMs, submit]);

  if (mode === 'login' && session.phase !== 'result') {
    return (
      <div className="shell">
        {themeToggle}
        <Header />
        <LoginScreen
          onSuccess={() => {
            setCategoria('verifica');
            setMode('student');
          }}
          onEsercitazione={() => {
            setCategoria('esercitazione');
            setMode('student');
          }}
          onAdmin={() => setMode('admin')}
        />
        <Footer />
      </div>
    );
  }

  if (mode === 'admin') {
    return (
      <div className="shell">
        {themeToggle}
        <Header />
        <Suspense fallback={<div className="card">Caricamento modalità docente…</div>}>
          <AdminScreen onExit={() => setMode('login')} />
        </Suspense>
        <Footer />
      </div>
    );
  }

  if (session.phase === 'info' || !verifica || !session.studente) {
    return (
      <div className="shell">
        {themeToggle}
        <Header />
        <StudentInfoScreen
          durataMin={session.durataMin}
          categoria={categoria}
          onStart={(s, v, d) => startTest(s, v, d)}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'test' && session.answers && session.deadlineMs) {
    return (
      <div className="shell">
        {themeToggle}
        <Header />
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
        {themeToggle}
        <Header />
        <ReviewScreen
          verifica={verifica}
          answers={session.answers}
          onConferma={() => { void submit('volontaria'); }}
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
        {themeToggle}
        <Header />
        <ResultScreen esito={session.esito} onNuovaSessione={() => { reset(); setMode('login'); }} />
        <Footer />
      </div>
    );
  }

  return null;
}
