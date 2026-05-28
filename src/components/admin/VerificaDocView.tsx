import type { CSSProperties } from 'react';
import type { CellaView, DocMode, TabellaView, VerificaView } from '../../lib/verificaSolution';

const INTESTAZIONE = 'ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026';

const solCellStyle: CSSProperties = {
  fontFamily: "'Menlo', 'Consolas', monospace",
  background: 'rgba(31, 122, 60, 0.12)',
  fontWeight: 600,
};

const bannerStyle: CSSProperties = {
  background: '#fff3c4',
  border: '1px solid #d4a017',
  color: '#7c5d00',
  padding: '0.5rem 0.75rem',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: '1rem',
};

function rowList(t: TabellaView, isSol: boolean): { key: string; celle: Record<string, CellaView> }[] {
  if (!isSol && t.blankRows != null) {
    return Array.from({ length: t.blankRows }, (_, i) => ({ key: `blank-${i}`, celle: {} }));
  }
  return t.righe;
}

function TabellaBlock({ t, isSol }: { t: TabellaView; isSol: boolean }) {
  const righe = rowList(t, isSol);
  return (
    <>
      {t.titolo && <h4 style={{ margin: '0.9rem 0 0.3rem' }}>{t.titolo}</h4>}
      {t.nota && <p className="muted" style={{ margin: '0 0 0.4rem' }}>{t.nota}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table className="alloc-table">
          <thead>
            <tr>
              {t.colonne.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {righe.map((r) => (
              <tr key={r.key}>
                {t.colonne.map((c) => {
                  const cella = r.celle[c.key] ?? { valore: '', dato: false };
                  if (cella.dato) {
                    return (
                      <td key={c.key} className="readonly">
                        {cella.valore}
                      </td>
                    );
                  }
                  if (isSol) {
                    return (
                      <td key={c.key} style={solCellStyle}>
                        {cella.valore || '—'}
                      </td>
                    );
                  }
                  return <td key={c.key} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface Props {
  view: VerificaView;
  mode: DocMode;
}

export function VerificaDocView({ view, mode }: Props) {
  const isSol = mode === 'soluzione';
  return (
    <div>
      <p className="muted" style={{ fontSize: '0.78rem', margin: '0 0 0.5rem' }}>{INTESTAZIONE}</p>
      <h2 style={{ margin: '0 0 0.75rem' }}>
        {view.titolo} — {isSol ? 'Correzione' : 'Testo'}{' '}
        <span className="diff-bar">
          {view.difficolta} · {view.puntiTotali} pt
        </span>
      </h2>
      {view.categoria === 'esercitazione' && (
        <div style={bannerStyle}>⚠️ ESERCITAZIONE LIBERA — non vale come verifica ufficiale</div>
      )}
      {view.esercizi.map((es) => (
        <div className="exercise" key={es.id}>
          <h3>
            {es.titolo} <span className="diff-bar">{es.punti} pt</span>
          </h3>
          {(es.consegna || es.contesto.length > 0) && (
            <div className="exercise-consegna">
              {es.consegna}
              {es.contesto.map((c, i) => (
                <div key={i} style={{ marginTop: '0.3rem', fontWeight: 600 }}>
                  {c}
                </div>
              ))}
            </div>
          )}
          {es.tabelle.map((t, ti) => (
            <TabellaBlock key={ti} t={t} isSol={isSol} />
          ))}
        </div>
      ))}
    </div>
  );
}
