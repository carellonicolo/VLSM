import type { RecoverableSession } from '../../lib/cloudSync';
import { formatTimeOfDay } from '../../lib/format';

interface Props {
  session: RecoverableSession;
  onRiprendi: () => void;
  onNuova: () => void;
  onAnnulla: () => void;
}

export function RecoverModal({ session, onRiprendi, onNuova, onAnnulla }: Props) {
  const started = new Date(session.startedAt);
  const updated = new Date(session.updatedAt);
  const deadline = new Date(session.deadlineAt);
  const now = Date.now();
  const minutiResidui = Math.max(0, Math.round((deadline.getTime() - now) / 60000));
  const minutiDallaUltima = Math.max(0, Math.round((now - updated.getTime()) / 60000));

  const numCelle = countAnswers(
    session.answers as unknown as Record<string, { righe?: unknown[]; parteA?: unknown[]; parteB?: unknown[]; parteC?: unknown }>
  );

  return (
    <div className="alert-overlay" role="alertdialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 560, width: '100%', borderColor: 'var(--primary)', borderWidth: 2 }}>
        <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>🔔 Sessione interrotta trovata</h2>
        <p>
          Risulta una verifica iniziata alle <strong>{formatTimeOfDay(session.startedAt)}</strong>
          {' '}({minutiDallaUltima} min fa l'ultimo salvataggio) per{' '}
          <strong>{session.studente.nome} · {session.studente.classe}</strong>.
        </p>
        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
          <li>Verifica: <strong>{session.verificaTitolo}</strong>{session.difficolta ? ` (${session.difficolta})` : ''}</li>
          <li>Tempo residuo: <strong>{minutiResidui > 0 ? `${minutiResidui} min` : 'scaduto'}</strong></li>
          <li>Celle compilate fino a quel momento: <strong>{numCelle}</strong></li>
          <li>Distrazioni rilevate: <strong>{session.eventiFocus.length}</strong></li>
          <li className="muted" style={{ fontSize: '0.8rem' }}>
            Sessione iniziata: {started.toLocaleString('it-IT')}
          </li>
        </ul>
        {minutiResidui === 0 && (
          <div
            style={{
              background: 'var(--warn-bg)',
              color: 'var(--warn-text)',
              padding: '0.5rem 0.75rem',
              borderRadius: 4,
              fontSize: '0.85rem',
              marginBottom: '0.5rem',
            }}
          >
            ⚠ Il tempo è scaduto. Se riprendi, la verifica verrà consegnata automaticamente con le risposte attualmente salvate.
          </div>
        )}
        <div className="actions" style={{ flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn" type="button" onClick={onRiprendi}>
            ↩ Riprendi questa sessione
          </button>
          <button className="btn btn-secondary" type="button" onClick={onNuova}>
            + Inizia una nuova
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onAnnulla}
            style={{ marginLeft: 'auto' }}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

function countAnswers(esercizi: Record<string, { righe?: unknown[]; parteA?: unknown[]; parteB?: unknown[]; parteC?: unknown }>): number {
  if (!esercizi || typeof esercizi !== 'object') return 0;
  let count = 0;
  const containers = Object.values(esercizi);
  for (const ex of containers) {
    if (!ex) continue;
    for (const arr of [ex.righe, ex.parteA, ex.parteB]) {
      if (Array.isArray(arr)) {
        for (const row of arr) {
          if (row && typeof row === 'object') count += Object.keys(row).filter((k) => (row as Record<string, string>)[k]?.toString().trim() !== '').length;
        }
      }
    }
    if (ex.parteC && typeof ex.parteC === 'object') {
      count += Object.keys(ex.parteC).filter((k) => (ex.parteC as Record<string, string>)[k]?.toString().trim() !== '').length;
    }
  }
  return count;
}
