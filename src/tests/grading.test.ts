import { describe, it, expect } from 'vitest';
import { gradeVerifica } from '../lib/grading';
import { VERIFICHE } from '../data/verifiche';
import type { RispostaStudente } from '../types/domain';
import {
  allocateVlsm,
  parseCidr,
  formatIp,
  formatMask,
  firstHost,
  lastHost,
  broadcastAddress,
  networkAddress,
  parseIp,
  findResidualBlocks,
} from '../lib/vlsm';

describe('parteB.numeroRighe matches actual residual count', () => {
  for (const v of VERIFICHE) {
    for (const es of v.esercizi) {
      if (es.tipo === 'analisi-piano') {
        it(`${v.id}/${es.id}: numeroRighe coerente con findResidualBlocks`, () => {
          const parent = parseCidr(es.bloccoPadre);
          const allocated = es.parteA.righe.map((r) => ({
            net: networkAddress(parseIp(r.indRete), r.prefisso),
            prefix: r.prefisso,
          }));
          const residui = findResidualBlocks({ net: parent.ip, prefix: parent.prefix }, allocated);
          expect(es.parteB.numeroRighe).toBe(residui.length);
        });
      }
    }
  }
});

function buildPerfectAnswers(verificaId: string): RispostaStudente {
  const v = VERIFICHE.find((x) => x.id === verificaId)!;
  const esercizi: RispostaStudente['esercizi'] = {};
  for (const es of v.esercizi) {
    if (es.tipo === 'vlsm-alloc') {
      const parent = parseCidr(es.reteMadre);
      const allocs = allocateVlsm(parent, es.requisiti);
      esercizi[es.id] = {
        esercizioId: es.id,
        righe: allocs.map((a) => ({
          indRete: formatIp(a.net),
          prefisso: String(a.prefix),
          maschera: formatMask(a.prefix),
          primoHost: formatIp(firstHost(a.net, a.prefix)),
          ultimoHost: formatIp(lastHost(a.net, a.prefix)),
          broadcast: formatIp(broadcastAddress(a.net, a.prefix)),
        })),
      };
    } else if (es.tipo === 'parametri') {
      esercizi[es.id] = {
        esercizioId: es.id,
        righe: es.righe.map((r) => {
          const c = parseCidr(r.ipPrefisso!);
          const net = networkAddress(c.ip, c.prefix);
          return {
            indRete: formatIp(net),
            maschera: formatMask(c.prefix),
            primoHost: formatIp(firstHost(net, c.prefix)),
            ultimoHost: formatIp(lastHost(net, c.prefix)),
            broadcast: formatIp(broadcastAddress(net, c.prefix)),
          };
        }),
      };
    } else if (es.tipo === 'analisi-piano') {
      const parteA = es.parteA.righe.map((r) => {
        const net = networkAddress(parseIp(r.indRete), r.prefisso);
        return {
          maschera: formatMask(r.prefisso),
          primoHost: formatIp(firstHost(net, r.prefisso)),
          ultimoHost: formatIp(lastHost(net, r.prefisso)),
          broadcast: formatIp(broadcastAddress(net, r.prefisso)),
        };
      });
      const parent = parseCidr(es.bloccoPadre);
      const allocated = es.parteA.righe.map((r) => ({
        net: networkAddress(parseIp(r.indRete), r.prefisso),
        prefix: r.prefisso,
      }));
      const residui = findResidualBlocks({ net: parent.ip, prefix: parent.prefix }, allocated);
      const parteB = residui.map((b) => ({
        cidr: `${formatIp(b.net)}/${b.prefix}`,
        prefisso: String(b.prefix),
        primoHost: formatIp(firstHost(b.net, b.prefix)),
        ultimoHost: formatIp(lastHost(b.net, b.prefix)),
        broadcast: formatIp(broadcastAddress(b.net, b.prefix)),
      }));
      // parteC: scegli il blocco residuo più piccolo sufficiente
      let chosen = residui[0];
      for (const b of residui) {
        const cap = Math.pow(2, 32 - b.prefix) - 2;
        const curCap = Math.pow(2, 32 - chosen.prefix) - 2;
        if (cap >= es.parteC.hostRichiesti && (curCap < es.parteC.hostRichiesti || cap < curCap)) {
          chosen = b;
        }
      }
      // Aggiusta prefix per essere il minimo che contiene gli host richiesti, allineato al residuo
      let chosenPrefix = chosen.prefix;
      const minHosts = es.parteC.hostRichiesti;
      while (chosenPrefix < 30) {
        const nextSize = Math.pow(2, 32 - (chosenPrefix + 1)) - 2;
        if (nextSize >= minHosts) chosenPrefix++;
        else break;
      }
      const parteC = {
        indRete: formatIp(chosen.net),
        prefisso: String(chosenPrefix),
        maschera: formatMask(chosenPrefix),
        primoHost: formatIp(firstHost(chosen.net, chosenPrefix)),
        ultimoHost: formatIp(lastHost(chosen.net, chosenPrefix)),
        broadcast: formatIp(broadcastAddress(chosen.net, chosenPrefix)),
      };
      esercizi[es.id] = { esercizioId: es.id, parteA, parteB, parteC };
    }
  }
  return { verificaId: v.id as RispostaStudente['verificaId'], esercizi };
}

