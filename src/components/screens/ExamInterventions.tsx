interface OverlayProps {
  motivo: string | null;
  onExit: () => void;
}

/** Schermo bloccato a tutta pagina quando il docente annulla la prova. */
export function InterruptedOverlay({ motivo, onExit }: OverlayProps) {
  return (
    <div className="exam-overlay" role="alertdialog" aria-modal="true">
      <div className="exam-overlay-card">
        <div style={{ fontSize: '3rem', lineHeight: 1 }} aria-hidden>⛔</div>
        <h2 style={{ margin: '0.5rem 0' }}>Prova interrotta dal docente</h2>
        <p style={{ margin: '0 0 0.5rem' }}>
          La tua verifica è stata <strong>annullata</strong> e non è più possibile rispondere.
        </p>
        {motivo && (
          <div className="exam-overlay-reason">
            <strong>Motivo:</strong> {motivo}
          </div>
        )}
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          Per qualsiasi chiarimento rivolgiti direttamente al docente.
        </p>
        <button className="btn" type="button" onClick={onExit} style={{ marginTop: '0.75rem' }}>
          Torna alla dashboard
        </button>
      </div>
    </div>
  );
}

interface MessageProps {
  type: 'alert' | 'ammonizione';
  message: string;
  onDismiss: () => void;
}

/** Messaggio del docente (alert momentaneo oppure ammonizione registrata). */
export function TeacherMessageModal({ type, message, onDismiss }: MessageProps) {
  const isAmmonizione = type === 'ammonizione';
  return (
    <div className="exam-overlay" role="alertdialog" aria-modal="true">
      <div className={`exam-msg-card${isAmmonizione ? ' exam-msg-ammonizione' : ' exam-msg-alert'}`}>
        <div style={{ fontSize: '2.4rem', lineHeight: 1 }} aria-hidden>{isAmmonizione ? '⚠️' : '✉️'}</div>
        <h2 style={{ margin: '0.4rem 0' }}>
          {isAmmonizione ? 'Ammonizione dal docente' : 'Messaggio dal docente'}
        </h2>
        <p style={{ fontSize: '1.05rem', margin: '0 0 0.4rem' }}>{message}</p>
        {isAmmonizione && (
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Questa ammonizione resta registrata e comparirà sul resoconto della verifica.
          </p>
        )}
        <button className="btn" type="button" onClick={onDismiss} style={{ marginTop: '0.6rem' }} autoFocus>
          {isAmmonizione ? 'Ho capito' : 'Chiudi'}
        </button>
      </div>
    </div>
  );
}
