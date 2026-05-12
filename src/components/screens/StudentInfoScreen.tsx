import { useState } from 'react';
import type { DatiStudente, VerificaId } from '../../types/domain';
import { pickVerifica } from '../../lib/pickVerifica';

interface Props {
  durataMin: number;
  onStart: (studente: DatiStudente, verificaId: VerificaId, durataMin: number) => void;
}

const RAW_DURATA = Number(import.meta.env.VITE_DURATA_DEFAULT_MIN ?? '0');
const DURATA_BLOCCATA = Number.isFinite(RAW_DURATA) && RAW_DURATA > 0 ? RAW_DURATA : null;

export function StudentInfoScreen({ durataMin, onStart }: Props) {
  const [nome, setNome] = useState('');
  const [classe, setClasse] = useState('');
  const [durata, setDurata] = useState(DURATA_BLOCCATA ?? durataMin);

  const valid = nome.trim().length >= 2 && classe.trim().length >= 1 && durata > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const verificaId = pickVerifica();
    onStart({ nome: nome.trim(), classe: classe.trim() }, verificaId, DURATA_BLOCCATA ?? durata);
  };

  return (
    <form className="card" onSubmit={submit} style={{ maxWidth: 560, margin: '2rem auto' }}>
      <h2 style={{ marginTop: 0 }}>Dati studente</h2>
      <p className="muted">
        Inserisci nome, classe e durata. All'avvio verrà sorteggiata casualmente una delle 6 verifiche disponibili.
      </p>
      <div className="field-row">
        <div className="field">
          <label htmlFor="nome">Nome e cognome</label>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="classe">Classe</label>
          <input id="classe" type="text" value={classe} onChange={(e) => setClasse(e.target.value)} placeholder="es. 5A SRI" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="durata">
          Durata (minuti)
          {DURATA_BLOCCATA !== null && <span className="muted" style={{ marginLeft: '0.5rem', fontWeight: 400 }}>— impostata dal docente</span>}
        </label>
        <input
          id="durata"
          type="number"
          min={5}
          max={180}
          value={DURATA_BLOCCATA ?? durata}
          onChange={(e) => setDurata(Number(e.target.value))}
          readOnly={DURATA_BLOCCATA !== null}
          disabled={DURATA_BLOCCATA !== null}
        />
      </div>
      <button className="btn" type="submit" disabled={!valid} style={{ width: '100%' }}>
        Sorteggia verifica e inizia
      </button>
    </form>
  );
}
