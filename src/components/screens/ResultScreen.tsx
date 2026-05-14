import { useState } from 'react';
import type { EsitoFinale } from '../../types/domain';
import { ETICHETTE_VLSM, ETICHETTE_PARAMETRI, ETICHETTE_RESIDUI } from '../../lib/grading';
import { formatDuration, formatTimeOfDay } from '../../lib/format';

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

function safeFileName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '_');
}

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ResultScreen({ esito, onNuovaSessione }: Props) {
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [pdfState, setPdfState] = useState<'idle' | 'generating' | 'error'>('idle');
  const [pdfError, setPdfError] = useState<string | null>(null);

  const baseFileName = `vlsm_${safeFileName(esito.studente.nome)}_${esito.verificaId}`;

  const downloadPdf = async () => {
    setPdfState('generating');
    setPdfError(null);
    try {
      const [{ pdf }, { PdfReport }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/PdfReport'),
      ]);
      const blob = await pdf(<PdfReport esito={esito} />).toBlob();
      triggerBrowserDownload(blob, `${baseFileName}.pdf`);
      setPdfDownloaded(true);
      setPdfState('idle');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      // eslint-disable-next-line no-console
      console.error('PDF generation failed', e);
      setPdfError(msg);
      setPdfState('error');
    }
  };

  const downloadJsonBackup = () => {
    try {
      const blob = new Blob([JSON.stringify(esito, null, 2)], { type: 'application/json' });
      triggerBrowserDownload(blob, `${baseFileName}.json`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('JSON backup failed', e);
    }
  };

  return (
    <>
      {esito.categoria === 'esercitazione' && (
        <div className="card" style={{ background: 'var(--warn-bg)', borderColor: 'var(--warn-border)', color: 'var(--warn-text)', textAlign: 'center', padding: '0.75rem' }}>
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

      {esito.categoria === 'verifica' && (() => {
        const eventi = esito.eventiFocus ?? [];
        const tempoFuori = eventi.reduce((a, e) => a + e.durataMs, 0);
        if (eventi.length === 0) {
          return (
            <div
              className="card"
              style={{
                background: 'var(--success-bg)',
                borderColor: 'var(--success)',
                color: 'var(--success)',
                padding: '0.85rem 1rem',
              }}
            >
              <strong>✓ Note di sessione</strong> — Nessuna distrazione rilevata durante la verifica.
            </div>
          );
        }
        return (
          <div
            className="card"
            style={{
              background: 'var(--error-bg)',
              borderColor: 'var(--error)',
              color: 'var(--error-text)',
            }}
          >
            <h3 style={{ marginTop: 0, color: 'var(--error)' }}>
              ⚠ Note di sessione — {eventi.length} abbandono{eventi.length === 1 ? '' : 'i'} della pagina
            </h3>
            <p style={{ margin: '0 0 0.75rem 0' }}>
              Tempo totale lontano dalla verifica: <strong>{formatDuration(tempoFuori)}</strong>.
              Tutti gli eventi sono stati registrati nel PDF firmato digitalmente che consegnerai al docente.
            </p>
            <table className="result-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: '10%' }}>#</th>
                  <th>Ora di uscita</th>
                  <th>Durata fuori focus</th>
                </tr>
              </thead>
              <tbody>
                {eventi.map((e, i) => (
                  <tr key={i}>
                    <td className="readonly">{i + 1}</td>
                    <td>{formatTimeOfDay(e.startedAt)}</td>
                    <td><strong>{formatDuration(e.durataMs)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

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
        <div className="actions" style={{ flexWrap: 'wrap' }}>
          <button
            className="btn"
            type="button"
            onClick={downloadPdf}
            disabled={pdfState === 'generating'}
          >
            {pdfState === 'generating' ? '⏳ Generazione PDF…' : '📥 Scarica PDF'}
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={downloadJsonBackup}
            title="Backup completo dell'esito in formato JSON, da consegnare al docente in caso il PDF non funzioni"
          >
            🛟 Scarica backup JSON
          </button>
        </div>
        {pdfState === 'error' && (
          <div
            className="error-msg"
            style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'var(--error-bg)', borderRadius: 4 }}
          >
            <strong>Errore nella generazione del PDF:</strong> {pdfError}
            <div style={{ marginTop: '0.4rem' }}>
              <button className="btn-secondary btn" type="button" onClick={downloadPdf}>Riprova PDF</button>
              {' '}oppure usa il backup JSON qui sopra: il docente può ricostruire la consegna anche da quello.
            </div>
          </div>
        )}
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
