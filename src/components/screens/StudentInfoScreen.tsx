import { useState } from 'react';
import type { Categoria, DatiStudente, Difficolta, VerificaId } from '../../types/domain';
import { DIFFICOLTA_ORDER } from '../../types/domain';
import { pickVerifica } from '../../lib/pickVerifica';
import { verificheByDifficolta } from '../../data/verifiche';
import { cloudRecover, type RecoverableSession } from '../../lib/cloudSync';
import { RecoverModal } from './RecoverModal';

interface Props {
  durataMin: number;
  categoria: Categoria;
  /** Nome autenticato via SSO (verifica ufficiale): bloccato, non modificabile. */
  lockedNome?: string;
  /** Classi approvate dal docente per l'utente loggato (verifica ufficiale). */
  approvedClasses?: string[];
  onStart: (studente: DatiStudente, verificaId: VerificaId, durataMin: number) => void;
  onResume: (sessione: RecoverableSession) => void;
}

const RAW_DURATA = Number(import.meta.env.VITE_DURATA_DEFAULT_MIN ?? '0');
const DURATA_BLOCCATA_VERIFICA = Number.isFinite(RAW_DURATA) && RAW_DURATA > 0 ? RAW_DURATA : null;

export function StudentInfoScreen({ durataMin, categoria, lockedNome, approvedClasses, onStart, onResume }: Props) {
  const isEsercitazione = categoria === 'esercitazione';
  const durataBloccata = isEsercitazione ? null : DURATA_BLOCCATA_VERIFICA;

  // In verifica nome e classe arrivano dall'SSO: nome bloccato, classe scelta
  // tra quelle approvate dal docente.
  const nomeBloccato = !!lockedNome;
  const classiApprovate = approvedClasses ?? [];

  const [nome, setNome] = useState(lockedNome ?? '');
  const [classe, setClasse] = useState(classiApprovate.length > 0 ? classiApprovate[0] : '');
  const [durata, setDurata] = useState(durataBloccata ?? durataMin);
  const [difficolta, setDifficolta] = useState<Difficolta>('Base');
  const [checkingRecover, setCheckingRecover] = useState(false);
  const [recoverable, setRecoverable] = useState<RecoverableSession | null>(null);
  const [recoverConsumed, setRecoverConsumed] = useState(false);

  const valid = nome.trim().length >= 2 && classe.trim().length >= 1 && durata > 0;

  const startNew = () => {
    const verificaId = pickVerifica(difficolta, categoria);
    onStart({ nome: nome.trim(), classe: classe.trim() }, verificaId, durataBloccata ?? durata);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // Le esercitazioni non hanno recupero cloud.
    if (isEsercitazione || recoverConsumed) {
      startNew();
      return;
    }
    setCheckingRecover(true);
    const found = await cloudRecover(nome.trim(), classe.trim());
    setCheckingRecover(false);
    if (found) {
      setRecoverable(found);
      return;
    }
    startNew();
  };

  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 560, margin: '2rem auto' }}>
      <h2 style={{ marginTop: 0 }}>
        {isEsercitazione ? '🎯 Esercitazione libera' : 'Dati studente'}
      </h2>
      <p className="muted">
        {isEsercitazione
          ? 'Inserisci i tuoi dati e scegli il livello. Verrà sorteggiata una simulazione tra quelle disponibili per quel livello. Le simulazioni non valgono come verifica ufficiale.'
          : 'Inserisci nome, classe e durata. All\'avvio verrà sorteggiata casualmente una delle verifiche disponibili.'}
      </p>

      {!isEsercitazione && (
        <div className="warn-banner">
          <strong>⚠️ ATTENZIONE — La verifica è monitorata</strong>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>
            Durante lo svolgimento il sistema registra ogni volta che esci dalla pagina (cambio scheda, minimizzazione,
            apertura di altre applicazioni). Il numero di abbandoni e la durata totale lontano dalla pagina
            saranno <strong>visibili sul PDF firmato</strong> e consegnati al docente.
          </p>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem' }}>
            Le risposte vengono inoltre <strong>salvate temporaneamente su server Cloudflare cifrato</strong>
            {' '}per consentirne il recupero in caso di guasto del PC o crash del browser.
          </p>
        </div>
      )}
      {nomeBloccato && (
        <p className="muted" style={{ marginTop: 0 }}>
          Accesso effettuato come <strong>{nome}</strong>. Nome e classe provengono dal tuo
          account e non sono modificabili.
        </p>
      )}
      <div className="field-row">
        <div className="field">
          <label htmlFor="nome">Nome e cognome</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus={!nomeBloccato}
            readOnly={nomeBloccato}
            disabled={nomeBloccato}
          />
        </div>
        <div className="field">
          <label htmlFor="classe">Classe</label>
          {classiApprovate.length > 1 ? (
            <select
              id="classe"
              value={classe}
              onChange={(e) => setClasse(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border)', borderRadius: 5, fontSize: '0.95rem', fontFamily: 'inherit', background: 'white' }}
            >
              {classiApprovate.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          ) : classiApprovate.length === 1 ? (
            <input id="classe" type="text" value={classe} readOnly disabled />
          ) : (
            <input id="classe" type="text" value={classe} onChange={(e) => setClasse(e.target.value)} placeholder="es. 5A SRI" />
          )}
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="difficolta">Livello di difficoltà</label>
          <select
            id="difficolta"
            value={difficolta}
            onChange={(e) => setDifficolta(e.target.value as Difficolta)}
            style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border)', borderRadius: 5, fontSize: '0.95rem', fontFamily: 'inherit', background: 'white' }}
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
