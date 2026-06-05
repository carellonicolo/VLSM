import { useCallback, useEffect, useState } from 'react';
import {
  cloudGetAdminSettings,
  cloudGetAuditLog,
  cloudSetVerificaEnabled,
  type AdminSettings,
  type AuditEntry,
} from '../../lib/cloudSync';
import { useToast } from '../ui/Toast';

interface Props { active: boolean }

export function SettingsTab({ active }: Props) {
  const toast = useToast();
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
    if (res.ok) {
      toast(settings.verificaEnabled ? 'Modalità verifica disattivata.' : 'Modalità verifica attivata.', 'success');
      void reload();
    } else {
      toast(`Errore: ${res.error}`, 'error');
    }
  };

  const loadAudit = async () => {
    setShowAudit(true);
    const res = await cloudGetAuditLog();
    if (res.ok) setAuditEntries(res.entries);
    else toast(`Errore: ${res.error}`, 'error');
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
      {/* Toggle modalità verifica (master globale) */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>🟢 Modalità verifica (master)</h3>
        <p className="muted">
          Interruttore generale: quando è <strong>disattivato</strong>, la verifica è bloccata per
          <strong> tutte le classi</strong>. Per sbloccare l'esame a una singola classe usa la tab
          <strong> «🎛 Classi &amp; esame»</strong>. Le esercitazioni restano sempre disponibili agli
          studenti loggati.
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
