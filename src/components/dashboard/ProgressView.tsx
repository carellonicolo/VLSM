import { useMemo, useState } from 'react';
import type { HistorySession } from '../../lib/studentApi';
import { computeStats, type ProgressStats } from '../../lib/progress';
import { buildCsv, downloadBlob, downloadCsv, safeFileName } from '../../lib/csv';

interface Props {
  sessions: HistorySession[];
  compact?: boolean;
  /** Nome/sottotitolo usati per etichettare gli export (CSV/PDF). */
  subject?: { name: string; subtitle?: string };
}

function statoTesto(st: string): string {
  if (st === 'consegnata') return 'Consegnata';
  if (st === 'annullata') return 'Annullata';
  if (st === 'in_progress') return 'In corso';
  if (st === 'abbandonata') return 'Abbandonata';
  return st;
}

export function ProgressView({ sessions, compact, subject }: Props) {
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const [pdfBusy, setPdfBusy] = useState(false);
  const name = subject?.name ?? 'Andamento';

  const exportCsv = () => {
    const headers = ['Data', 'Tipo', 'Prova', 'Livello', 'Voto/30', 'Distrazioni', 'Ammonizioni', 'Stato'];
    const rows = sessions.map((r) => [
      new Date(r.started_at).toLocaleString('it-IT'),
      r.categoria === 'verifica' ? 'Verifica' : 'Esercitazione',
      r.verifica_titolo,
      r.difficolta ?? '',
      r.voto30 ?? '',
      r.distrazioni_count ?? 0,
      r.ammonizioni_count ?? 0,
      statoTesto(r.state),
    ]);
    downloadCsv(`andamento_${safeFileName(name)}.csv`, buildCsv(headers, rows));
  };

  const exportPdf = async () => {
    setPdfBusy(true);
    try {
      const [{ pdf }, { AndamentoPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/AndamentoPdf'),
      ]);
      const blob = await pdf(
        <AndamentoPdf subjectName={name} subtitle={subject?.subtitle} stats={stats} sessions={sessions} />
      ).toBlob();
      downloadBlob(`andamento_${safeFileName(name)}.pdf`, blob);
    } catch (e) {
      alert(`Errore generazione PDF: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <div className="actions" style={{ justifyContent: 'flex-end', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" type="button" onClick={exportCsv} disabled={sessions.length === 0}>
          📥 Esporta CSV
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => void exportPdf()} disabled={sessions.length === 0 || pdfBusy}>
          {pdfBusy ? 'Generazione PDF…' : '📄 Esporta PDF'}
        </button>
      </div>
      <StatsCards stats={stats} />
      <div className="card">
        <h3 style={{ marginTop: 0 }}>📈 Andamento voti (verifiche)</h3>
        <TrendChart stats={stats} />
      </div>
      <PerLivello stats={stats} />
      <HistoryTable sessions={sessions} compact={compact} />
    </>
  );
}

function fmtVoto(v: number | null): string {
  return v == null ? '—' : String(v);
}

function StatsCards({ stats }: { stats: ProgressStats }) {
  const tiles: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' }[] = [
    { label: 'Media /30', value: fmtVoto(stats.mediaVoto30), tone: 'good' },
    { label: 'Media /10', value: fmtVoto(stats.mediaVoto10), tone: 'good' },
    { label: 'Ultimo voto', value: fmtVoto(stats.ultimoVoto30) },
    { label: 'Miglior voto', value: fmtVoto(stats.miglioreVoto30) },
    { label: 'Verifiche', value: String(stats.nVerificheConsegnate) },
    { label: 'Esercitazioni', value: String(stats.nEsercitazioni) },
    { label: 'Distrazioni', value: String(stats.totDistrazioni), tone: stats.totDistrazioni > 0 ? 'warn' : undefined },
    { label: 'Ammonizioni', value: String(stats.totAmmonizioni), tone: stats.totAmmonizioni > 0 ? 'bad' : undefined },
  ];
  return (
    <div className="stat-grid">
      {tiles.map((t) => (
        <div key={t.label} className={`stat-tile${t.tone ? ` stat-${t.tone}` : ''}`}>
          <div className="stat-value">{t.value}</div>
          <div className="stat-label">{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function PerLivello({ stats }: { stats: ProgressStats }) {
  const withData = stats.perLivello.filter((l) => l.count > 0);
  if (withData.length === 0) return null;
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🎯 Media per livello</h3>
      <div className="stat-grid">
        {stats.perLivello.map((l) => (
          <div key={l.livello} className="stat-tile" style={l.count === 0 ? { opacity: 0.5 } : undefined}>
            <div className="stat-value">{fmtVoto(l.media)}</div>
            <div className="stat-label">{l.livello} ({l.count})</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart({ stats }: { stats: ProgressStats }) {
  const pts = stats.trend;
  if (pts.length === 0) {
    return <p className="muted">Nessuna verifica consegnata: il grafico apparirà dopo la prima consegna.</p>;
  }

  const W = 640;
  const H = 220;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxV = 30;

  const x = (i: number) => (pts.length === 1 ? padL + innerW / 2 : padL + (i / (pts.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / maxV) * innerH;

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.voto30).toFixed(1)}`).join(' ');
  const gridVals = [0, 6, 12, 18, 24, 30];

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 360, maxWidth: 760 }} role="img" aria-label="Grafico andamento voti">
        {gridVals.map((g) => (
          <g key={g}>
            <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="var(--border)" strokeWidth={1} />
            <text x={padL - 6} y={y(g) + 4} textAnchor="end" fontSize="10" fill="var(--muted)">{g}</text>
          </g>
        ))}
        {/* soglia sufficienza (18/30) */}
        <line x1={padL} y1={y(18)} x2={W - padR} y2={y(18)} stroke="var(--success)" strokeDasharray="4 4" strokeWidth={1} opacity={0.6} />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.voto30)} r={4} fill={p.voto30 >= 18 ? 'var(--success)' : 'var(--error)'}>
              <title>{`${p.titolo} — ${p.voto30}/30 (${new Date(p.at).toLocaleDateString('it-IT')})`}</title>
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
}

