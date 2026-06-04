import { useCallback, useEffect, useState } from 'react';
import { cloudListClasses, cloudSetClassExam, type AdminClass } from '../../lib/cloudSync';

interface Props {
  active: boolean;
}

export function ClassesTab({ active }: Props) {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const res = await cloudListClasses();
    setLoading(false);
    if (res.ok) {
      setClasses(res.classes);
      setError(null);
    } else {
      setError(res.error ?? 'Errore di rete.');
    }
  }, []);

  useEffect(() => {
    if (active) void reload();
  }, [active, reload]);

  const toggle = async (c: AdminClass) => {
    setBusy(c.class);
    const res = await cloudSetClassExam(c.class, !c.examEnabled);
    setBusy(null);
    if (res.ok) void reload();
    else alert(`Errore: ${res.error}`);
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>🎛 Classi &amp; modalità esame</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              Sblocca la verifica per una classe alla volta. Solo gli studenti <strong>convalidati</strong> di una
              classe <strong>attiva</strong> possono iniziare una verifica.
            </div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => void reload()} disabled={loading}>
            {loading ? '⏳' : '🔄'} Aggiorna
          </button>
        </div>
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
        <div className="muted" style={{ marginTop: '0.6rem', fontSize: '0.82rem' }}>
          Nota: esiste anche un interruttore generale "Modalità verifica" nella tab <strong>Impostazioni</strong>:
          se è spento, l'esame resta bloccato per tutte le classi indipendentemente da qui.
        </div>
      </div>

      {classes.length === 0 && !error && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          Nessuna classe disponibile. Le classi compaiono qui quando convalidi degli studenti assegnando loro una classe.
        </div>
      )}

      {classes.length > 0 && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="result-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Esame</th>
                  <th>Studenti convalidati</th>
                  <th>Verifiche in corso</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.class}>
                    <td><strong>{c.class}</strong></td>
                    <td>
                      <span
                        style={{
                          background: c.examEnabled ? 'var(--success-bg)' : 'var(--readonly-bg)',
                          color: c.examEnabled ? 'var(--success)' : 'var(--muted)',
                          padding: '0.15rem 0.6rem',
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {c.examEnabled ? '🟢 ATTIVO' : '⚪ Bloccato'}
                      </span>
                    </td>
                    <td>{c.nValidati} <span className="muted">/ {c.nTotali}</span></td>
                    <td>{c.nInCorso > 0 ? <span style={{ color: 'var(--warn-text)', fontWeight: 600 }}>{c.nInCorso}</span> : '0'}</td>
                    <td>
                      <button
                        className={c.examEnabled ? 'btn btn-secondary' : 'btn'}
                        type="button"
                        disabled={busy === c.class}
                        onClick={() => void toggle(c)}
                      >
                        {c.examEnabled ? 'Disattiva esame' : 'Attiva esame'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
