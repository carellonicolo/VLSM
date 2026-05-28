import { useEffect, useMemo, useState } from 'react';
import { VERIFICHE } from '../../data/verifiche';
import { DIFFICOLTA_ORDER, type Categoria, type Difficolta, type Verifica } from '../../types/domain';
import { buildVerificaView, type DocMode } from '../../lib/verificaSolution';
import { VerificaDocView } from './VerificaDocView';

type DiffFiltro = 'Tutte' | Difficolta;

interface Selezione {
  v: Verifica;
  mode: DocMode;
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function numId(v: Verifica): string {
  return v.id.replace(/^[vs]/, '');
}

function baseName(v: Verifica): string {
  return v.categoria === 'esercitazione' ? `simulazione_vlsm_${numId(v)}` : `verifica_vlsm_${numId(v)}`;
}

function fileName(v: Verifica, mode: DocMode): string {
  const base = baseName(v);
  return mode === 'soluzione' ? `correzione_${base}.pdf` : `${base}.pdf`;
}

function zipName(categoria: Categoria, mode: DocMode): string {
  const cat = categoria === 'esercitazione' ? 'esercitazioni' : 'verifiche';
  const kind = mode === 'soluzione' ? 'correzioni' : 'testi';
  return `${cat}_${kind}_vlsm.zip`;
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function VerificheTab() {
  const [categoria, setCategoria] = useState<Categoria>('verifica');
  const [diff, setDiff] = useState<DiffFiltro>('Tutte');
  const [sel, setSel] = useState<Selezione | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lista = useMemo(
    () =>
      VERIFICHE.filter(
        (v) => v.categoria === categoria && (diff === 'Tutte' || v.difficolta === diff)
      ),
    [categoria, diff]
  );

  const gruppi = useMemo(
    () =>
      DIFFICOLTA_ORDER.map((d) => ({ difficolta: d, items: lista.filter((v) => v.difficolta === d) })).filter(
        (g) => g.items.length > 0
      ),
    [lista]
  );

  async function downloadSingle(v: Verifica, mode: DocMode) {
    setError(null);
    setBusy(`${v.id}-${mode}`);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { VerificaDocPdf } = await import('./VerificaDocPdf');
      const blob = await pdf(<VerificaDocPdf view={buildVerificaView(v)} mode={mode} />).toBlob();
      triggerDownload(blob, fileName(v, mode));
    } catch (e) {
      setError(`Errore nella generazione del PDF: ${msg(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function downloadZip(mode: DocMode) {
    if (lista.length === 0) return;
    setError(null);
    setBusy(`zip-${mode}`);
    setProgress({ done: 0, total: lista.length });
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { VerificaDocPdf } = await import('./VerificaDocPdf');
      const { zip } = await import('fflate');
      const files: Record<string, Uint8Array> = {};
      const errs: string[] = [];
      for (let i = 0; i < lista.length; i++) {
        const v = lista[i];
        try {
          const blob = await pdf(<VerificaDocPdf view={buildVerificaView(v)} mode={mode} />).toBlob();
          files[fileName(v, mode)] = new Uint8Array(await blob.arrayBuffer());
        } catch (e) {
          errs.push(`${v.titolo}: ${msg(e)}`);
        }
        setProgress({ done: i + 1, total: lista.length });
      }
      const data = await new Promise<Uint8Array>((resolve, reject) => {
        zip(files, { level: 0 }, (er, d) => (er ? reject(er) : resolve(d)));
      });
      triggerDownload(new Blob([data as BlobPart], { type: 'application/zip' }), zipName(categoria, mode));
      if (errs.length > 0) setError(`Alcune non generate: ${errs.join('; ')}`);
    } catch (e) {
      setError(`Errore nella creazione dello ZIP: ${msg(e)}`);
    } finally {
      setBusy(null);
      setProgress(null);
    }
  }

  const zipBusy = busy?.startsWith('zip-');

  return (
    <>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Verifiche e correzioni</h3>
        <p className="muted">
          Consulta il testo o la correzione di ogni verifica direttamente in app, oppure scaricali in PDF —
          singolarmente o tutti insieme in un archivio ZIP.
        </p>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
          <button
            className={categoria === 'verifica' ? 'btn' : 'btn btn-secondary'}
            type="button"
            onClick={() => setCategoria('verifica')}
          >
            Verifiche ufficiali
          </button>
          <button
            className={categoria === 'esercitazione' ? 'btn' : 'btn btn-secondary'}
            type="button"
            onClick={() => setCategoria('esercitazione')}
          >
            Esercitazioni libere
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
          {(['Tutte', ...DIFFICOLTA_ORDER] as DiffFiltro[]).map((d) => (
            <button
              key={d}
              className={diff === d ? 'btn' : 'btn btn-secondary'}
              type="button"
              onClick={() => setDiff(d)}
              style={{ padding: '0.3rem 0.7rem', fontSize: '0.85rem' }}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="actions" style={{ flexWrap: 'wrap' }}>
          <button className="btn" type="button" onClick={() => downloadZip('verifica')} disabled={busy != null || lista.length === 0}>
            {busy === 'zip-verifica' ? 'Generazione…' : `📦 Scarica tutti i testi (${lista.length}) — ZIP`}
          </button>
          <button className="btn" type="button" onClick={() => downloadZip('soluzione')} disabled={busy != null || lista.length === 0}>
            {busy === 'zip-soluzione' ? 'Generazione…' : `📦 Scarica tutte le correzioni (${lista.length}) — ZIP`}
          </button>
        </div>
        {zipBusy && progress && (
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            ⏳ Generazione PDF {progress.done}/{progress.total}…
          </p>
        )}
        {error && <div className="error-msg" style={{ marginTop: '0.5rem' }}>{error}</div>}
      </div>

      {gruppi.map((g) => (
        <div className="card" key={g.difficolta}>
          <h3 style={{ marginTop: 0, color: 'var(--primary)' }}>
            {g.difficolta} <span className="muted" style={{ fontWeight: 400 }}>({g.items.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {g.items.map((v) => (
              <div
                key={v.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '0.5rem',
                }}
              >
                <strong style={{ flex: '1 1 140px' }}>{v.titolo}</strong>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" type="button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }} onClick={() => setSel({ v, mode: 'verifica' })}>
                    👁 Testo
                  </button>
                  <button className="btn btn-secondary" type="button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }} onClick={() => setSel({ v, mode: 'soluzione' })}>
                    👁 Correzione
                  </button>
                  <button className="btn" type="button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }} disabled={busy != null} onClick={() => downloadSingle(v, 'verifica')}>
                    {busy === `${v.id}-verifica` ? '…' : '📄 PDF testo'}
                  </button>
                  <button className="btn" type="button" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }} disabled={busy != null} onClick={() => downloadSingle(v, 'soluzione')}>
                    {busy === `${v.id}-soluzione` ? '…' : '📄 PDF correzione'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sel && (
        <AnteprimaModal
          sel={sel}
          busy={busy}
          onClose={() => setSel(null)}
          onChangeMode={(mode) => setSel({ v: sel.v, mode })}
          onDownload={() => downloadSingle(sel.v, sel.mode)}
        />
      )}
    </>
  );
}

interface ModalProps {
  sel: Selezione;
  busy: string | null;
  onClose: () => void;
  onChangeMode: (mode: DocMode) => void;
  onDownload: () => void;
}

function AnteprimaModal({ sel, busy, onClose, onChangeMode, onDownload }: ModalProps) {
  const view = useMemo(() => buildVerificaView(sel.v), [sel.v]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 1rem',
        overflowY: 'auto',
      }}
    >
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ maxWidth: 920, width: '100%', margin: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
            marginBottom: '1rem',
            position: 'sticky',
            top: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              className={sel.mode === 'verifica' ? 'btn' : 'btn btn-secondary'}
              type="button"
              onClick={() => onChangeMode('verifica')}
            >
              Testo
            </button>
            <button
              className={sel.mode === 'soluzione' ? 'btn' : 'btn btn-secondary'}
              type="button"
              onClick={() => onChangeMode('soluzione')}
            >
              Correzione
            </button>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn" type="button" onClick={onDownload} disabled={busy != null}>
            📄 Scarica PDF
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Chiudi
          </button>
        </div>
        <VerificaDocView view={view} mode={sel.mode} />
      </div>
    </div>
  );
}
