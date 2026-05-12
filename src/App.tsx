import { useCallback, useEffect, useMemo, useState } from 'react';
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
import type { MotivoConsegna } from './types/domain';

export default function App() {
  const { session, startTest, updateRiga, updateParteC, goPhase, setEsito, reset, setCategoria } = useSession();
  const [loggedIn, setLoggedIn] = useState(false);

  const verifica = useMemo(() => (session.verificaId ? getVerifica(session.verificaId) : undefined), [session.verificaId]);
  const categoria = session.categoria ?? 'verifica';

  const submit = useCallback(
    (motivo: MotivoConsegna) => {
      if (!verifica || !session.answers || !session.studente) return;
      const startedAt = session.startedAt ? new Date(session.startedAt) : undefined;
      const esito = gradeVerifica(verifica, session.answers, session.studente, motivo, new Date(), startedAt);
      setEsito(esito);
    },
    [verifica, session.answers, session.studente, session.startedAt, setEsito]
  );

  useEffect(() => {
    if (session.phase === 'test' && session.deadlineMs && Date.now() >= session.deadlineMs) {
      submit('timeout');
    }
  }, [session.phase, session.deadlineMs, submit]);

  // Login screen visibile solo se non loggato come "verifica". In esercitazione
  // si entra direttamente senza login.
  const needsLogin = !loggedIn && categoria === 'verifica' && session.phase !== 'result';

  if (needsLogin) {
    return (
      <div className="shell">
        <Header />
        <LoginScreen
          onSuccess={() => {
            setCategoria('verifica');
            setLoggedIn(true);
          }}
          onEsercitazione={() => {
            setCategoria('esercitazione');
            setLoggedIn(true);
          }}
        />
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
          onConferma={() => submit('volontaria')}
          onIndietro={() => goPhase('test')}
        />
        <Footer />
      </div>
    );
  }

  if (session.phase === 'result' && session.esito) {
    return (
      <div className="shell">
        <Header />
        <ResultScreen esito={session.esito} onNuovaSessione={reset} />
        <Footer />
      </div>
    );
  }

  return null;
}
