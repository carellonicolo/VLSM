import { useState } from 'react';
import type { Categoria, DatiStudente, Difficolta, VerificaId } from '../../types/domain';
import { DIFFICOLTA_ORDER } from '../../types/domain';
import { pickVerifica } from '../../lib/pickVerifica';
import { verificheByDifficolta } from '../../data/verifiche';

interface Props {
  durataMin: number;
  categoria: Categoria;
  onStart: (studente: DatiStudente, verificaId: VerificaId, durataMin: number) => void;
}

const RAW_DURATA = Number(import.meta.env.VITE_DURATA_DEFAULT_MIN ?? '0');
const DURATA_BLOCCATA_VERIFICA = Number.isFinite(RAW_DURATA) && RAW_DURATA > 0 ? RAW_DURATA : null;

export function StudentInfoScreen({ durataMin, categoria, onStart }: Props) {
  const isEsercitazione = categoria === 'esercitazione';
  const durataBloccata = isEsercitazione ? null : DURATA_BLOCCATA_VERIFICA;

  const [nome, setNome] = useState('');
  const [classe, setClasse] = useState('');
  const [durata, setDurata] = useState(durataBloccata ?? durataMin);
  const [difficolta, setDifficolta] = useState<Difficolta>('Base');

  const valid = nome.trim().length >= 2 && classe.trim().length >= 1 && durata > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const verificaId = pickVerifica(difficolta, categoria);
    onStart({ nome: nome.trim(), classe: classe.trim() }, verificaId, durataBloccata ?? durata);
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
      <button className="btn" type="submit" disabled={!valid} style={{ width: '100%' }}>
        {isEsercitazione ? 'Sorteggia simulazione e inizia' : 'Sorteggia verifica e inizia'}
      </button>
    </form>
  );
}
