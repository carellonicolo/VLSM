import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cloudGetSession,
  cloudGetStudent,
  cloudListClasses,
  cloudListStudents,
  type AdminStudent,
  type AdminStudentDetail,
} from '../../lib/cloudSync';
import { ProgressView } from '../dashboard/ProgressView';
import { buildCsv, downloadBlob, downloadCsv } from '../../lib/csv';
import { useToast } from '../ui/Toast';

interface Props {
  active: boolean;
}

const IDP_ADMIN_URL = 'https://auth.nicolocarello.it/admin';

function statusBadge(status: string): { label: string; bg: string; color: string } {
  switch (status) {
    case 'validated':
      return { label: '✅ Attivo + classe', bg: 'var(--success-bg)', color: 'var(--success)' };
    case 'pending':
      return { label: '⏳ Senza classe', bg: 'var(--warn-bg)', color: 'var(--warn-text)' };
    case 'disabled':
      return { label: '🚫 Sospeso', bg: 'var(--error-bg)', color: 'var(--error)' };
    default:
      return { label: status, bg: 'var(--readonly-bg)', color: 'var(--muted)' };
  }
}

/**
 * Roster studenti in SOLA LETTURA. Gli account (registrazione, approvazione
 * classe, sospensione, reset password) si gestiscono sull'IdP centrale
 * (auth.nicolocarello.it/admin). Qui il docente vede chi ha un account, la
 * classe approvata e lo storico delle prove svolte in VLSM.
 */
