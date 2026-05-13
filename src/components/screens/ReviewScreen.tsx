import type { RispostaStudente, Verifica } from '../../types/domain';

interface Props {
  verifica: Verifica;
  answers: RispostaStudente;
  onConferma: () => void;
  onIndietro: () => void;
  signing?: boolean;
}

function countEmpty(values: string[]): number {
  return values.filter((v) => !v || v.trim() === '').length;
}

function summarize(verifica: Verifica, answers: RispostaStudente) {
  return verifica.esercizi.map((es) => {
    const ra = answers.esercizi[es.id];
    let vuoti = 0;
    let attese = 0;
    if (es.tipo === 'vlsm-alloc' || es.tipo === 'parametri') {
      const numColonne = es.tipo === 'vlsm-alloc' ? 6 : 5;
      const numRighe = es.tipo === 'vlsm-alloc' ? es.requisiti.length : es.righe.length;
      attese = numRighe * numColonne;
      const righe = ra?.righe ?? [];
      for (let i = 0; i < numRighe; i++) {
        const r = righe[i] ?? {};
        vuoti += countEmpty(Object.values(r).concat(new Array(numColonne - Object.keys(r).length).fill('')));
        if (Object.keys(r).length < numColonne) {
          vuoti = Math.min(vuoti + (numColonne - Object.keys(r).length), attese);
        }
      }
    } else {
      attese = es.parteA.righe.length * 4 + es.parteB.numeroRighe * 5 + 6;
      const pA = ra?.parteA ?? [];
      const pB = ra?.parteB ?? [];
      const pC = ra?.parteC ?? {};
      vuoti = attese;
      for (const r of pA) vuoti -= 4 - countEmpty(['maschera', 'primoHost', 'ultimoHost', 'broadcast'].map((k) => r[k] ?? ''));
      for (const r of pB) vuoti -= 5 - countEmpty(['cidr', 'prefisso', 'primoHost', 'ultimoHost', 'broadcast'].map((k) => r[k] ?? ''));
      vuoti -= 6 - countEmpty(['indRete', 'prefisso', 'maschera', 'primoHost', 'ultimoHost', 'broadcast'].map((k) => pC[k] ?? ''));
    }
    return { id: es.id, titolo: es.titolo, vuoti, attese };
  });
}

export function ReviewScreen({ verifica, answers, onConferma, onIndietro, signing = false }: Props) {
  const sum = summarize(verifica, answers);
  const hasVuoti = sum.some((s) => s.vuoti > 0);

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto' }}>
      <h2 style={{ marginTop: 0 }}>Riepilogo prima della consegna</h2>
      <p>Verifica che tutti i campi siano stati compilati. Una volta consegnata, la verifica non potrà essere modificata.</p>
      <ul className="review-summary">
        {sum.map((s) => (
          <li key={s.id}>
            <strong>{s.titolo}</strong>:{' '}
            {s.vuoti === 0 ? (
              <span>tutte le {s.attese} celle compilate.</span>
            ) : (
              <span className="warn">
                {s.vuoti}/{s.attese} celle ancora vuote.
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="actions">
        <button className="btn-secondary btn" type="button" onClick={onIndietro} disabled={signing}>
          Torna alla verifica
        </button>
        <button className="btn" type="button" onClick={onConferma} disabled={signing}>
          {signing ? 'Firma in corso…' : hasVuoti ? 'Consegna comunque' : 'Conferma consegna'}
        </button>
      </div>
    </div>
  );
}
