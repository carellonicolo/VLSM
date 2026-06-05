import { useEffect, useMemo, useState } from 'react';
import { parseMultiple, toCsv, downloadCsv, type ParsedFile } from '../../lib/pdfBulk';
import { cloudListStudents } from '../../lib/cloudSync';
import type { VerifyStatus } from '../../lib/pdfSign';
import { SessionsLive } from './SessionsLive';
import { SettingsTab } from './SettingsTab';
import { VerificheTab } from './VerificheTab';
import { StudentsTab } from './StudentsTab';
import { ClassesTab } from './ClassesTab';

type AdminTab = 'studenti' | 'classi' | 'live' | 'bulk' | 'verifiche' | 'settings';

interface Props {
  onExit: () => void;
}

function badgeStyle(status: VerifyStatus | undefined): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.15rem 0.5rem',
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  switch (status) {
    case 'valid':
      return { ...base, background: '#e6f5ec', color: '#1f7a3c' };
    case 'invalid':
      return { ...base, background: '#ffe6e1', color: '#c0392b' };
    case 'unsigned':
      return { ...base, background: '#fff3c4', color: '#7c5d00' };
    case 'unavailable':
    default:
      return { ...base, background: '#eef1f7', color: '#6b7280' };
  }
}

function badgeLabel(status: VerifyStatus | undefined): string {
  switch (status) {
    case 'valid':
      return '✅ Firma valida';
    case 'invalid':
      return '❌ Manomesso';
    case 'unsigned':
      return '⚠️ Non firmato';
    case 'unavailable':
      return '⏳ API non disponibile';
    default:
      return '—';
  }
}

