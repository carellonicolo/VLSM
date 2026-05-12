import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { VERIFICHE } from '../src/data/verifiche';
import type { Verifica } from '../src/types/domain';

const HEADER = (categoria: Verifica['categoria']) => `---
**ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026**

---
# ${categoria === 'esercitazione' ? 'SIMULAZIONE VLSM — ESERCITAZIONE LIBERA' : 'VERIFICA SCRITTA — VLSM'} *(30 punti)*

| Alunno/a | Classe | Data |
|----------|--------|------|
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |

---
`;

const FOOTER = `\n---\n*Nicolò Carello — info@nicolocarello.it*\n`;

function emptyRow(cols: number): string {
  return '|' + ' |'.repeat(cols);
}

function renderVerifica(v: Verifica): string {
  let out = HEADER(v.categoria);
  for (const es of v.esercizi) {
    if (es.tipo === 'vlsm-alloc') {
      const ppr = es.puntiPerRiga;
      const pprLabel = Number.isInteger(ppr) ? `${ppr} pt per sottorete` : `${es.puntiTotali} punti totali`;
      out += `\n## ${es.titolo} *(${es.puntiTotali} punti — ${pprLabel})*\n\n`;
      out += `${es.consegna}\nOrdinare le sottoreti dalla più grande alla più piccola e completare la tabella di allocazione.\n\n`;
      out += `**Requisiti:**\n\n| Sottorete | Host richiesti |\n|-----------|---------------|\n`;
      for (const r of es.requisiti) out += `| ${r.nome} | ${r.host} |\n`;
      out += `\n**Tabella di allocazione:**\n\n| Sottorete | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |\n|-----------|-------------|----------|----------|------------|-------------|-----------|\n`;
      for (const r of es.requisiti) out += `| ${r.nome} | | | | | | |\n`;
      out += `\n---\n`;
    } else if (es.tipo === 'parametri') {
      out += `\n## ${es.titolo} *(${es.puntiTotali} punti — ${es.puntiPerRiga} pt per riga)*\n\n`;
      out += `${es.consegna}\n\n`;
      out += `| Ind. host / prefisso | Ind. di rete | Maschera decimale | Primo host | Ultimo host | Broadcast |\n|----------------------|-------------|-------------------|------------|-------------|-----------|\n`;
      for (const r of es.righe) out += `| \`${r.ipPrefisso ?? `${r.indRete}/${r.prefisso}`}\` | | | | | |\n`;
      out += `\n---\n`;
    } else {
      out += `\n## ${es.titolo} *(${es.puntiTotali} punti)*\n\n`;
      out += `${es.consegna}\n\n`;
      out += `### a) *(${es.parteA.punti} pt)* — Completare la tabella con maschera, primo host, ultimo host e broadcast.\n\n`;
      out += `| ID | Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |\n|----|-------------|----------|----------|------------|-------------|-----------|\n`;
      for (const r of es.parteA.righe) out += `| ${r.rowKey} | ${r.indRete} | /${r.prefisso} | | | | |\n`;
      out += `\n### b) *(${es.parteB.punti} pt)* — Identificare i blocchi non allocati nel blocco \`${es.bloccoPadre}\` ed esprimerli in notazione CIDR.\n\n`;
      out += `| Ind. di rete (CIDR) | Prefisso | Primo host | Ultimo host | Broadcast |\n|---------------------|----------|------------|-------------|-----------|\n`;
      for (let i = 0; i < es.parteB.numeroRighe; i++) out += `${emptyRow(5)}\n`;
      out += `\n### c) *(${es.parteC.punti} pt)* — È richiesta una nuova sottorete per **${es.parteC.hostRichiesti.toLocaleString('it-IT')} host**. Scegliere il blocco residuo più adatto e compilare la riga seguente.\n\n`;
      out += `| Ind. di rete | Prefisso | Maschera | Primo host | Ultimo host | Broadcast |\n|-------------|----------|----------|------------|-------------|-----------|\n${emptyRow(6)}\n`;
      out += `\n---\n`;
    }
  }
  out += FOOTER;
  return out;
}

function pathFor(v: Verifica): string {
  const tipoDir = v.categoria === 'esercitazione' ? 'esercitazioni' : 'verifiche';
  const livelloDir = v.difficolta.toLowerCase();
  const num = v.id.replace(/^[vs]/, '');
  const filename = v.categoria === 'esercitazione' ? `simulazione_vlsm_${num}.md` : `verifica_vlsm_${num}.md`;
  return join('docs', tipoDir, livelloDir, filename);
}

for (const v of VERIFICHE) {
  const path = pathFor(v);
  mkdirSync(join('docs', v.categoria === 'esercitazione' ? 'esercitazioni' : 'verifiche', v.difficolta.toLowerCase()), { recursive: true });
  writeFileSync(path, renderVerifica(v), 'utf-8');
  console.log(`Written: ${path}`);
}
