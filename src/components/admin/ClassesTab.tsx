import { useCallback, useEffect, useState } from 'react';
import { cloudListClasses, cloudSetClassExam, type AdminClass } from '../../lib/cloudSync';
import { useToast } from '../ui/Toast';

interface Props {
  active: boolean;
}

const LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'random', label: '🎲 Casuale' },
  { value: 'Base', label: 'Base' },
  { value: 'Media', label: 'Media' },
  { value: 'Alta', label: 'Alta' },
  { value: 'Esperta', label: 'Esperta' },
  { value: 'student', label: 'Scelta studente' },
];

function levelLabel(level: string | null): string {
  const v = level ?? 'random';
  return LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;
}

export function ClassesTab({ active }: Props) {
  const toast = useToast();
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [levels, setLevels] = useState<Record<string, string>>({});
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

  const levelFor = (c: AdminClass) => levels[c.class] ?? c.examLevel ?? 'random';

  const apply = async (c: AdminClass, enabled: boolean, level: string) => {
    setBusy(c.class);
    const res = await cloudSetClassExam(c.class, enabled, level);
    setBusy(null);
    if (res.ok) {
      toast(enabled ? `Esame attivato per ${c.class} (${levelLabel(level)}).` : `Esame disattivato per ${c.class}.`, 'success');
      void reload();
    } else {
      toast(`Errore: ${res.error}`, 'error');
    }
  };

  const onChangeLevel = (c: AdminClass, level: string) => {
    setLevels((m) => ({ ...m, [c.class]: level }));
    // Se l'esame è già attivo, applica subito il nuovo livello.
    if (c.examEnabled) void apply(c, true, level);
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ marginTop: 0, marginBottom: '0.25rem' }}>🎛 Classi &amp; modalità esame</h3>
            <div className="muted" style={{ fontSize: '0.85rem' }}>
              Sblocca la verifica per una classe alla volta e scegli il <strong>livello</strong>. Possono
              iniziare solo gli studenti <strong>attivi con classe approvata</strong> (sull'IdP) di una
              classe <strong>attiva</strong> qui. L'elenco classi è dinamico dal DB.
            </div>
          </div>
          <button className="btn btn-secondary" type="button" onClick={() => void reload()} disabled={loading}>
            {loading ? '⏳' : '🔄'} Aggiorna
          </button>
        </div>
        {error && <div className="error-msg" style={{ marginTop: '0.75rem' }}>{error}</div>}
        <div className="muted" style={{ marginTop: '0.6rem', fontSize: '0.82rem' }}>
          Livello: <strong>Casuale</strong> sorteggia un livello per ogni studente; un livello fisso assegna
          quello a tutta la classe; <strong>Scelta studente</strong> lascia scegliere allo studente.
          Nota: esiste anche l'interruttore generale «Modalità verifica» in <strong>Impostazioni</strong>:
          se è spento, l'esame resta bloccato ovunque.
        </div>
      </div>

      {classes.length === 0 && !error && (
        <div className="card muted" style={{ textAlign: 'center' }}>
          Nessuna classe disponibile. Le classi compaiono qui automaticamente quando gli studenti
          accedono con una <strong>classe approvata</strong> sull'IdP (auth.nicolocarello.it).
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
                  <th>Livello</th>
                  <th>Convalidati</th>
                  <th>In corso</th>
                  <th>Azione</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => {
                  const lvl = levelFor(c);
                  return (
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
                      <td>
                        <select
                          value={lvl}
                          onChange={(e) => onChangeLevel(c, e.target.value)}
                          disabled={busy === c.class}
                          style={{ width: 'auto', minWidth: 130 }}
                        >
                          {LEVEL_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td>{c.nValidati} <span className="muted">/ {c.nTotali}</span></td>
                      <td>{c.nInCorso > 0 ? <span style={{ color: 'var(--warn-text)', fontWeight: 600 }}>{c.nInCorso}</span> : '0'}</td>
                      <td>
                        <button
                          className={c.examEnabled ? 'btn btn-secondary' : 'btn'}
                          type="button"
                          disabled={busy === c.class}
                          onClick={() => void apply(c, !c.examEnabled, lvl)}
                        >
                          {c.examEnabled ? 'Disattiva esame' : 'Attiva esame'}
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
    </>
  );
}
