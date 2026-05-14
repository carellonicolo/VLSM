import { useEffect, useState } from 'react';
import type { EventoFocus, RispostaEsercizio, RispostaRiga, RispostaStudente, Verifica } from '../../types/domain';
import { EsercizioVlsmAllocView } from '../exercises/EsercizioVlsmAlloc';
import { EsercizioParametriView } from '../exercises/EsercizioParametri';
import { EsercizioAnalisiPianoView } from '../exercises/EsercizioAnalisiPiano';
import { TimerBadge } from '../ui/TimerBadge';
import { formatDuration } from '../../lib/format';

interface Props {
  verifica: Verifica;
  answers: RispostaStudente;
  deadlineMs: number;
  nome: string;
  classe: string;
  eventiFocus: EventoFocus[];
  isEsercitazione: boolean;
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
  eventiFocus,
  isEsercitazione,
  onUpdateRiga,
  onUpdateParteC,
  onTermina,
  onTimeout,
}: Props) {
  const [alertEvent, setAlertEvent] = useState<EventoFocus | null>(null);
  const [acknowledgedCount, setAcknowledgedCount] = useState(eventiFocus.length);

  useEffect(() => {
    if (eventiFocus.length > acknowledgedCount) {
      const newest = eventiFocus[eventiFocus.length - 1];
      setAlertEvent(newest);
    }
  }, [eventiFocus.length, acknowledgedCount, eventiFocus]);

  const closeAlert = () => {
    setAcknowledgedCount(eventiFocus.length);
    setAlertEvent(null);
  };

  const totaleMs = eventiFocus.reduce((s, e) => s + e.durataMs, 0);
  const numeroAbbandoni = eventiFocus.length;

  return (
    <>
      <div className="test-header-bar">
        <h2>
          {verifica.titolo} — <span className="muted">{nome} ({classe})</span>
        </h2>
        <TimerBadge deadlineMs={deadlineMs} onExpire={onTimeout} />
      </div>

      {!isEsercitazione && (
        <div className={`monitor-bar ${numeroAbbandoni === 0 ? 'zero' : ''}`} style={{ marginBottom: '1rem' }}>
          {numeroAbbandoni === 0
            ? <>👁 Monitoraggio attivo — Nessuna distrazione rilevata</>
            : <>⚠️ Distrazioni: <strong>{numeroAbbandoni}</strong> &nbsp;·&nbsp; Tempo lontano: <strong>{formatDuration(totaleMs)}</strong></>
          }
        </div>
      )}

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

      {alertEvent && !isEsercitazione && (
        <div className="alert-overlay" role="alertdialog" aria-modal="true">
          <div className="alert-modal">
            <div className="alert-icon" aria-hidden>🚨</div>
            <h2>DISTRAZIONE RILEVATA</h2>
            <p style={{ textAlign: 'center' }}>
              Hai lasciato la pagina della verifica.
            </p>
            <div className="alert-counter">
              Sei rimasto/a fuori per <strong>{formatDuration(alertEvent.durataMs)}</strong>
              <br />
              Abbandono n° <strong>{numeroAbbandoni}</strong> su questa verifica
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.92rem' }}>
              Questo evento è stato <strong>registrato in modo permanente</strong> nel PDF firmato
              digitalmente che consegnerai. Il docente lo vedrà.
            </p>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
              Resta sulla pagina per evitare ulteriori segnalazioni.
            </p>
            <button className="btn" type="button" onClick={closeAlert}>
              Ho capito, riprendo la verifica
            </button>
          </div>
        </div>
      )}
    </>
  );
}
