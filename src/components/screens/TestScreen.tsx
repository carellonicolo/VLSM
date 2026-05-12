import type { RispostaEsercizio, RispostaRiga, RispostaStudente, Verifica } from '../../types/domain';
import { EsercizioVlsmAllocView } from '../exercises/EsercizioVlsmAlloc';
import { EsercizioParametriView } from '../exercises/EsercizioParametri';
import { EsercizioAnalisiPianoView } from '../exercises/EsercizioAnalisiPiano';
import { TimerBadge } from '../ui/TimerBadge';

interface Props {
  verifica: Verifica;
  answers: RispostaStudente;
  deadlineMs: number;
  nome: string;
  classe: string;
  onUpdateRiga: (esercizioId: string, section: 'righe' | 'parteA' | 'parteB', rowIndex: number, riga: RispostaRiga) => void;
  onUpdateParteC: (esercizioId: string, riga: RispostaRiga) => void;
  onTermina: () => void;
  onTimeout: () => void;
}

export function TestScreen({
  verifica,
  answers,
  deadlineMs,
  nome,
  classe,
  onUpdateRiga,
  onUpdateParteC,
  onTermina,
  onTimeout,
}: Props) {
  return (
    <>
      <div className="test-header-bar">
        <h2>
          {verifica.titolo} — <span className="muted">{nome} ({classe})</span>
        </h2>
        <TimerBadge deadlineMs={deadlineMs} onExpire={onTimeout} />
      </div>

      {verifica.esercizi.map((es) => {
        const ra: RispostaEsercizio | undefined = answers.esercizi[es.id];
        if (es.tipo === 'vlsm-alloc') {
          return (
            <EsercizioVlsmAllocView
              key={es.id}
              esercizio={es}
              risposta={ra}
              onChange={(i, riga) => onUpdateRiga(es.id, 'righe', i, riga)}
            />
          );
        }
        if (es.tipo === 'parametri') {
          return (
            <EsercizioParametriView
              key={es.id}
              esercizio={es}
              risposta={ra}
              onChange={(i, riga) => onUpdateRiga(es.id, 'righe', i, riga)}
            />
          );
        }
        return (
          <EsercizioAnalisiPianoView
            key={es.id}
            esercizio={es}
            risposta={ra}
            onChangeParteA={(i, riga) => onUpdateRiga(es.id, 'parteA', i, riga)}
            onChangeParteB={(i, riga) => onUpdateRiga(es.id, 'parteB', i, riga)}
            onChangeParteC={(riga) => onUpdateParteC(es.id, riga)}
          />
        );
      })}

      <div className="actions">
        <button className="btn" onClick={onTermina}>
          Termina e correggi
        </button>
      </div>
    </>
  );
}
