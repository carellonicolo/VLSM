import { Component, type ErrorInfo, type ReactNode } from 'react';
import { readSession } from '../lib/storage';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleDownloadBackup = () => {
    try {
      const session = readSession();
      if (!session) {
        alert('Nessun dato di sessione trovato in locale.');
        return;
      }
      const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const name = session.studente?.nome?.replace(/\s+/g, '_') ?? 'sconosciuto';
      const ts = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      a.href = url;
      a.download = `vlsm_backup_${name}_${ts}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('backup failed', e);
      alert('Impossibile generare il backup. Comunica al docente.');
    }
  };

  handleHardReload = () => {
    // ricarica la pagina senza svuotare lo storage
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    let session: ReturnType<typeof readSession> = null;
    try {
      session = readSession();
    } catch {
      session = null;
    }
    const esito = session?.esito;

    return (
      <div className="shell">
        <div className="card" style={{ border: '2px solid var(--error)' }}>
          <h2 style={{ color: 'var(--error)', marginTop: 0 }}>⚠️ Errore tecnico</h2>
          <p>
            L'applicazione ha riscontrato un errore inatteso. <strong>I tuoi dati sono salvati in
            locale</strong> e non sono persi.
          </p>

          {esito && (
            <div
              style={{
                background: 'var(--success-bg)',
                color: 'var(--success)',
                padding: '0.85rem 1rem',
                borderRadius: 6,
                border: '1px solid var(--success)',
                margin: '1rem 0',
              }}
            >
              <strong>✓ Voto registrato: {esito.voto30}/30</strong>
              <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                La verifica è già stata corretta. Scarica il backup qui sotto e mostralo al docente.
              </div>
            </div>
          )}

          {!esito && session?.answers && (
            <div
              style={{
                background: 'var(--warn-bg)',
                color: 'var(--warn-text)',
                padding: '0.85rem 1rem',
                borderRadius: 6,
                border: '1px solid var(--warn-border)',
                margin: '1rem 0',
              }}
            >
              <strong>⚠ Verifica in corso non ancora consegnata</strong>
              <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                Le risposte compilate sono salvate. Scarica il backup, poi prova "Ricarica
                l'app" per ritornare e premere di nuovo "Termina e correggi".
              </div>
            </div>
          )}

          <p>Cosa puoi fare:</p>
          <ul style={{ paddingLeft: '1.25rem' }}>
            <li><strong>Scarica il backup JSON</strong> e consegnalo al docente come prova della tua sessione</li>
            <li><strong>Ricarica l'app</strong> per provare a riprendere la sessione (i dati restano salvati)</li>
            <li>Comunica al docente cosa stavi facendo prima dell'errore</li>
          </ul>

          {this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ cursor: 'pointer' }}>Dettagli tecnici (per il docente)</summary>
              <pre
                style={{
                  fontSize: '0.7rem',
                  overflow: 'auto',
                  background: 'var(--readonly-bg)',
                  padding: '0.5rem',
                  borderRadius: 4,
                  maxHeight: 220,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error.stack || this.state.error.message}
              </pre>
            </details>
          )}

          <div className="actions" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
            <button className="btn" type="button" onClick={this.handleDownloadBackup}>
              📥 Scarica backup JSON
            </button>
            <button className="btn btn-secondary" type="button" onClick={this.handleHardReload}>
              🔄 Ricarica l'app
            </button>
          </div>
        </div>
      </div>
    );
  }
}
