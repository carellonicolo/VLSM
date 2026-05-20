import { VERIFICHE } from '../src/data/verifiche';

const groups: Record<string, Record<string, number>> = { verifica: {}, esercitazione: {} };
for (const v of VERIFICHE) {
  if (!groups[v.categoria][v.difficolta]) groups[v.categoria][v.difficolta] = 0;
  groups[v.categoria][v.difficolta]++;
}

console.log('=== Distribuzione per livello ===');
for (const cat of ['verifica', 'esercitazione'] as const) {
  const entries = Object.entries(groups[cat]).sort();
  const total = Object.values(groups[cat]).reduce((a, b) => a + b, 0);
  console.log(`  ${cat}: ${entries.map(([k, v]) => `${k}=${v}`).join(', ')}  [tot ${total}]`);
}
console.log('  TOTALE:', VERIFICHE.length, 'prove distinte');

const ids = VERIFICHE.map((v) => v.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
console.log('\n=== ID univoci ===');
console.log('  duplicati:', dup.length === 0 ? 'nessuno ✓' : dup);

console.log('\n=== Punti per verifica ===');
const offending = VERIFICHE.filter((v) => {
  const sum = v.esercizi.reduce((s, e) => s + e.puntiTotali, 0);
  return v.puntiTotali !== 30 || sum !== 30;
});
console.log('  verifiche con puntiTotali != 30 o somma esercizi != 30:', offending.length === 0 ? 'nessuna ✓' : offending.map((v) => v.id));

console.log('\n=== Coerenza Es.4 parteA (somma punti per livello) ===');
for (const v of VERIFICHE) {
  const es4 = v.esercizi.find((e) => e.id === 'es4');
  if (es4 && es4.tipo === 'analisi-piano') {
    const sum = es4.parteA.punti + es4.parteB.punti + es4.parteC.punti;
    if (sum !== es4.puntiTotali) {
      console.log(`  ⚠ ${v.id}: es4 parteA+B+C=${sum} ma puntiTotali=${es4.puntiTotali}`);
    }
  }
}
console.log('  tutte coerenti se nessun ⚠ sopra');
