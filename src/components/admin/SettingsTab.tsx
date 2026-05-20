import { useCallback, useEffect, useState } from 'react';
import {
  cloudChangeStudentPassword,
  cloudGetAdminSettings,
  cloudGetAuditLog,
  cloudSetVerificaEnabled,
  type AdminSettings,
  type AuditEntry,
} from '../../lib/cloudSync';

interface Props { active: boolean }

export function SettingsTab({ active }: Props) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [newPwdConfirm, setNewPwdConfirm] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await cloudGetAdminSettings();
    setLoading(false);
    if (res.ok && res.settings) {
      setSettings(res.settings);
      setError(null);
    } else {
      setError(res.error ?? 'Errore di rete.');
    }
  }, []);

  useEffect(() => {
    if (active) void reload();
  }, [active, reload]);

  const onToggleVerifica = async () => {
    if (!settings) return;
    setBusy(true);
    const res = await cloudSetVerificaEnabled(!settings.verificaEnabled);
    setBusy(false);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd.length < 4) {
      setPwdMsg({ type: 'err', text: 'La password deve essere lunga almeno 4 caratteri.' });
      return;
    }
    if (newPwd !== newPwdConfirm) {
      setPwdMsg({ type: 'err', text: 'Le due password non corrispondono.' });
      return;
    }
    if (!confirm(`Confermi la nuova password? Le sessioni in corso potranno usare la vecchia per 60 minuti, i nuovi login richiederanno subito la nuova.`)) return;
    setBusy(true);
    const res = await cloudChangeStudentPassword(newPwd);
    setBusy(false);
    if (res.ok) {
      setPwdMsg({ type: 'ok', text: 'Password aggiornata. Grace period di 60 minuti attivo per le sessioni in corso.' });
      setNewPwd('');
      setNewPwdConfirm('');
      void reload();
    } else {
      setPwdMsg({ type: 'err', text: res.error ?? 'Errore.' });
    }
  };

  const loadAudit = async () => {
    setShowAudit(true);
    const res = await cloudGetAuditLog();
    if (res.ok) setAuditEntries(res.entries);
    else alert(`Errore: ${res.error}`);
  };

  if (loading && !settings) {
    return <div className="card muted">⏳ Caricamento impostazioni…</div>;
  }

  if (error) {
    return (
      <div className="card" style={{ background: 'var(--error-bg)', borderColor: 'var(--error)' }}>
        <strong>⚠ Errore:</strong> {error}
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          Verifica che il binding D1 sia configurato e che la migrazione <code>0002_settings.sql</code> sia stata applicata.
        </div>
        <button className="btn btn-secondary" type="button" onClick={() => void reload()} style={{ marginTop: '0.75rem' }}>
          Riprova
        </button>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <>
      {/* Toggle modalità verifica */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🟢 Modalità verifica</h3>
        <p className="muted">
          Quando disattivata, gli studenti vedono la sezione "Svolgi la verifica" disabilitata sulla
          schermata di login. Le esercitazioni libere e l'accesso docente restano sempre attivi.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 999,
              background: settings.verificaEnabled ? 'var(--success-bg)' : 'var(--warn-bg)',
              color: settings.verificaEnabled ? 'var(--success)' : 'var(--warn-text)',
              fontWeight: 700,
            }}
          >
            {settings.verificaEnabled ? '✅ ATTIVA' : '⛔ DISATTIVATA'}
          </div>
          <button
            className={settings.verificaEnabled ? 'btn-secondary btn' : 'btn'}
            type="button"
            onClick={onToggleVerifica}
            disabled={busy}
          >
            {settings.verificaEnabled ? 'Disattiva modalità verifica' : 'Attiva modalità verifica'}
          </button>
        </div>
      </div>

      {/* Cambio password studente */}
      <form className="card" onSubmit={onChangePassword}>
        <h3 style={{ marginTop: 0 }}>🔑 Password studente</h3>
        <p className="muted">
          {settings.studentPasswordSet ? (
            <>Una password personalizzata è attiva dal {new Date(settings.studentPasswordChangedAt).toLocaleString('it-IT')}.</>
          ) : (
            <>Nessuna password personalizzata: viene usata la variabile d'ambiente <code>VITE_APP_PASSWORD</code> / <code>APP_PASSWORD</code>.</>
          )}
        </p>
        {settings.gracePeriodValid && (
          <div
            style={{
              background: 'var(--warn-bg)',
              color: 'var(--warn-text)',
              border: '1px solid var(--warn-border)',
              padding: '0.5rem 0.75rem',
              borderRadius: 6,
              marginBottom: '0.75rem',
              fontSize: '0.88rem',
            }}
          >
            ⏳ Grace period attivo fino alle{' '}
            <strong>{new Date(settings.gracePeriodEndsAt).toLocaleTimeString('it-IT')}</strong>:
            le sessioni iniziate prima dell'ultimo cambio password possono ancora sincronizzare con la
            vecchia password.
          </div>
        )}
        <div className="field">
          <label htmlFor="new-pwd">Nuova password</label>
          <input
            id="new-pwd"
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
          />
        </div>
        <div className="field">
          <label htmlFor="new-pwd-confirm">Conferma nuova password</label>
          <input
            id="new-pwd-confirm"
            type="password"
            value={newPwdConfirm}
            onChange={(e) => setNewPwdConfirm(e.target.value)}
            autoComplete="new-password"
            disabled={busy}
          />
        </div>
        {pwdMsg && (
          <div
            className={pwdMsg.type === 'ok' ? 'muted' : 'error-msg'}
            style={
              pwdMsg.type === 'ok'
                ? { background: 'var(--success-bg)', color: 'var(--success)', padding: '0.5rem 0.75rem', borderRadius: 6, marginBottom: '0.75rem' }
                : { marginBottom: '0.75rem' }
            }
          >
            {pwdMsg.text}
          </div>
        )}
        <button className="btn" type="submit" disabled={busy || newPwd.length === 0}>
          Cambia password studente
        </button>
      </form>

      {/* Audit log */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>📜 Storico modifiche</h3>
        {!showAudit ? (
          <button className="btn btn-secondary" type="button" onClick={loadAudit}>
            Mostra cronologia
          </button>
        ) : (
          <>
            <button className="btn btn-secondary" type="button" onClick={loadAudit} style={{ marginBottom: '0.75rem' }}>
              🔄 Aggiorna
            </button>
            {auditEntries.length === 0 ? (
              <p className="muted">Nessuna modifica registrata.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="result-table">
                  <thead>
                    <tr>
                      <th>Quando</th>
                      <th>Chiave</th>
                      <th>Azione</th>
                      <th>Da</th>
                      <th>A</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((a) => (
                      <tr key={a.id}>
                        <td>{new Date(a.updated_at).toLocaleString('it-IT')}</td>
                        <td><code>{a.key}</code></td>
                        <td>{a.action}</td>
                        <td>{a.old_value ?? '—'}</td>
                        <td>{a.new_value ?? '—'}</td>
                        <td>{a.updated_by_ip ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