describe('gradeVerifica — risposte perfette', () => {
  for (const v of VERIFICHE) {
    it(`${v.id}: ${v.titolo} → 30/30`, () => {
      const answers = buildPerfectAnswers(v.id);
      const esito = gradeVerifica(v, answers, { nome: 'Test', classe: '5A' }, 'volontaria');
      expect(esito.voto30).toBe(30);
    });
  }
});

describe('gradeVerifica — risposte vuote → 0/30', () => {
  for (const v of VERIFICHE) {
    it(`${v.id}: 0/30`, () => {
      const esito = gradeVerifica(
        v,
        { verificaId: v.id, esercizi: {} },
        { nome: 'Test', classe: '5A' },
        'volontaria'
      );
      expect(esito.voto30).toBe(0);
    });
  }
});

describe('gradeVerifica — verifica 1, errore su una riga di Es.1', () => {
  it('una cella sbagliata in Es.1 → -2 punti', () => {
    const v = VERIFICHE[0];
    const ans = buildPerfectAnswers('v1');
    // rovino la prima riga di Es.1 (LAN_A): mask sbagliata
    ans.esercizi.es1.righe![0].maschera = '255.255.255.0';
    const esito = gradeVerifica(v, ans, { nome: 'Test', classe: '5A' }, 'volontaria');
    expect(esito.voto30).toBe(28);
  });
});

describe('gradeVerifica — Es.4b matching insensibile all\'ordine', () => {
  it('ordine invertito → punteggio pieno', () => {
    const v = VERIFICHE[0];
    const ans = buildPerfectAnswers('v1');
    const pb = ans.esercizi.es4.parteB!;
    ans.esercizi.es4.parteB = [...pb].reverse();
    const esito = gradeVerifica(v, ans, { nome: 'Test', classe: '5A' }, 'volontaria');
    expect(esito.voto30).toBe(30);
  });
});

describe('gradeVerifica — Es.4c blocco non valido', () => {
  it('blocco fuori dai residui → -1 punto', () => {
    const v = VERIFICHE[0];
    const ans = buildPerfectAnswers('v1');
    // verifica 1: residui sono 10.4.1.192/26, 10.4.5.0/24, 10.4.6.0/23
    // metto un indirizzo fuori da tutti i residui
    ans.esercizi.es4.parteC = {
      indRete: '10.4.0.0',
      prefisso: '27',
      maschera: '255.255.255.224',
      primoHost: '10.4.0.1',
      ultimoHost: '10.4.0.30',
      broadcast: '10.4.0.31',
    };
    const esito = gradeVerifica(v, ans, { nome: 'Test', classe: '5A' }, 'volontaria');
    expect(esito.voto30).toBe(29);
  });
});

describe('normalizzazione input', () => {
  it('prefisso accetta sia "/26" che "26"', () => {
    const v = VERIFICHE[0];
    const ans = buildPerfectAnswers('v1');
    ans.esercizi.es1.righe![0].prefisso = '/26';
    const esito1 = gradeVerifica(v, ans, { nome: 'T', classe: '5A' }, 'volontaria');
    expect(esito1.voto30).toBe(30);
    ans.esercizi.es1.righe![0].prefisso = '26';
    const esito2 = gradeVerifica(v, ans, { nome: 'T', classe: '5A' }, 'volontaria');
    expect(esito2.voto30).toBe(30);
  });
});
