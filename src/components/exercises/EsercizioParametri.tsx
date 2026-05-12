import type { EsercizioParametri, RispostaEsercizio, RispostaRiga } from '../../types/domain';

interface Props {
  esercizio: EsercizioParametri;
  risposta?: RispostaEsercizio;
  onChange: (rowIndex: number, riga: RispostaRiga) => void;
}

const COLS: { key: string; label: string }[] = [
  { key: 'indRete', label: 'Ind. di rete' },
  { key: 'maschera', label: 'Maschera decimale' },
  { key: 'primoHost', label: 'Primo host' },
  { key: 'ultimoHost', label: 'Ultimo host' },
  { key: 'broadcast', label: 'Broadcast' },
];

export function EsercizioParametriView({ esercizio, risposta, onChange }: Props) {
  const righe = risposta?.righe ?? [];
  return (
    <div className="exercise">
      <h3>
        {esercizio.titolo} <span className="diff-bar">{esercizio.puntiTotali} pt</span>
      </h3>
      <div className="exercise-consegna">{esercizio.consegna}</div>
      <table className="alloc-table">
        <thead>
          <tr>
            <th>Ind. host / prefisso</th>
            {COLS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {esercizio.righe.map((r, i) => (
            <tr key={r.rowKey}>
              <td className="readonly">{r.ipPrefisso ?? `${r.indRete}/${r.prefisso}`}</td>
              {COLS.map((c) => (
                <td key={c.key}>
                  <input
                    type="text"
                    value={righe[i]?.[c.key] ?? ''}
                    onChange={(e) => onChange(i, { [c.key]: e.target.value })}
                    autoComplete="off"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
