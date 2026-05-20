import type { EsercizioVlsmAlloc, RispostaEsercizio, RispostaRiga } from '../../types/domain';

interface Props {
  esercizio: EsercizioVlsmAlloc;
  risposta?: RispostaEsercizio;
  onChange: (rowIndex: number, riga: RispostaRiga) => void;
}

const COLS: { key: string; label: string }[] = [
  { key: 'indRete', label: 'Ind. di rete' },
  { key: 'prefisso', label: 'Prefisso' },
  { key: 'maschera', label: 'Maschera' },
  { key: 'primoHost', label: 'Primo host' },
  { key: 'ultimoHost', label: 'Ultimo host' },
  { key: 'broadcast', label: 'Broadcast' },
];

export function EsercizioVlsmAllocView({ esercizio, risposta, onChange }: Props) {
  const righe = risposta?.righe ?? [];
  return (
    <div className="exercise">
      <h3>{esercizio.titolo} <span className="diff-bar">{esercizio.puntiTotali} pt</span></h3>
      <div className="exercise-consegna">
        {esercizio.consegna}
        <br />
        <strong>Rete madre:</strong> <code>{esercizio.reteMadre}</code>
      </div>

      <table className="requisiti-table">
        <thead>
          <tr>
            <th>Sottorete</th>
            <th>Host richiesti</th>
          </tr>
        </thead>
        <tbody>
          {esercizio.requisiti.map((r) => (
            <tr key={r.nome}>
              <td>{r.nome}</td>
              <td>{r.host}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="alloc-table">
        <thead>
          <tr>
            <th>Sottorete</th>
            {COLS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {esercizio.requisiti.map((req, i) => (
            <tr key={req.nome}>
              <td className="readonly">{req.nome}</td>
              {COLS.map((c) => (
                <td key={c.key}>
                  <input
                    type="text"
                    value={righe[i]?.[c.key] ?? ''}
                    onChange={(e) => onChange(i, { [c.key]: e.target.value })}
                    autoComplete="off"
                    placeholder="..."
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
