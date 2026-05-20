import type { EsercizioAnalisiPiano, RispostaEsercizio, RispostaRiga } from '../../types/domain';

interface Props {
  esercizio: EsercizioAnalisiPiano;
  risposta?: RispostaEsercizio;
  onChangeParteA: (rowIndex: number, riga: RispostaRiga) => void;
  onChangeParteB: (rowIndex: number, riga: RispostaRiga) => void;
  onChangeParteC: (riga: RispostaRiga) => void;
}

const COLS_A: { key: string; label: string }[] = [
  { key: 'maschera', label: 'Maschera' },
  { key: 'primoHost', label: 'Primo host' },
  { key: 'ultimoHost', label: 'Ultimo host' },
  { key: 'broadcast', label: 'Broadcast' },
];

const COLS_B: { key: string; label: string }[] = [
  { key: 'cidr', label: 'Ind. di rete (CIDR)' },
  { key: 'prefisso', label: 'Prefisso' },
  { key: 'primoHost', label: 'Primo host' },
  { key: 'ultimoHost', label: 'Ultimo host' },
  { key: 'broadcast', label: 'Broadcast' },
];

const COLS_C: { key: string; label: string }[] = [
  { key: 'indRete', label: 'Ind. di rete' },
  { key: 'prefisso', label: 'Prefisso' },
  { key: 'maschera', label: 'Maschera' },
  { key: 'primoHost', label: 'Primo host' },
  { key: 'ultimoHost', label: 'Ultimo host' },
  { key: 'broadcast', label: 'Broadcast' },
];

export function EsercizioAnalisiPianoView({
  esercizio,
  risposta,
  onChangeParteA,
  onChangeParteB,
  onChangeParteC,
}: Props) {
  const parteA = risposta?.parteA ?? [];
  const parteB = risposta?.parteB ?? [];
  const parteC = risposta?.parteC ?? {};

  return (
    <div className="exercise">
      <h3>
        {esercizio.titolo} <span className="diff-bar">{esercizio.puntiTotali} pt</span>
      </h3>
      <div className="exercise-consegna">
        {esercizio.consegna}
        <br />
        <strong>Blocco padre:</strong> <code>{esercizio.bloccoPadre}</code>
      </div>

      <h4>a) Completare parametri ({esercizio.parteA.punti} pt)</h4>
      <table className="alloc-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ind. di rete</th>
            <th>Prefisso</th>
            {COLS_A.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {esercizio.parteA.righe.map((r, i) => (
            <tr key={r.rowKey}>
              <td className="readonly">{r.rowKey}</td>
              <td className="readonly">{r.indRete}</td>
              <td className="readonly">/{r.prefisso}</td>
              {COLS_A.map((c) => (
                <td key={c.key}>
                  <input
                    type="text"
                    value={parteA[i]?.[c.key] ?? ''}
                    onChange={(e) => onChangeParteA(i, { [c.key]: e.target.value })}
                    autoComplete="off"
                    placeholder="..."
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h4>b) Blocchi non allocati ({esercizio.parteB.punti} pt)</h4>
      <p className="muted">Indicare i blocchi residui in qualsiasi ordine.</p>
      <table className="alloc-table">
        <thead>
          <tr>
            {COLS_B.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: esercizio.parteB.numeroRighe }, (_, i) => (
            <tr key={i}>
              {COLS_B.map((c) => (
                <td key={c.key}>
                  <input
                    type="text"
                    value={parteB[i]?.[c.key] ?? ''}
                    onChange={(e) => onChangeParteB(i, { [c.key]: e.target.value })}
                    autoComplete="off"
                    placeholder="..."
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <h4>
        c) Nuova sottorete per {esercizio.parteC.hostRichiesti} host ({esercizio.parteC.punti} pt)
      </h4>
      <p className="muted">
        Scegliere uno dei blocchi residui e indicare la sottorete con la capacità minima sufficiente.
      </p>
      <table className="alloc-table">
        <thead>
          <tr>
            {COLS_C.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {COLS_C.map((c) => (
              <td key={c.key}>
                <input
                  type="text"
                  value={parteC[c.key] ?? ''}
                  onChange={(e) => onChangeParteC({ [c.key]: e.target.value })}
                  autoComplete="off"
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
