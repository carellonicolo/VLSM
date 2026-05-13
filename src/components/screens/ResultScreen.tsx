import { lazy, Suspense, useState } from 'react';
import type { EsitoFinale } from '../../types/domain';
import { ETICHETTE_VLSM, ETICHETTE_PARAMETRI, ETICHETTE_RESIDUI } from '../../lib/grading';
import { formatDuration, formatTimeOfDay } from '../../lib/format';

const PdfDownload = lazy(() => import('../pdf/PdfDownload').then((m) => ({ default: m.PdfDownload })));

interface Props {
  esito: EsitoFinale;
  onNuovaSessione: () => void;
}

function labelFor(esercizioId: string, colKey: string): string {
  if (esercizioId.startsWith('es4')) {
    if (ETICHETTE_RESIDUI[colKey]) return ETICHETTE_RESIDUI[colKey];
    if (ETICHETTE_VLSM[colKey]) return ETICHETTE_VLSM[colKey];
  }
  if (ETICHETTE_VLSM[colKey]) return ETICHETTE_VLSM[colKey];
  if (ETICHETTE_PARAMETRI[colKey]) return ETICHETTE_PARAMETRI[colKey];
  return colKey;
}

export function ResultScreen({ esito, onNuovaSessione }: Props) {
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  return (
    <>
      {esito.categoria === 'esercitazione' && (
        <div className="card" style={{ background: '#fff3c4', borderColor: '#d4a017', color: '#7c5d00', textAlign: 'center', padding: '0.75rem' }}>
          <strong>🎯 Esercitazione libera</strong> — Questo risultato è solo di pratica, non viene registrato come verifica ufficiale.
        </div>
      )}

      <div className="voto-box" style={esito.categoria === 'esercitazione' ? { background: '#7c5d00' } : undefined}>
        <p className="voto30">{esito.voto30}/30</p>
        <div className="voto10">Equivalente in decimi: {esito.voto10}/10</div>
        {esito.motivoConsegna === 'timeout' && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            ⏱ Consegna automatica per scadenza del tempo
          </div>
        )}
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: '0.75rem' }}>
        <div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Inizio</div>
          <strong>{formatTimeOfDay(esito.startedAt)}</strong>
        </div>
        <div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Fine</div>
          <strong>{formatTimeOfDay(esito.consegnatoAt)}</strong>
        </div>
        <div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Durata</div>
          <strong>{formatDuration(esito.durataMs)}</strong>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Dettaglio per esercizio</h3>
        {esito.esercizi.map((e) => (
          <details key={e.esercizioId} open>
            <summary style={{ cursor: 'pointer', padding: '0.4rem 0' }}>
              <strong>{e.titolo}</strong> — {e.punteggio}/{e.puntiMax} pt
            </summary>
            {e.righe.length > 0 && (
              <table className="result-table">
                <thead>
                  <tr>
                    <th>Riga</th>
                    {Object.keys(e.righe[0].celle).map((col) => (
                      <th key={col}>{labelFor(e.esercizioId, col)}</th>
                    ))}
                    <th>Pt</th>
                  </tr>
                </thead>
                <tbody>
                  {e.righe.map((r) => (
                    <tr key={r.rowKey}>
                      <td className="readonly">{r.rowKey}</td>
                      {Object.entries(r.celle).map(([col, c]) => (
                        <td key={col} className={`cella-${c.stato}`}>
                          {c.valoreStudente || <span className="muted">—</span>}
                          {c.stato !== 'corretto' && (
                            <span className="cella-attesa">✓ {c.valoreAtteso}</span>
                          )}
                        </td>
                      ))}
                      <td>
                        {Math.round(r.punteggio * 10) / 10}/{Math.round(r.puntiMax * 10) / 10}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </details>
        ))}
      </div>

      <div className="card">
        <p>
          <strong>Scarica il PDF</strong> della verifica corretta. Stampalo, firmalo e consegnalo al docente.
        </p>
        <Suspense fallback={<button className="btn" disabled>Caricamento PDF…</button>}>
          <PdfDownload esito={esito} onDownloaded={() => setPdfDownloaded(true)} />
        </Suspense>
        <button
          className="btn-secondary btn"
          style={{ marginTop: '1rem' }}
          onClick={() => {
            if (!pdfDownloaded && !confirm('Non hai ancora scaricato il PDF. Vuoi davvero iniziare una nuova sessione?')) {
              return;
            }
            onNuovaSessione();
          }}
        >
          Nuova sessione
        </button>
      </div>
    </>
  );
}
