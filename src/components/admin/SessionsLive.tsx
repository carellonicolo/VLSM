import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cloudDeleteSession,
  cloudGetSession,
  cloudIntervene,
  cloudListSessions,
  cloudReopenSession,
  type CloudSessionRow,
} from '../../lib/cloudSync';
import { formatDuration, formatTimeOfDay } from '../../lib/format';
import { getVerifica } from '../../data/verifiche';
import { gradeVerifica } from '../../lib/grading';
import type { EsitoFinale, MotivoConsegna, RispostaStudente } from '../../types/domain';

const REFRESH_MS = 5000;

interface Props {
  active: boolean;
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 5000) return 'ora';
  if (diff < 60000) return `${Math.round(diff / 1000)}s fa`;
  return formatDuration(diff) + ' fa';
}

function activityState(row: CloudSessionRow): { color: string; label: string } {
  if (row.state === 'consegnata') return { color: 'var(--success)', label: '✅ Consegnata' };
  if (row.state === 'annullata') return { color: 'var(--error)', label: '⛔ Annullata' };
  if (row.state === 'abbandonata') return { color: 'var(--muted)', label: '⚪ Abbandonata' };
  const diffMin = (Date.now() - new Date(row.updated_at).getTime()) / 60000;
  if (diffMin < 1) return { color: 'var(--success)', label: '🟢 Attiva' };
  if (diffMin < 5) return { color: '#d97706', label: '🟡 Inattiva' };
  return { color: 'var(--error)', label: '🔴 Inattiva da >5 min' };
}

