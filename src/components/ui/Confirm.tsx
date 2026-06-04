import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = createContext<ConfirmFn>(async () => false);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (o) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setOpts(o);
      }),
    []
  );

  const close = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {opts && (
        <div className="alert-overlay" role="alertdialog" aria-modal="true">
          <div className="card" style={{ maxWidth: 440, width: '100%', borderTop: `5px solid ${opts.danger ? 'var(--error)' : 'var(--primary)'}` }}>
            {opts.title && <h3 style={{ marginTop: 0 }}>{opts.title}</h3>}
            <p style={{ marginTop: opts.title ? undefined : 0 }}>{opts.message}</p>
            <div className="actions" style={{ flexWrap: 'wrap' }}>
              <button
                className="btn"
                type="button"
                style={opts.danger ? { background: 'var(--error)', borderColor: 'var(--error)' } : undefined}
                onClick={() => close(true)}
                autoFocus
              >
                {opts.confirmLabel ?? 'Conferma'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => close(false)} style={{ marginLeft: 'auto' }}>
                {opts.cancelLabel ?? 'Annulla'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  return useContext(ConfirmCtx);
}
