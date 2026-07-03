import { useEffect, useMemo, useState } from 'react';
import { Eye, AlertTriangle, Lightbulb, AlertOctagon, Clock, Hourglass, Flame } from 'lucide-react';
import type { EventoFocus, RispostaEsercizio, RispostaRiga, RispostaStudente, Verifica } from '../../types/domain';
import { EsercizioVlsmAllocView } from '../exercises/EsercizioVlsmAlloc';
import { EsercizioParametriView } from '../exercises/EsercizioParametri';
import { EsercizioAnalisiPianoView } from '../exercises/EsercizioAnalisiPiano';
import { TimerBadge } from '../ui/TimerBadge';
import { formatDuration } from '../../lib/format';
import { useTimerWarnings } from '../../hooks/useTimerWarnings';

// Conteggio puramente visivo delle celle compilate/totali per la progress bar.
// Legge solo le props (verifica + answers): nessuna logica di correzione o hook.
function nonEmpty(rec: RispostaRiga | undefined): number {
  if (!rec) return 0;
  return Object.values(rec).filter((v) => v && v.trim() !== '').length;
}

function computeProgress(verifica: Verifica, answers: RispostaStudente): { filled: number; total: number } {
  let filled = 0;
  let total = 0;
  for (const es of verifica.esercizi) {
    const ra = answers.esercizi[es.id];
    if (es.tipo === 'vlsm-alloc') {
      const cols = 6;
      const cap = es.requisiti.length * cols;
      total += cap;
      let f = 0;
      (ra?.righe ?? []).forEach((r) => { f += Math.min(nonEmpty(r), cols); });
      filled += Math.min(f, cap);
    } else if (es.tipo === 'parametri') {
      const cols = 5;
      const cap = es.righe.length * cols;
      total += cap;
      let f = 0;
      (ra?.righe ?? []).forEach((r) => { f += Math.min(nonEmpty(r), cols); });
      filled += Math.min(f, cap);
    } else {
      const cap = es.parteA.righe.length * 4 + es.parteB.numeroRighe * 5 + 6;
      total += cap;
      let f = 0;
      (ra?.parteA ?? []).forEach((r) => { f += Math.min(nonEmpty(r), 4); });
      (ra?.parteB ?? []).forEach((r) => { f += Math.min(nonEmpty(r), 5); });
      f += Math.min(nonEmpty(ra?.parteC), 6);
      filled += Math.min(f, cap);
    }
  }
  return { filled, total };
}

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
  const [timerWarning, setTimerWarning] = useState<number | null>(null);

  const TIMER_THRESHOLDS = useMemo(() => [5, 2, 1], []);
  useTimerWarnings(true, deadlineMs, TIMER_THRESHOLDS, (m) => setTimerWarning(m));

  // Preload del chunk PDF in background: quando lo studente arriverà alla
  // schermata risultato il chunk è già scaricato, evitando crash da fetch
  // di chunk non più disponibili (es. nuovo deploy con hash diversi).
  useEffect(() => {
    import('@react-pdf/renderer').catch(() => {});
    import('../pdf/PdfReport').catch(() => {});
  }, []);

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
  const closeTimerWarning = () => setTimerWarning(null);

  const totaleMs = eventiFocus.reduce((s, e) => s + e.durataMs, 0);
  const numeroAbbandoni = eventiFocus.length;

  // Derivato puramente visivo per la progress bar (nessun effetto collaterale).
  const { filled, total } = computeProgress(verifica, answers);
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <>
      <div className="test-header-bar">
        <h2>
          {verifica.titolo} — <span className="muted">{nome} ({classe})</span>
        </h2>
        <TimerBadge deadlineMs={deadlineMs} onExpire={onTimeout} />
      </div>

      <div className="test-substatus">
        <div className="test-progress" role="progressbar" aria-valuenow={filled} aria-valuemin={0} aria-valuemax={total}>
          <div className="test-progress-track">
            <div className="test-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="test-progress-label">{filled}/{total} celle compilate</span>
        </div>
        {!isEsercitazione && (
          <span className={`monitor-chip ${numeroAbbandoni === 0 ? 'zero' : 'warn'}`}>
            {numeroAbbandoni === 0
              ? <><Eye size={15} /> Monitoraggio attivo · 0 distrazioni</>
              : <><AlertTriangle size={15} /> {numeroAbbandoni} distrazioni · {formatDuration(totaleMs)}</>}
          </span>
        )}
      </div>

      <div className="test-legend">
        <span className="test-legend-icon" aria-hidden><Lightbulb size={18} /></span>
        <span>
          <strong>Devi compilare</strong> solo le celle bianche con
          <span className="legend-sample legend-sample-empty">bordo tratteggiato</span>.
          Le celle <span className="legend-sample legend-sample-readonly">a strisce</span>
          {' '}sono di contesto e <strong>NON vanno modificate</strong>.
        </span>
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

      {alertEvent && !isEsercitazione && (
        <div className="alert-overlay" role="alertdialog" aria-modal="true">
          <div className="alert-modal">
            <div className="alert-icon" aria-hidden><AlertOctagon size={40} /></div>
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

      {timerWarning !== null && (
        <div className="alert-overlay" role="alertdialog" aria-modal="true">
          <div className={`timer-modal level-${timerWarning}`}>
            <div className="timer-icon" aria-hidden>
              {timerWarning === 5 ? <Clock size={40} /> : timerWarning === 2 ? <Hourglass size={40} /> : <Flame size={40} />}
            </div>
            <h2>
              {timerWarning === 1 ? 'ULTIMO MINUTO!' : timerWarning === 2 ? 'Ancora 2 minuti' : 'Mancano 5 minuti'}
            </h2>
            <div className="timer-counter">
              {timerWarning === 1
                ? '⚠ La verifica si chiuderà a brevissimo'
                : `Tempo residuo: ~${timerWarning} ${timerWarning === 1 ? 'minuto' : 'minuti'}`}
            </div>
            <p style={{ fontSize: '0.9rem' }}>
              {timerWarning === 1
                ? 'Al termine del tempo la verifica verrà consegnata automaticamente con le risposte attuali.'
                : timerWarning === 2
                  ? 'Controlla le risposte ancora vuote: alla scadenza la verifica viene consegnata automaticamente.'
                  : 'Hai ancora tempo. Continua con calma, ma tieni d\'occhio il timer.'}
            </p>
            <button className="btn" type="button" onClick={closeTimerWarning}>
              Ho capito
            </button>
          </div>
        </div>
      )}
    </>
  );
}
