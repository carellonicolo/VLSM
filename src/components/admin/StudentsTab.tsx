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
import { buildCsv, downloadBlob, downloadCsv } from '../../lib/csv';
import { useToast } from '../ui/Toast';
import { useConfirm } from '../ui/Confirm';

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
  const toast = useToast();
  const confirm = useConfirm();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const [validateTarget, setValidateTarget] = useState<AdminStudent | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminStudent | null>(null);
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

  const pendingCount = useMemo(() => students.filter((s) => s.status === 'pending').length, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
  }, [students, search]);

  const doValidate = async (s: AdminStudent, status: string, klass?: string) => {
    setBusyId(s.id);
    const res = await cloudValidateStudent(s.id, status, klass);
    setBusyId(null);
    if (res.ok) {
      setValidateTarget(null);
      toast(status === 'validated' ? `${s.full_name} convalidato.` : `Stato di ${s.full_name} aggiornato.`, 'success');
      void reload();
    } else {
      toast(`Errore: ${res.error}`, 'error');
    }
  };

  // Convalida rapida: approva tutti i pending che hanno già dichiarato una
  // classe, confermando quella classe. Quelli senza classe dichiarata restano
  // da gestire a mano.
  const bulkValidatePending = async () => {
    const pend = filtered.filter((s) => s.status === 'pending');
    const conClasse = pend.filter((s) => (s.declared_class ?? '').trim().length > 0);
    const senzaClasse = pend.length - conClasse.length;
    if (conClasse.length === 0) {
      toast('Nessun pending con classe dichiarata da convalidare.', 'info');
      return;
    }
    const ok = await confirm({
      title: 'Convalida rapida',
      message: `Convalido ${conClasse.length} student${conClasse.length === 1 ? 'e' : 'i'} usando la classe che hanno dichiarato${senzaClasse > 0 ? ` (${senzaClasse} senza classe verranno saltati)` : ''}?`,
      confirmLabel: 'Convalida tutti',
    });
    if (!ok) return;
    setBusyId('bulk');
    let done = 0;
    for (const s of conClasse) {
      const res = await cloudValidateStudent(s.id, 'validated', (s.declared_class ?? '').trim());
      if (res.ok) done++;
    }
    setBusyId(null);
    toast(`Convalidati ${done}/${conClasse.length}${senzaClasse > 0 ? ` · ${senzaClasse} saltati (senza classe)` : ''}.`, done === conClasse.length ? 'success' : 'info');
    void reload();
  };

  const exportCsv = () => {
    const headers = ['Nome', 'Email', 'Classe dichiarata', 'Classe confermata', 'Stato', 'Verifiche', 'Esercitazioni', 'In corso', 'Ultimo accesso'];
    const rows = filtered.map((s) => [
      s.full_name,
      s.email,
      s.declared_class ?? '',
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

  const onDelete = async (s: AdminStudent) => {
    const ok = await confirm({
      title: 'Eliminare account?',
      message: `Eliminare l'account di ${s.full_name} (${s.email})? Le sue prove resteranno come 'legacy' non collegate. Operazione irreversibile.`,
      confirmLabel: 'Elimina',
      danger: true,
    });
    if (!ok) return;
    setBusyId(s.id);
    const res = await cloudDeleteStudent(s.id);
    setBusyId(null);
    if (res.ok) {
      toast('Account eliminato.', 'success');
      void reload();
    } else {
      toast(`Errore: ${res.error}`, 'error');
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
        <strong>Come gestire gli studenti</strong>
        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
          1) Lo studente si registra da solo · 2) tu lo <strong>convalidi</strong> con «✓ Stato»
          confermando la classe · 3) sblocchi l'esame per quella classe nella tab
          <strong> «🎛 Classi &amp; esame»</strong> · 4) segui le prove in <strong>«🟢 Sessioni live»</strong>.
          Solo gli studenti convalidati di una classe attiva possono fare verifiche.
        </div>
      </div>

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
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔎 Cerca nome o email"
              style={{ width: 190 }}
            />
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Filtra per classe"
              style={{ width: 140 }}
            />
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
        {pendingCount > 0 && (
          <div style={{ marginTop: '0.6rem' }}>
            <button className="btn" type="button" onClick={() => void bulkValidatePending()} disabled={busyId === 'bulk'}>
              {busyId === 'bulk' ? 'Convalida in corso…' : `✓ Convalida rapida (${filtered.filter((s) => s.status === 'pending' && (s.declared_class ?? '').trim()).length})`}
            </button>
            <span className="muted" style={{ fontSize: '0.82rem', marginLeft: '0.6rem' }}>
              Approva i pending usando la classe che hanno dichiarato.
            </span>
          </div>
        )}
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
      </div>

      {filtered.length === 0 && !error && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          {students.length === 0 ? 'Nessuno studente con questi filtri.' : 'Nessuno studente corrisponde alla ricerca.'}
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
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
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
                        <button className="btn btn-secondary" type="button" style={btnSm} disabled={busyId === s.id} onClick={() => setResetTarget(s)} title="Reimposta password">🔑</button>
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

      {resetTarget && (
        <ResetPasswordModal student={resetTarget} onClose={() => setResetTarget(null)} />
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

function generatePassword(): string {
  // Password leggibile: niente caratteri ambigui (0/O, 1/l/I).
  const chars = 'abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

function ResetPasswordModal({ student, onClose }: { student: AdminStudent; onClose: () => void }) {
  const [pwd, setPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (pwd.length < 8) {
      setErr('La password deve avere almeno 8 caratteri.');
      return;
    }
    setBusy(true);
    const res = await cloudResetStudentPassword(student.id, pwd);
    setBusy(false);
    if (res.ok) setDone(true);
    else setErr(res.error ?? 'Errore.');
  };

  return (
    <div className="alert-overlay" role="dialog" aria-modal="true">
      <form className="card" style={{ maxWidth: 460, width: '100%' }} onSubmit={submit}>
        <h3 style={{ marginTop: 0 }}>🔑 Reimposta password</h3>
        <p className="muted" style={{ marginTop: 0 }}>
          <strong>{student.full_name}</strong> · {student.email}
        </p>
        {done ? (
          <>
            <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.6rem 0.8rem', borderRadius: 6, marginBottom: '0.75rem' }}>
              ✅ Password impostata. Comunicala allo studente: <strong style={{ fontFamily: 'monospace' }}>{pwd}</strong>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Gli verrà chiesto di cambiarla al primo accesso.</div>
            </div>
            <div className="actions">
              <button className="btn btn-secondary" type="button" onClick={() => void navigator.clipboard?.writeText(pwd)}>📋 Copia</button>
              <button className="btn" type="button" onClick={onClose}>Chiudi</button>
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="reset-pwd">Nuova password (min 8)</label>
              <input id="reset-pwd" type="text" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus autoComplete="off" />
            </div>
            {err && <div className="error-msg" style={{ marginBottom: '0.5rem' }}>{err}</div>}
            <div className="actions" style={{ flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setPwd(generatePassword())}>🎲 Genera</button>
              <button className="btn" type="submit" disabled={busy}>{busy ? 'Salvataggio…' : 'Imposta password'}</button>
              <button className="btn btn-secondary" type="button" onClick={onClose} style={{ marginLeft: 'auto' }}>Annulla</button>
            </div>
          </>
        )}
      </form>
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
              <ProgressView
                sessions={detail.sessions}
                subject={{
                  name: detail.student.full_name,
                  subtitle: `${detail.student.email}${detail.student.class ? ` · ${detail.student.class}` : ''}`,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
