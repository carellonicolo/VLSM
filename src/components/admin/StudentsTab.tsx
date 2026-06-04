import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cloudDeleteStudent,
  cloudGetStudent,
  cloudListStudents,
  cloudResetStudentPassword,
  cloudValidateStudent,
  type AdminStudent,
  type AdminStudentDetail,
} from '../../lib/cloudSync';
import { ProgressView } from '../dashboard/ProgressView';

interface Props {
  active: boolean;
}

function statusBadge(status: string): { label: string; bg: string; color: string } {
  switch (status) {
    case 'validated':
      return { label: '✅ Convalidato', bg: 'var(--success-bg)', color: 'var(--success)' };
    case 'pending':
      return { label: '⏳ In attesa', bg: 'var(--warn-bg)', color: 'var(--warn-text)' };
    case 'rejected':
      return { label: '⛔ Rifiutato', bg: 'var(--error-bg)', color: 'var(--error)' };
    case 'disabled':
      return { label: '🚫 Disabilitato', bg: 'var(--error-bg)', color: 'var(--error)' };
    default:
      return { label: status, bg: 'var(--readonly-bg)', color: 'var(--muted)' };
  }
}

export function StudentsTab({ active }: Props) {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [validateTarget, setValidateTarget] = useState<AdminStudent | null>(null);
  const [detail, setDetail] = useState<AdminStudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const pendingCount = useMemo(() => students.filter((s) => s.status === 'pending').length, [students]);

  const doValidate = async (s: AdminStudent, status: string, klass?: string) => {
    setBusyId(s.id);
    const res = await cloudValidateStudent(s.id, status, klass);
    setBusyId(null);
    if (res.ok) {
      setValidateTarget(null);
      void reload();
    } else {
      alert(`Errore: ${res.error}`);
    }
  };

  const onResetPassword = async (s: AdminStudent) => {
    const pwd = prompt(`Nuova password per ${s.full_name} (${s.email}) — minimo 8 caratteri.\nComunicala allo studente: gli verrà chiesto di cambiarla al prossimo accesso.`);
    if (pwd == null) return;
    if (pwd.length < 8) {
      alert('La password deve avere almeno 8 caratteri.');
      return;
    }
    setBusyId(s.id);
    const res = await cloudResetStudentPassword(s.id, pwd);
    setBusyId(null);
    alert(res.ok ? 'Password reimpostata.' : `Errore: ${res.error}`);
  };

  const onDelete = async (s: AdminStudent) => {
    if (!confirm(`Eliminare l'account di ${s.full_name} (${s.email})?\nLe sue prove resteranno come 'legacy' non collegate. Operazione irreversibile.`)) return;
    setBusyId(s.id);
    const res = await cloudDeleteStudent(s.id);
    setBusyId(null);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  const openDetail = async (s: AdminStudent) => {
    setDetailLoading(true);
    setDetail(null);
    const res = await cloudGetStudent(s.id);
    setDetailLoading(false);
    if (res.ok && res.detail) setDetail(res.detail);
    else alert(`Errore: ${res.error}`);
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>👥 Studenti</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              {students.length} account{pendingCount > 0 ? ` · ${pendingCount} in attesa di convalida` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="all">Tutti gli stati</option>
              <option value="pending">In attesa</option>
              <option value="validated">Convalidati</option>
              <option value="rejected">Rifiutati</option>
              <option value="disabled">Disabilitati</option>
            </select>
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Filtra per classe"
              style={{ width: 150 }}
            />
            <button className="btn btn-secondary" type="button" onClick={() => void reload()} disabled={loading}>
              {loading ? '⏳' : '🔄'} Aggiorna
            </button>
          </div>
        </div>
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
      </div>

      {students.length === 0 && !error && (
        <div className="card muted" style={{ textAlign: 'center' }}>Nessuno studente con questi filtri.</div>
      )}

      {students.length > 0 && (
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
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const b = statusBadge(s.status);
                  return (
                    <tr key={s.id} style={s.status === 'pending' ? { background: 'var(--warn-bg)' } : undefined}>
                      <td><span style={{ background: b.bg, color: b.color, padding: '0.15rem 0.5rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{b.label}</span></td>
                      <td>{s.full_name}</td>
                      <td style={{ fontSize: '0.82rem' }}>{s.email}</td>
                      <td>
                        {s.class ? <strong>{s.class}</strong> : <span className="muted" title="Classe dichiarata, non ancora confermata">{s.declared_class || '—'} <em>(dich.)</em></span>}
                      </td>
                      <td>{s.n_verifiche}{s.n_in_corso > 0 ? <span style={{ color: 'var(--warn-text)' }}> (+{s.n_in_corso} in corso)</span> : ''}</td>
                      <td>{s.n_esercitazioni}</td>
                      <td style={{ fontSize: '0.8rem' }}>{s.last_login_at ? new Date(s.last_login_at).toLocaleString('it-IT') : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn" type="button" style={btnSm} disabled={busyId === s.id} onClick={() => setValidateTarget(s)} title="Convalida / cambia stato e classe">✓ Stato</button>
                        <button className="btn btn-secondary" type="button" style={btnSm} disabled={busyId === s.id} onClick={() => void openDetail(s)} title="Vedi andamento e prove">📊</button>
                        <button className="btn btn-secondary" type="button" style={btnSm} disabled={busyId === s.id} onClick={() => void onResetPassword(s)} title="Reimposta password">🔑</button>
                        <button className="btn btn-secondary" type="button" style={btnSm} disabled={busyId === s.id} onClick={() => void onDelete(s)} title="Elimina account">🗑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {validateTarget && (
        <ValidateModal
          student={validateTarget}
          busy={busyId === validateTarget.id}
          onClose={() => setValidateTarget(null)}
          onApply={(status, klass) => void doValidate(validateTarget, status, klass)}
        />
      )}

      {(detail || detailLoading) && (
        <DetailModal detail={detail} loading={detailLoading} onClose={() => setDetail(null)} />
      )}
    </>
  );
}

const btnSm: React.CSSProperties = { fontSize: '0.75rem', padding: '0.25rem 0.45rem', marginRight: '0.25rem' };

function ValidateModal({
  student,
  busy,
  onClose,
  onApply,
}: {
  student: AdminStudent;
  busy: boolean;
  onClose: () => void;
  onApply: (status: string, klass?: string) => void;
}) {
  const [klass, setKlass] = useState(student.class || student.declared_class || '');
  return (
    <div className="alert-overlay" role="dialog" aria-modal="true">
      <div className="card" style={{ maxWidth: 480, width: '100%' }}>
        <h3 style={{ marginTop: 0 }}>Convalida studente</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          <strong>{student.full_name}</strong> · {student.email}
          <br />Classe dichiarata: <strong>{student.declared_class || '—'}</strong>
        </p>
        <div className="field">
          <label htmlFor="val-class">Classe confermata</label>
          <input id="val-class" type="text" value={klass} onChange={(e) => setKlass(e.target.value)} placeholder="es. 5A SRI" autoFocus />
        </div>
        <div className="actions" style={{ flexWrap: 'wrap', marginTop: '0.75rem' }}>
          <button className="btn" type="button" disabled={busy || klass.trim().length === 0} onClick={() => onApply('validated', klass.trim())}>
            ✅ Convalida (classe {klass.trim() || '—'})
          </button>
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => onApply('pending')}>⏳ In attesa</button>
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => onApply('rejected')}>⛔ Rifiuta</button>
          <button className="btn btn-secondary" type="button" disabled={busy} onClick={() => onApply('disabled')}>🚫 Disabilita</button>
          <button className="btn btn-secondary" type="button" onClick={onClose} style={{ marginLeft: 'auto' }}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

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
              <ProgressView sessions={detail.sessions} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
