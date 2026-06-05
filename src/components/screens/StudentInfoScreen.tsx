import { useState } from 'react';
import type { Categoria, DatiStudente, Difficolta, VerificaId } from '../../types/domain';
import { DIFFICOLTA_ORDER } from '../../types/domain';
import { pickVerifica } from '../../lib/pickVerifica';
import { verificheByDifficolta } from '../../data/verifiche';
import { studentRecover, type RecoverableSession } from '../../lib/studentApi';
import { RecoverModal } from './RecoverModal';

interface Props {
  studente: DatiStudente;
  durataMin: number;
  categoria: Categoria;
  /** Livello impostato dal docente per la verifica: Base/Media/Alta/Esperta | 'random' | 'student' | null. */
  examLevel?: string | null;
  onStart: (studente: DatiStudente, verificaId: VerificaId, durataMin: number) => void;
  onResume: (sessione: RecoverableSession) => void;
}

const RAW_DURATA = Number(import.meta.env.VITE_DURATA_DEFAULT_MIN ?? '0');
const DURATA_BLOCCATA_VERIFICA = Number.isFinite(RAW_DURATA) && RAW_DURATA > 0 ? RAW_DURATA : null;
const CONCRETE: Difficolta[] = ['Base', 'Media', 'Alta', 'Esperta'];

export function StudentInfoScreen({ studente, durataMin, categoria, examLevel, onStart, onResume }: Props) {
  const isEsercitazione = categoria === 'esercitazione';
  const durataBloccata = isEsercitazione ? null : DURATA_BLOCCATA_VERIFICA;

  // Modalità livello (solo per la verifica): il docente può fissarlo, renderlo
  // casuale, o lasciarlo scegliere allo studente.
  const lockedLevel = !isEsercitazione && examLevel && (CONCRETE as string[]).includes(examLevel) ? (examLevel as Difficolta) : null;
  const randomMode = !isEsercitazione && examLevel === 'random';
  const studentChooses = isEsercitazione || !examLevel || examLevel === 'student';

  const [durata, setDurata] = useState(durataBloccata ?? durataMin);
  const [difficolta, setDifficolta] = useState<Difficolta>(lockedLevel ?? 'Base');
  const [checkingRecover, setCheckingRecover] = useState(false);
  const [recoverable, setRecoverable] = useState<RecoverableSession | null>(null);
  const [recoverConsumed, setRecoverConsumed] = useState(false);

  const valid = durata > 0;

  const startNew = () => {
    let level: Difficolta = lockedLevel ?? difficolta;
    if (randomMode) {
      const avail = DIFFICOLTA_ORDER.filter((d) => verificheByDifficolta(d, categoria).length > 0);
      level = avail[Math.floor(Math.random() * avail.length)] ?? 'Base';
    }
    const verificaId = pickVerifica(level, categoria);
    onStart(studente, verificaId, durataBloccata ?? durata);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    if (isEsercitazione || recoverConsumed) {
      startNew();
      return;
    }
    setCheckingRecover(true);
    const found = await studentRecover();
    setCheckingRecover(false);
    if (found) {
      setRecoverable(found);
      return;
    }
    startNew();
  };

  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 560, margin: '2rem auto' }}>
      <h2 style={{ marginTop: 0 }}>{isEsercitazione ? '🎯 Esercitazione libera' : '📝 Inizia la verifica'}</h2>

      <div className="identity-box">
        <div><span className="muted">Studente:</span> <strong>{studente.nome}</strong></div>
        <div><span className="muted">Classe:</span> <strong>{studente.classe || '—'}</strong></div>
      </div>

      <p className="muted">
        {isEsercitazione
          ? 'Scegli il livello: verrà sorteggiata una simulazione tra quelle disponibili. Le simulazioni non valgono come verifica ufficiale.'
          : 'Scegli il livello e la durata. All\'avvio verrà sorteggiata casualmente una delle verifiche disponibili.'}
      </p>

      {!isEsercitazione && (
        <div className="warn-banner">
          <strong>⚠️ ATTENZIONE — La verifica è monitorata</strong>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>
            Durante lo svolgimento il sistema registra ogni uscita dalla pagina (cambio scheda, minimizzazione,
            apertura di altre app) e gli eventuali interventi del docente (alert, ammonizioni). Il docente può
            inviarti messaggi o <strong>interrompere la prova</strong> in tempo reale. Distrazioni e ammonizioni
            saranno <strong>visibili sul PDF</strong> consegnato al docente.
          </p>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem' }}>
            Le risposte vengono <strong>salvate sul server</strong> per consentirne il recupero in caso di guasto del PC.
          </p>
        </div>
      )}

      <div className="field-row">
        <div className="field">
          <label htmlFor="difficolta">Livello di difficoltà</label>
          {studentChooses ? (
            <select
              id="difficolta"
              value={difficolta}
              onChange={(e) => setDifficolta(e.target.value as Difficolta)}
              style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border)', borderRadius: 5, fontSize: '0.95rem', fontFamily: 'inherit', background: 'var(--input-bg)' }}
            >
              {DIFFICOLTA_ORDER.map((d) => {
                const count = verificheByDifficolta(d, categoria).length;
                const label = isEsercitazione ? `simulazion${count === 1 ? 'e' : 'i'}` : `verific${count === 1 ? 'a' : 'he'}`;
                return (
                  <option key={d} value={d} disabled={count === 0}>
                    {d} ({count} {label})
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="identity-box" style={{ margin: 0 }}>
              {lockedLevel
                ? <span>Impostato dal docente: <strong>{lockedLevel}</strong></span>
                : <span>🎲 <strong>Casuale</strong> — sorteggiato all'avvio</span>}
            </div>
          )}
        </div>
        <div className="field">
          <label htmlFor="durata">
            Durata (minuti)
            {durataBloccata !== null && <span className="muted" style={{ marginLeft: '0.5rem', fontWeight: 400 }}>— impostata dal docente</span>}
          </label>
          <input
            id="durata"
            type="number"
            min={5}
            max={180}
            value={durataBloccata ?? durata}
            onChange={(e) => setDurata(Number(e.target.value))}
            readOnly={durataBloccata !== null}
            disabled={durataBloccata !== null}
          />
        </div>
      </div>

      <button className="btn" type="submit" disabled={!valid || checkingRecover} style={{ width: '100%' }}>
        {checkingRecover
          ? '⏳ Verifico se hai una sessione interrotta…'
          : isEsercitazione
            ? 'Sorteggia simulazione e inizia'
            : 'Sorteggia verifica e inizia'}
      </button>

      {recoverable && (
        <RecoverModal
          session={recoverable}
          onRiprendi={() => {
            const r = recoverable;
            setRecoverable(null);
            onResume(r);
          }}
          onNuova={() => {
            setRecoverable(null);
            setRecoverConsumed(true);
            startNew();
          }}
          onAnnulla={() => setRecoverable(null)}
        />
      )}
    </form>
  );
}