export function SessionsLive({ active }: Props) {
  const [rows, setRows] = useState<CloudSessionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<'all' | 'in_progress' | 'consegnata' | 'abbandonata' | 'annullata'>('in_progress');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [intervene, setIntervene] = useState<{ row: CloudSessionRow; type: 'alert' | 'ammonizione' | 'annulla' } | null>(null);
  const [, force] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await cloudListSessions(stateFilter);
    setLoading(false);
    if (res.ok) {
      setRows(res.sessions);
      setLastError(null);
    } else {
      setLastError(res.error ?? 'Errore di rete.');
    }
  }, [stateFilter]);

  useEffect(() => {
    if (!active) return;
    void reload();
    const id = setInterval(() => void reload(), REFRESH_MS);
    // Re-render ogni secondo per aggiornare i "X fa"
    const tick = setInterval(() => force((n) => n + 1), 1000);
    return () => {
      clearInterval(id);
      clearInterval(tick);
    };
  }, [active, reload]);

  const filtered = useMemo(() => rows, [rows]);

  const onReopen = async (id: string) => {
    if (!confirm("Riaprire questa verifica? Tornerà 'in_progress' con +15 minuti di tempo.")) return;
    setBusyId(id);
    const res = await cloudReopenSession(id, 15);
    setBusyId(null);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Eliminare questa sessione dal database cloud? Operazione irreversibile.')) return;
    setBusyId(id);
    const res = await cloudDeleteSession(id);
    setBusyId(null);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  const doIntervene = async (message: string) => {
    if (!intervene) return;
    const { row, type } = intervene;
    setBusyId(row.id);
    const res = await cloudIntervene(row.id, type, message);
    setBusyId(null);
    setIntervene(null);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  const onDownloadPdf = async (id: string) => {
    setBusyId(id);
    try {
      const res = await cloudGetSession(id);
      if (!res.ok || !res.session) {
        alert(`Errore: ${res.error ?? 'sessione non trovata'}`);
        return;
      }
      const s = res.session;

      // Se esito è già presente (consegnata), usa quello (include la firma originale).
      // Altrimenti rigrada al volo a partire dalle risposte salvate (snapshot in_progress).
      let esito: EsitoFinale;
      if (s.esito && typeof s.esito === 'object') {
        esito = s.esito as EsitoFinale;
      } else {
        const verifica = getVerifica(s.verifica_id);
        if (!verifica) {
          alert('Errore: verifica non trovata nel dataset locale.');
          return;
        }
        const startedAt = new Date(s.started_at);
        const consegnatoAt = s.consegnato_at ? new Date(s.consegnato_at) : new Date(s.updated_at);
        const motivo: MotivoConsegna = (s.motivo_consegna === 'timeout' ? 'timeout' : 'volontaria');
        esito = gradeVerifica(
          verifica,
          s.answers as RispostaStudente,
          { nome: s.student_name, classe: s.student_class },
          motivo,
          consegnatoAt,
          startedAt,
          s.eventiFocus ?? []
        );
      }

      const [{ pdf }, { PdfReport }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/PdfReport'),
      ]);
      const blob = await pdf(<PdfReport esito={esito} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = s.student_name.replace(/[^a-zA-Z0-9_-]+/g, '_');
      a.href = url;
      a.download = `vlsm_${safeName}_${s.verifica_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      alert(`Errore generazione PDF: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>🟢 Sessioni live</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              Aggiornamento automatico ogni {REFRESH_MS / 1000}s · {filtered.length} sessioni
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value as typeof stateFilter)}
              style={{ width: 'auto' }}
            >
              <option value="in_progress">In corso</option>
              <option value="consegnata">Consegnate</option>
              <option value="annullata">Annullate</option>
              <option value="abbandonata">Abbandonate</option>
              <option value="all">Tutte</option>
            </select>
            <button className="btn btn-secondary" type="button" onClick={() => void reload()} disabled={loading}>
              {loading ? '⏳' : '🔄'} Aggiorna
            </button>
          </div>
        </div>
        {lastError && (
          <div className="error-msg" style={{ marginTop: '0.75rem' }}>
            <strong>Cloud non disponibile:</strong> {lastError}
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Verifica che il binding D1 sia configurato sul progetto Pages e che le password
              VITE_APP_PASSWORD / VITE_ADMIN_PASSWORD siano impostate anche come APP_PASSWORD / ADMIN_PASSWORD
              (env variabili server-side).
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 && !lastError && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          Nessuna sessione con stato "<strong>{stateFilter}</strong>".
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Stato</th>
                  <th>Studente</th>
                  <th>Classe</th>
                  <th>Verifica</th>
                  <th>Iniziata</th>
                  <th>Ultimo save</th>
                  <th>Distrazioni</th>
                  <th>Ammon.</th>
                  <th>Voto</th>
                  <th>Firma</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const act = activityState(r);
                  return (
                    <tr key={r.id}>
                      <td style={{ color: act.color, fontWeight: 600, whiteSpace: 'nowrap' }} title={r.state === 'annullata' && r.annullata_motivo ? `Motivo: ${r.annullata_motivo}` : undefined}>{act.label}</td>
                      <td>
                        {r.student_name}
                        {r.student_email && <div className="muted" style={{ fontSize: '0.72rem' }}>{r.student_email}</div>}
                        {!r.student_id && <div className="muted" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>legacy</div>}
                      </td>
                      <td>{r.student_class}</td>
                      <td>{r.verifica_titolo}{r.difficolta ? ` (${r.difficolta})` : ''}</td>
                      <td title={new Date(r.started_at).toLocaleString('it-IT')}>{formatTimeOfDay(r.started_at)}</td>
                      <td title={new Date(r.updated_at).toLocaleString('it-IT')}>{relativeTime(r.updated_at)}</td>
                      <td>
                        {r.distrazioni_count > 0
                          ? <span style={{ color: 'var(--error)', fontWeight: 600 }}>⚠ {r.distrazioni_count}</span>
                          : <span style={{ color: 'var(--success)' }}>✓ 0</span>}
                      </td>
                      <td>
                        {r.ammonizioni_count > 0
                          ? <span style={{ color: 'var(--error)', fontWeight: 700 }}>⚠ {r.ammonizioni_count}</span>
                          : '—'}
                      </td>
                      <td><strong>{r.voto30 != null ? `${r.voto30}/30` : '—'}</strong></td>
                      <td>{r.signed ? '✅' : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.state === 'in_progress' && r.categoria === 'verifica' && (
                          <>
                            <button
                              className="btn-secondary btn"
                              type="button"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', marginRight: '0.25rem' }}
                              disabled={busyId === r.id}
                              onClick={() => setIntervene({ row: r, type: 'alert' })}
                              title="Invia un messaggio momentaneo allo studente"
                            >
                              ✉️ Alert
                            </button>
                            <button
                              className="btn-secondary btn"
                              type="button"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', marginRight: '0.25rem' }}
                              disabled={busyId === r.id}
                              onClick={() => setIntervene({ row: r, type: 'ammonizione' })}
                              title="Registra un'ammonizione (compare sul resoconto)"
                            >
                              ⚠️ Ammonisci
                            </button>
                            <button
                              className="btn"
                              type="button"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.45rem', marginRight: '0.25rem', background: 'var(--error)', borderColor: 'var(--error)' }}
                              disabled={busyId === r.id}
                              onClick={() => setIntervene({ row: r, type: 'annulla' })}
                              title="Interrompi e annulla la prova"
                            >
                              ⛔ Annulla
                            </button>
                          </>
                        )}
                        <button
                          className="btn"
                          type="button"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
                          disabled={busyId === r.id}
                          onClick={() => onDownloadPdf(r.id)}
                          title={r.state === 'consegnata' ? 'Scarica il PDF con voto e firma' : 'Scarica uno snapshot PDF con le risposte attuali (senza firma)'}
                        >
                          📄 PDF
                        </button>
                        {(r.state === 'consegnata' || r.state === 'annullata') && (
                          <button
                            className="btn-secondary btn"
                            type="button"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', marginRight: '0.25rem' }}
                            disabled={busyId === r.id}
                            onClick={() => onReopen(r.id)}
                          >
                            ↩ Riapri
                          </button>
                        )}
                        <button
                          className="btn-secondary btn"
                          type="button"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          disabled={busyId === r.id}
                          onClick={() => onDelete(r.id)}
                        >
                          🗑 Elimina
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {intervene && (
        <InterveneModal
          studentName={intervene.row.student_name}
          type={intervene.type}
          busy={busyId === intervene.row.id}
          onClose={() => setIntervene(null)}
          onConfirm={(msg) => void doIntervene(msg)}
        />
      )}
    </>
  );
}

const PRESETS: Record<'alert' | 'ammonizione' | 'annulla', string[]> = {
  alert: [
    'Concentrati sulla tua prova.',
    'Smetti di usare altri dispositivi.',
    'Torna sulla scheda della verifica.',
    'Resta in silenzio.',
  ],
  ammonizione: [
    'Uso del telefono / dispositivi non consentiti',
    'Consultazione di materiale non autorizzato',
    'Comunicazione con altri studenti',
    'Comportamento scorretto durante la prova',
  ],
  annulla: [
    'Uso di dispositivi vietati',
    'Copiatura accertata',
    'Comportamento gravemente scorretto',
  ],
};

const INTERVENE_META = {
  alert: { title: '✉️ Invia un alert', cta: 'Invia alert', danger: false, help: 'Messaggio momentaneo: compare allo studente e poi scompare. Non lascia traccia.' },
  ammonizione: { title: '⚠️ Ammonisci lo studente', cta: 'Registra ammonizione', danger: false, help: "L'ammonizione resta registrata e compare sul PDF/resoconto della verifica." },
  annulla: { title: '⛔ Annulla la prova', cta: 'Annulla la prova', danger: true, help: 'La prova viene interrotta e bloccata: lo studente non potrà più rispondere. Il motivo gli verrà mostrato.' },
} as const;

function InterveneModal({
  studentName,
  type,
  busy,
  onClose,
  onConfirm,
}: {
  studentName: string;
  type: 'alert' | 'ammonizione' | 'annulla';
  busy: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
}) {
  const meta = INTERVENE_META[type];
  const [msg, setMsg] = useState('');

  return (
    <div className="alert-overlay" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 520, width: '100%', borderTop: `5px solid ${meta.danger ? 'var(--error)' : 'var(--primary)'}` }}>
        <h3 style={{ marginTop: 0 }}>{meta.title}</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          Studente: <strong>{studentName}</strong>
        </p>
        <p className="muted" style={{ fontSize: '0.85rem', marginTop: 0 }}>{meta.help}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
          {PRESETS[type].map((p) => (
            <button key={p} type="button" className="preset-chip" onClick={() => setMsg(p)}>{p}</button>
          ))}
        </div>

        <div className="field">
          <label htmlFor="intervene-msg">{type === 'alert' ? 'Messaggio' : 'Motivo'}</label>
          <textarea
            id="intervene-msg"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={3}
            autoFocus
            placeholder={type === 'alert' ? 'Scrivi il messaggio…' : 'Scrivi il motivo…'}
            style={{ width: '100%', padding: '0.5rem 0.7rem', border: '1px solid var(--border)', borderRadius: 5, fontFamily: 'inherit', fontSize: '0.95rem', background: 'var(--input-bg)', color: 'var(--fg)', resize: 'vertical' }}
          />
        </div>

        <div className="actions" style={{ flexWrap: 'wrap' }}>
          <button
            className="btn"
            type="button"
            disabled={busy || (type !== 'annulla' && msg.trim().length === 0)}
            style={meta.danger ? { background: 'var(--error)', borderColor: 'var(--error)' } : undefined}
            onClick={() => onConfirm(msg.trim())}
          >
            {busy ? 'Invio…' : meta.cta}
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose} style={{ marginLeft: 'auto' }}>Annulla</button>
        </div>
      </div>
    </div>
  );
}