function stateLabel(s: HistorySession): { text: string; color: string } {
  if (s.state === 'annullata') return { text: '⛔ Annullata', color: 'var(--error)' };
  if (s.state === 'consegnata') return { text: '✅ Consegnata', color: 'var(--success)' };
  if (s.state === 'in_progress') return { text: '🟡 In corso', color: 'var(--warn-text)' };
  return { text: s.state, color: 'var(--muted)' };
}

function HistoryTable({ sessions, compact }: { sessions: HistorySession[]; compact?: boolean }) {
  if (sessions.length === 0) {
    return <div className="card muted">Nessuna attività registrata finora.</div>;
  }
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>🗂 Storico attività ({sessions.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="result-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Prova</th>
              <th>Livello</th>
              <th>Voto</th>
              {!compact && <th>Distrazioni</th>}
              {!compact && <th>Ammonizioni</th>}
              <th>Stato</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const st = stateLabel(s);
              return (
                <tr key={s.id}>
                  <td title={new Date(s.started_at).toLocaleString('it-IT')}>{new Date(s.started_at).toLocaleDateString('it-IT')}</td>
                  <td>{s.categoria === 'verifica' ? '📝 Verifica' : '🎯 Eserc.'}</td>
                  <td>{s.verifica_titolo}</td>
                  <td>{s.difficolta ?? '—'}</td>
                  <td><strong>{s.voto30 != null ? `${s.voto30}/30` : '—'}</strong></td>
                  {!compact && (
                    <td>{s.distrazioni_count > 0 ? <span style={{ color: 'var(--error)', fontWeight: 600 }}>⚠ {s.distrazioni_count}</span> : <span style={{ color: 'var(--success)' }}>✓ 0</span>}</td>
                  )}
                  {!compact && (
                    <td>{s.ammonizioni_count > 0 ? <span style={{ color: 'var(--error)', fontWeight: 600 }}>⚠ {s.ammonizioni_count}</span> : '—'}</td>
                  )}
                  <td style={{ color: st.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