export function AdminScreen({ onExit }: Props) {
  const [tab, setTab] = useState<AdminTab>('studenti');
  const [pendingCount, setPendingCount] = useState(0);
  const [parsing, setParsing] = useState(false);

  // Conteggio studenti in attesa di convalida (badge sulla tab), aggiornato
  // periodicamente e ad ogni cambio tab.
  useEffect(() => {
    let active = true;
    const load = async () => {
      const res = await cloudListStudents('pending');
      if (active && res.ok) setPendingCount(res.students.length);
    };
    void load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [tab]);
  const [parsed, setParsed] = useState<ParsedFile[]>([]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const ok = useMemo(() => parsed.filter((p) => p.sommario), [parsed]);
  const okSommari = useMemo(() => ok.map((p) => p.sommario!), [ok]);
  const errors = useMemo(() => parsed.filter((p) => p.error), [parsed]);
  const verifiche = useMemo(() => ok.filter((p) => p.sommario!.categoria === 'verifica'), [ok]);
  const esercitazioni = useMemo(() => ok.filter((p) => p.sommario!.categoria === 'esercitazione'), [ok]);

  const stats = useMemo(() => {
    const r = { valid: 0, invalid: 0, unsigned: 0, unavailable: 0 };
    for (const p of ok) {
      const s = p.verify ?? 'unavailable';
      r[s as keyof typeof r]++;
    }
    return r;
  }, [ok]);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setParsing(true);
    const results = await parseMultiple(Array.from(files));
    setParsed((prev) => [...prev, ...results]);
    setParsing(false);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (dropped.length > 0) onFiles(dropped as unknown as FileList);
  };

  const clearAll = () => {
    setParsed([]);
    setPdfError(null);
  };

  const downloadReportPdf = async () => {
    if (ok.length === 0) return;
    setGeneratingPdf(true);
    setPdfError(null);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { AdminReportPdf } = await import('./AdminReportPdf');
      const blob = await pdf(
        <AdminReportPdf
          verifiche={verifiche.map((p) => p.sommario!)}
          esercitazioni={esercitazioni.map((p) => p.sommario!)}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_vlsm_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setPdfError(`Errore nella generazione del PDF: ${msg}`);
      // eslint-disable-next-line no-console
      console.error('PDF report generation failed', e);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className="test-header-bar">
        <h2 style={{ margin: 0 }}>📊 Modalità docente</h2>
        <button className="btn btn-secondary" type="button" onClick={onExit}>Esci</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          className={tab === 'studenti' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('studenti')}
        >
          👥 Studenti
          {pendingCount > 0 && <span className="tab-badge" title={`${pendingCount} in attesa di convalida`}>{pendingCount}</span>}
        </button>
        <button
          className={tab === 'classi' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('classi')}
        >
          🎛 Classi &amp; esame
        </button>
        <button
          className={tab === 'live' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('live')}
        >
          🟢 Sessioni live (cloud)
        </button>
        <button
          className={tab === 'bulk' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('bulk')}
        >
          📥 Correzione PDF (bulk)
        </button>
        <button
          className={tab === 'verifiche' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('verifiche')}
        >
          📄 Verifiche &amp; Soluzioni
        </button>
        <button
          className={tab === 'settings' ? 'btn' : 'btn btn-secondary'}
          type="button"
          onClick={() => setTab('settings')}
        >
          ⚙️ Impostazioni
        </button>
      </div>

      {tab === 'studenti' && <StudentsTab active={tab === 'studenti'} />}
      {tab === 'classi' && <ClassesTab active={tab === 'classi'} />}
      {tab === 'live' && <SessionsLive active={tab === 'live'} />}
      {tab === 'verifiche' && <VerificheTab />}
      {tab === 'settings' && <SettingsTab active={tab === 'settings'} />}

      {tab === 'bulk' && (
        <>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Carica le consegne PDF degli studenti</h3>
        <p className="muted">
          Trascina i file PDF generati dall'app (oppure clicca per selezionarli). Il parser legge i dati incorporati nei metadati e verifica la firma HMAC contro l'API <code>/api/verify</code>.
        </p>
        <label
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{
            display: 'block',
            border: '2px dashed var(--border)',
            borderRadius: 8,
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#fafbfc',
          }}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            style={{ display: 'none' }}
          />
          <strong>📂 Trascina i PDF qui</strong>
          <div className="muted" style={{ marginTop: '0.5rem' }}>oppure clicca per scegliere uno o più file</div>
        </label>
        {parsing && <p className="muted" style={{ marginTop: '0.5rem' }}>⏳ Parsing e verifica firme in corso…</p>}
        {parsed.length > 0 && (
          <>
            <div className="actions" style={{ marginTop: '1rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="button" onClick={clearAll}>Svuota lista</button>
              <button
                className="btn"
                type="button"
                onClick={() => downloadCsv(`report_vlsm_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(okSommari))}
                disabled={ok.length === 0}
              >
                📥 Scarica CSV
              </button>
              <button
                className="btn"
                type="button"
                onClick={downloadReportPdf}
                disabled={ok.length === 0 || generatingPdf}
              >
                {generatingPdf ? 'Generazione PDF…' : '📄 Scarica PDF riepilogo'}
              </button>
            </div>
            {pdfError && <div className="error-msg" style={{ marginTop: '0.5rem' }}>{pdfError}</div>}
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {stats.valid > 0 && <span style={badgeStyle('valid')}>✅ {stats.valid} firma valida</span>}
              {stats.invalid > 0 && <span style={badgeStyle('invalid')}>❌ {stats.invalid} manomessi</span>}
              {stats.unsigned > 0 && <span style={badgeStyle('unsigned')}>⚠️ {stats.unsigned} non firmati</span>}
              {stats.unavailable > 0 && <span style={badgeStyle('unavailable')}>⏳ {stats.unavailable} firma non verificabile</span>}
            </div>
          </>
        )}
      </div>

      {errors.length > 0 && (
        <div className="card" style={{ background: '#ffe6e1', borderColor: '#c0392b' }}>
          <h3 style={{ marginTop: 0, color: '#c0392b' }}>File non riconosciuti ({errors.length})</h3>
          <ul style={{ margin: 0 }}>
            {errors.map((e, i) => (
              <li key={i}><code>{e.filename}</code> — {e.error}</li>
            ))}
          </ul>
        </div>
      )}

      {verifiche.length > 0 && <SezioneTabella titolo={`Verifiche ufficiali (${verifiche.length})`} rows={verifiche} />}
      {esercitazioni.length > 0 && <SezioneTabella titolo={`Esercitazioni libere (${esercitazioni.length})`} rows={esercitazioni} esercitazione />}

      {parsed.length > 0 && ok.length === 0 && (
        <div className="card muted">Nessun PDF valido caricato finora.</div>
      )}
        </>
      )}
    </>
  );
}

function SezioneTabella({ titolo, rows, esercitazione = false }: { titolo: string; rows: ParsedFile[]; esercitazione?: boolean }) {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: esercitazione ? '#7c5d00' : 'var(--primary)' }}>{titolo}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="result-table">
          <thead>
            <tr>
              <th>Firma</th>
              <th>Nome</th>
              <th>Classe</th>
              <th>Verifica</th>
              <th>Voto /30</th>
              <th>Voto /10</th>
              <th>Durata</th>
              <th>Distrazioni</th>
              <th>Consegna</th>
              <th>Modalità</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => {
              const r = p.sommario!;
              const eventi = r.eventiFocus ?? [];
              const tempoFuori = eventi.reduce((a, e) => a + e.durataMs, 0);
              return (
                <tr key={i} style={p.verify === 'invalid' ? { background: 'var(--error-bg)' } : undefined}>
                  <td><span style={badgeStyle(p.verify)}>{badgeLabel(p.verify)}</span></td>
                  <td>{r.nome}</td>
                  <td>{r.classe}</td>
                  <td>{r.verificaTitolo}</td>
                  <td><strong>{r.voto30}</strong></td>
                  <td>{r.voto10}</td>
                  <td>{Math.round(r.durataMs / 60000)} min</td>
                  <td title={eventi.length > 0 ? `Tempo totale fuori focus: ${Math.round(tempoFuori / 1000)}s` : 'Nessuna distrazione'}>
                    {eventi.length === 0
                      ? <span style={{ color: 'var(--success)' }}>✓ 0</span>
                      : <span style={{ color: 'var(--error)', fontWeight: 600 }}>⚠ {eventi.length} ({Math.round(tempoFuori / 1000)}s)</span>}
                  </td>
                  <td>{new Date(r.consegnatoAt).toLocaleString('it-IT')}</td>
                  <td>{r.motivoConsegna}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
