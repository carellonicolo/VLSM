import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from './hooks/useSession';
import { LoginScreen } from './components/screens/LoginScreen';
import { StudentInfoScreen } from './components/screens/StudentInfoScreen';
import { TestScreen } from './components/screens/TestScreen';
import { ReviewScreen } from './components/screens/ReviewScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { Header } from './components/ui/Header';
import { Footer } from './components/ui/Footer';
import { getVerifica } from './data/verifiche';
import { gradeVerifica } from './lib/grading';
import { buildSommario } from './lib/pdfData';
import { signSommario } from './lib/pdfSign';
import type { MotivoConsegna } from './types/domain';

const AdminScreen = lazy(() => import('./components/admin/AdminScreen').then((m) => ({ default: m.AdminScreen })));

type AppMode = 'login' | 'student' | 'admin';

export default function App() {
  const { session, startTest, updateRiga, updateParteC, goPhase, setEsito, reset, setCategoria } = useSession();
  const [mode, setMode] = useState<AppMode>('login');

  const verifica = useMemo(() => (session.verificaId ? getVerifica(session.verificaId) : undefined), [session.verificaId]);
  const categoria = session.categoria ?? 'verifica';

  const [signing, setSigning] = useState(false);
  const submit = useCallback(
    async (motivo: MotivoConsegna) => {
      if (!verifica || !session.answers || !session.studente) return;
      const startedAt = session.startedAt ? new Date(session.startedAt) : undefined;
      const esito = gradeVerifica(verifica, session.answers, session.studente, motivo, new Date(), startedAt);
      setSigning(true);
      const sig = await signSommario(buildSommario(esito));
      setSigning(false);
      const finalEsito = sig
        ? { ...esito, signature: sig.signature, signedAt: sig.signedAt }
        : esito;
      setEsito(finalEsito);
    },
    [verifica, session.answers, session.studente, session.startedAt, setEsito]
  );

  useEffect(() => {
    if (session.phase === 'test' && session.deadlineMs && Date.now() >= session.deadlineMs) {
      submit('timeout');
    }
  }, [session.phase, session.deadlineMs, submit]);

  if (mode === 'login' && session.phase !== 'result') {
    return (
      <div className="shell">
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
        <Header />
        <TestScreen
          verifica={verifica}
          answers={session.answers}
          deadlineMs={session.deadlineMs}
          nome={session.studente.nome}
          classe={session.studente.classe}
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
        <Header />
        <ReviewScreen
          verifica={verifica}
          answers={session.answers}
          onConferma={() => { void submit('volontaria'); }}
          onIndietro={() => goPhase('test')}
          signing={signing}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'result' && session.esito) {
    return (
      <div className="shell">
        <Header />
        <ResultScreen esito={session.esito} onNuovaSessione={() => { reset(); setMode('login'); }} />
        <Footer />
      </div>
    );
  }

  return null;
}