export function StudentsTab({ active }: Props) {
  const toast = useToast();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await cloudListStudents(statusFilter, classFilter.trim());
    setLoading(false);
    if (res.ok) {
      setStudents(res.students);
      setError(null);
    } else {
      setError(res.error ?? 'Errore di rete.');
    }
  }, [statusFilter, classFilter]);

  useEffect(() => {
    if (active) void reload();
  }, [active, reload]);

  // Elenco classi per il filtro: dinamico dal DB (classi degli studenti +
  // classi con stato esame configurato). Si aggiorna man mano che gli studenti
  // accedono / ottengono una classe approvata sull'IdP.
  useEffect(() => {
    if (!active) return;
    void cloudListClasses().then((res) => {
      if (res.ok) setClassOptions(res.classes.map((c) => c.class));
    });
  }, [active]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [students, search]);

  const exportCsv = () => {
    const headers = ['Nome', 'Email', 'Classe approvata', 'Stato', 'Verifiche', 'Esercitazioni', 'In corso', 'Ultimo accesso'];
    const rows = filtered.map((s) => [
      s.full_name,
      s.email,
      s.class ?? '',
      s.status,
      s.n_verifiche,
      s.n_esercitazioni,
      s.n_in_corso,
      s.last_login_at ? new Date(s.last_login_at).toLocaleString('it-IT') : '',
    ]);
    downloadCsv(`studenti_${new Date().toISOString().slice(0, 10)}.csv`, buildCsv(headers, rows));
  };

  const exportPdf = async () => {
    setPdfBusy(true);
    try {
      const [{ pdf }, { StudentsListPdf }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../pdf/StudentsListPdf'),
      ]);
      const blob = await pdf(<StudentsListPdf students={filtered} />).toBlob();
      downloadBlob(`studenti_${new Date().toISOString().slice(0, 10)}.pdf`, blob);
    } catch (e) {
      toast(`Errore generazione PDF: ${e instanceof Error ? e.message : String(e)}`, 'error');
    } finally {
      setPdfBusy(false);
    }
  };

  const openDetail = async (s: AdminStudent) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await cloudGetStudent(s.id);
    setDetailLoading(false);
    if (res.ok && res.detail) setDetail(res.detail);
    else toast(`Errore: ${res.error}`, 'error');
  };

  return (
    <>
      <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
        <strong>Gestione studenti centralizzata (SSO)</strong>
        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Registrazione, approvazione della classe, sospensione e reset password si gestiscono sul
          portale unico{' '}
          <a href={IDP_ADMIN_URL} target="_blank" rel="noopener noreferrer">auth.nicolocarello.it/admin</a>.
          Qui hai il <strong>roster in sola lettura</strong>: stato, classe approvata e storico prove.
          Per abilitare le verifiche a una classe usa la tab <strong>«🎛 Classi &amp; esame»</strong>.
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>👥 Studenti</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>{students.length} account</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Tutti gli stati</option>
              <option value="validated">Attivi con classe</option>
              <option value="pending">Senza classe</option>
              <option value="disabled">Sospesi</option>
            </select>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔎 Cerca nome o email"
              style={{ width: 190 }}
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ width: 'auto' }}
              title="Filtra per classe"
            >
              <option value="">Tutte le classi</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="btn btn-secondary" type="button" onClick={() => void reload()} disabled={loading}>
              {loading ? '⏳' : '🔄'} Aggiorna
            </button>
            <button className="btn btn-secondary" type="button" onClick={exportCsv} disabled={filtered.length === 0}>
              📥 CSV
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => void exportPdf()} disabled={filtered.length === 0 || pdfBusy}>
              {pdfBusy ? '⏳' : '📄'} PDF
            </button>
          </div>
        </div>
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
      </div>

      {filtered.length === 0 && !error && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          {students.length === 0 ? 'Nessuno studente ha ancora effettuato l’accesso a VLSM.' : 'Nessuno studente corrisponde alla ricerca.'}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Stato</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Classe</th>
                  <th>Verifiche</th>
                  <th>Eserc.</th>
                  <th>Ultimo accesso</th>
                  <th>Andamento</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const b = statusBadge(s.status);
                  return (
                    <tr key={s.id} style={s.status === 'disabled' ? { background: 'var(--error-bg)' } : undefined}>
                      <td><span style={{ background: b.bg, color: b.color, padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{b.label}</span></td>
                      <td>{s.full_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{s.email}</td>
                      <td>{s.class ? <strong>{s.class}</strong> : <span className="muted">—</span>}</td>
                      <td>{s.n_verifiche}{s.n_in_corso > 0 ? <span style={{ color: 'var(--warn-text)' }}> (+{s.n_in_corso} in corso)</span> : ''}</td>
                      <td>{s.n_esercitazioni}</td>
                      <td style={{ fontSize: '0.8rem' }}>{s.last_login_at ? new Date(s.last_login_at).toLocaleString('it-IT') : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-secondary" type="button" style={btnSm} onClick={() => void openDetail(s)} title="Vedi andamento e prove">📊 Andamento</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(detail || detailLoading) && (
        <DetailModal detail={detail} loading={detailLoading} onClose={() => setDetail(null)} />
      )}
    </>
  );
}

const btnSm: React.CSSProperties = { fontSize: '0.75rem', padding: '0.25rem 0.45rem', marginRight: '0.25rem' };

function DetailModal({ detail, loading, onClose }: { detail: AdminStudentDetail | null; loading: boolean; onClose: () => void }) {
  return (
    <div className="alert-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="card" style={{ maxWidth: 820, width: '100%', maxHeight: '88vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {loading && <div className="muted">⏳ Caricamento storico…</div>}
        {detail && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{detail.student.full_name}</h3>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {detail.student.email}{detail.student.class ? ` · ${detail.student.class}` : ''} · stato: {detail.student.status}
                </div>
              </div>
              <button className="btn btn-secondary" type="button" onClick={onClose}>Chiudi</button>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <ProgressView
                sessions={detail.sessions}
                subject={{
                  name: detail.student.full_name,
                  subtitle: `${detail.student.email}${detail.student.class ? ` · ${detail.student.class}` : ''}`,
                }}
                fetchSessionForPdf={async (id) => {
                  const r = await cloudGetSession(id);
                  return r.ok && r.session ? r.session : null;
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
