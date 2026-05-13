import type {
  DatiStudente,
  Esercizio,
  EsercizioAnalisiPiano,
  EsercizioParametri,
  EsercizioVlsmAlloc,
  EsitoCella,
  EsitoEsercizio,
  EsitoFinale,
  EsitoRiga,
  MotivoConsegna,
  RispostaEsercizio,
  RispostaRiga,
  RispostaStudente,
  Verifica,
} from '../types/domain';
import {
  allocateVlsm,
  blockContains,
  broadcastAddress,
  findResidualBlocks,
  firstHost,
  formatIp,
  formatMask,
  hostsCount,
  isAligned,
  lastHost,
  networkAddress,
  parseCidr,
  parseIp,
} from './vlsm';
import { compareIp, comparePrefix, compareMask, isEmpty, normalizeIp, normalizePrefix } from './normalize';

export const COLONNE_VLSM = ['indRete', 'prefisso', 'maschera', 'primoHost', 'ultimoHost', 'broadcast'] as const;
export const ETICHETTE_VLSM: Record<string, string> = {
  indRete: 'Ind. di rete',
  prefisso: 'Prefisso',
  maschera: 'Maschera',
  primoHost: 'Primo host',
  ultimoHost: 'Ultimo host',
  broadcast: 'Broadcast',
};

export const COLONNE_PARAMETRI = ['indRete', 'maschera', 'primoHost', 'ultimoHost', 'broadcast'] as const;
export const ETICHETTE_PARAMETRI: Record<string, string> = {
  indRete: 'Ind. di rete',
  maschera: 'Maschera decimale',
  primoHost: 'Primo host',
  ultimoHost: 'Ultimo host',
  broadcast: 'Broadcast',
};

export const COLONNE_RESIDUI = ['cidr', 'prefisso', 'primoHost', 'ultimoHost', 'broadcast'] as const;
export const ETICHETTE_RESIDUI: Record<string, string> = {
  cidr: 'Ind. di rete (CIDR)',
  prefisso: 'Prefisso',
  primoHost: 'Primo host',
  ultimoHost: 'Ultimo host',
  broadcast: 'Broadcast',
};

interface RigaAttesa {
  rowKey: string;
  attesi: Record<string, string>;
}

function buildCella(studente: string, atteso: string, corretta: boolean): EsitoCella {
  return {
    valoreStudente: studente ?? '',
    valoreAtteso: atteso,
    stato: isEmpty(studente) ? 'vuoto' : corretta ? 'corretto' : 'errato',
  };
}

function gradeRowVlsm(risposta: RispostaRiga | undefined, attesi: RigaAttesa, puntiPerRiga: number): EsitoRiga {
  const r = risposta ?? {};
  const celle: Record<string, EsitoCella> = {};
  celle.indRete = buildCella(r.indRete ?? '', attesi.attesi.indRete, compareIp(r.indRete ?? '', attesi.attesi.indRete));
  celle.prefisso = buildCella(
    r.prefisso ?? '',
    attesi.attesi.prefisso,
    comparePrefix(r.prefisso ?? '', Number(attesi.attesi.prefisso))
  );
  celle.maschera = buildCella(
    r.maschera ?? '',
    attesi.attesi.maschera,
    compareMask(r.maschera ?? '', Number(attesi.attesi.prefisso))
  );
  celle.primoHost = buildCella(
    r.primoHost ?? '',
    attesi.attesi.primoHost,
    compareIp(r.primoHost ?? '', attesi.attesi.primoHost)
  );
  celle.ultimoHost = buildCella(
    r.ultimoHost ?? '',
    attesi.attesi.ultimoHost,
    compareIp(r.ultimoHost ?? '', attesi.attesi.ultimoHost)
  );
  celle.broadcast = buildCella(
    r.broadcast ?? '',
    attesi.attesi.broadcast,
    compareIp(r.broadcast ?? '', attesi.attesi.broadcast)
  );
  const allOk = Object.values(celle).every((c) => c.stato === 'corretto');
  return {
    rowKey: attesi.rowKey,
    celle,
    punteggio: allOk ? puntiPerRiga : 0,
    puntiMax: puntiPerRiga,
  };
}

function gradeRowParametri(risposta: RispostaRiga | undefined, attesi: RigaAttesa, puntiPerRiga: number): EsitoRiga {
  const r = risposta ?? {};
  const celle: Record<string, EsitoCella> = {};
  celle.indRete = buildCella(r.indRete ?? '', attesi.attesi.indRete, compareIp(r.indRete ?? '', attesi.attesi.indRete));
  celle.maschera = buildCella(
    r.maschera ?? '',
    attesi.attesi.maschera,
    compareMask(r.maschera ?? '', Number(attesi.attesi.prefisso))
  );
  celle.primoHost = buildCella(
    r.primoHost ?? '',
    attesi.attesi.primoHost,
    compareIp(r.primoHost ?? '', attesi.attesi.primoHost)
  );
  celle.ultimoHost = buildCella(
    r.ultimoHost ?? '',
    attesi.attesi.ultimoHost,
    compareIp(r.ultimoHost ?? '', attesi.attesi.ultimoHost)
  );
  celle.broadcast = buildCella(
    r.broadcast ?? '',
    attesi.attesi.broadcast,
    compareIp(r.broadcast ?? '', attesi.attesi.broadcast)
  );
  const allOk = Object.values(celle).every((c) => c.stato === 'corretto');
  return {
    rowKey: attesi.rowKey,
    celle,
    punteggio: allOk ? puntiPerRiga : 0,
    puntiMax: puntiPerRiga,
  };
}

function gradeRowParametriPiano(risposta: RispostaRiga | undefined, attesi: RigaAttesa, puntiPerRiga: number): EsitoRiga {
  // In Es.4a, indRete e prefisso sono pre-popolati nella consegna: lo studente
  // compila solo maschera/primo/ultimo/broadcast. Non li valutiamo.
  const r = risposta ?? {};
  const celle: Record<string, EsitoCella> = {};
  celle.maschera = buildCella(
    r.maschera ?? '',
    attesi.attesi.maschera,
    compareMask(r.maschera ?? '', Number(attesi.attesi.prefisso))
  );
  celle.primoHost = buildCella(
    r.primoHost ?? '',
    attesi.attesi.primoHost,
    compareIp(r.primoHost ?? '', attesi.attesi.primoHost)
  );
  celle.ultimoHost = buildCella(
    r.ultimoHost ?? '',
    attesi.attesi.ultimoHost,
    compareIp(r.ultimoHost ?? '', attesi.attesi.ultimoHost)
  );
  celle.broadcast = buildCella(
    r.broadcast ?? '',
    attesi.attesi.broadcast,
    compareIp(r.broadcast ?? '', attesi.attesi.broadcast)
  );
  const allOk = Object.values(celle).every((c) => c.stato === 'corretto');
  return {
    rowKey: attesi.rowKey,
    celle,
    punteggio: allOk ? puntiPerRiga : 0,
    puntiMax: puntiPerRiga,
  };
}

function computeAllocAttesi(es: EsercizioVlsmAlloc): RigaAttesa[] {
  const parent = parseCidr(es.reteMadre);
  const allocs = allocateVlsm(parent, es.requisiti);
  return allocs.map((a) => ({
    rowKey: a.nome,
    attesi: {
      indRete: formatIp(a.net),
      prefisso: String(a.prefix),
      maschera: formatMask(a.prefix),
      primoHost: formatIp(firstHost(a.net, a.prefix)),
      ultimoHost: formatIp(lastHost(a.net, a.prefix)),
      broadcast: formatIp(broadcastAddress(a.net, a.prefix)),
    },
  }));
}

function computeParametriAttesi(es: EsercizioParametri): RigaAttesa[] {
  return es.righe.map((r) => {
    let net: number;
    let prefix: number;
    if (es.modalitaInput === 'ip-prefisso' && r.ipPrefisso) {
      const c = parseCidr(r.ipPrefisso);
      prefix = c.prefix;
      net = networkAddress(c.ip, c.prefix);
    } else if (r.indRete !== undefined && r.prefisso !== undefined) {
      prefix = r.prefisso;
      net = networkAddress(parseIp(r.indRete), prefix);
    } else {
      throw new Error(`Riga parametri non specificata: ${r.rowKey}`);
    }
    return {
      rowKey: r.rowKey,
      attesi: {
        indRete: formatIp(net),
        prefisso: String(prefix),
        maschera: formatMask(prefix),
        primoHost: formatIp(firstHost(net, prefix)),
        ultimoHost: formatIp(lastHost(net, prefix)),
        broadcast: formatIp(broadcastAddress(net, prefix)),
      },
    };
  });
}

function computeResiduiAttesi(es: EsercizioAnalisiPiano): RigaAttesa[] {
  const parent = parseCidr(es.bloccoPadre);
  const allocated = es.parteA.righe.map((r) => ({
    net: networkAddress(parseIp(r.indRete), r.prefisso),
    prefix: r.prefisso,
  }));
  const residui = findResidualBlocks({ net: parent.ip, prefix: parent.prefix }, allocated);
  return residui.map((b, i) => ({
    rowKey: `R${i + 1}`,
    attesi: {
      cidr: `${formatIp(b.net)}/${b.prefix}`,
      prefisso: String(b.prefix),
      primoHost: formatIp(firstHost(b.net, b.prefix)),
      ultimoHost: formatIp(lastHost(b.net, b.prefix)),
      broadcast: formatIp(broadcastAddress(b.net, b.prefix)),
    },
  }));
}

function gradeRowResiduo(risposta: RispostaRiga | undefined, attesi: RigaAttesa, puntiPerRiga: number): EsitoRiga {
  const r = risposta ?? {};
  const celle: Record<string, EsitoCella> = {};
  const attCidr = attesi.attesi.cidr;
  let cidrOk = false;
  if (!isEmpty(r.cidr)) {
    try {
      const c = parseCidr(r.cidr ?? '');
      const expected = parseCidr(attCidr);
      cidrOk = c.ip === expected.ip && c.prefix === expected.prefix;
    } catch {
      cidrOk = false;
    }
  }
  celle.cidr = buildCella(r.cidr ?? '', attCidr, cidrOk);
  celle.prefisso = buildCella(
    r.prefisso ?? '',
    attesi.attesi.prefisso,
    comparePrefix(r.prefisso ?? '', Number(attesi.attesi.prefisso))
  );
  celle.primoHost = buildCella(
    r.primoHost ?? '',
    attesi.attesi.primoHost,
    compareIp(r.primoHost ?? '', attesi.attesi.primoHost)
  );
  celle.ultimoHost = buildCella(
    r.ultimoHost ?? '',
    attesi.attesi.ultimoHost,
    compareIp(r.ultimoHost ?? '', attesi.attesi.ultimoHost)
  );
  celle.broadcast = buildCella(
    r.broadcast ?? '',
    attesi.attesi.broadcast,
    compareIp(r.broadcast ?? '', attesi.attesi.broadcast)
  );
  const allOk = Object.values(celle).every((c) => c.stato === 'corretto');
  return {
    rowKey: attesi.rowKey,
    celle,
    punteggio: allOk ? puntiPerRiga : 0,
    puntiMax: puntiPerRiga,
  };
}

function gradeVlsmAlloc(es: EsercizioVlsmAlloc, ra: RispostaEsercizio | undefined): EsitoEsercizio {
  const attesi = computeAllocAttesi(es);
  const ans = ra?.righe ?? [];
  const righe = attesi.map((att, i) => gradeRowVlsm(ans[i], att, es.puntiPerRiga));
  const punteggio = righe.reduce((s, r) => s + r.punteggio, 0);
  return {
    esercizioId: es.id,
    titolo: es.titolo,
    righe,
    punteggio,
    puntiMax: es.puntiTotali,
    colonne: [...COLONNE_VLSM],
  };
}

function gradeParametri(es: EsercizioParametri, ra: RispostaEsercizio | undefined): EsitoEsercizio {
  const attesi = computeParametriAttesi(es);
  const ans = ra?.righe ?? [];
  const righe = attesi.map((att, i) => gradeRowParametri(ans[i], att, es.puntiPerRiga));
  const punteggio = righe.reduce((s, r) => s + r.punteggio, 0);
  return {
    esercizioId: es.id,
    titolo: es.titolo,
    righe,
    punteggio,
    puntiMax: es.puntiTotali,
    colonne: [...COLONNE_PARAMETRI],
  };
}

function gradeAnalisiPiano(es: EsercizioAnalisiPiano, ra: RispostaEsercizio | undefined): EsitoEsercizio {
  // Parte A: come parametri
  const parent = parseCidr(es.bloccoPadre);
  const attesiA: RigaAttesa[] = es.parteA.righe.map((r) => {
    const net = networkAddress(parseIp(r.indRete), r.prefisso);
    return {
      rowKey: r.rowKey,
      attesi: {
        indRete: formatIp(net),
        prefisso: String(r.prefisso),
        maschera: formatMask(r.prefisso),
        primoHost: formatIp(firstHost(net, r.prefisso)),
        ultimoHost: formatIp(lastHost(net, r.prefisso)),
        broadcast: formatIp(broadcastAddress(net, r.prefisso)),
      },
    };
  });
  const puntiPerRigaA = es.parteA.punti / attesiA.length;
  const ansA = ra?.parteA ?? [];
  const righeA = attesiA.map((att, i) => gradeRowParametriPiano(ansA[i], att, puntiPerRigaA));

  // Parte B: residui (ordine libero)
  const attesiB = computeResiduiAttesi(es);
  const puntiPerRigaB = attesiB.length > 0 ? es.parteB.punti / attesiB.length : 0;
  const ansB = ra?.parteB ?? [];
  const usedAnswerIdx = new Set<number>();
  const righeB: EsitoRiga[] = attesiB.map((att) => {
    let matchIdx = -1;
    for (let i = 0; i < ansB.length; i++) {
      if (usedAnswerIdx.has(i)) continue;
      const candidate = gradeRowResiduo(ansB[i], att, puntiPerRigaB);
      if (candidate.punteggio === puntiPerRigaB) {
        matchIdx = i;
        usedAnswerIdx.add(i);
        return candidate;
      }
    }
    if (matchIdx === -1) {
      return gradeRowResiduo(undefined, att, puntiPerRigaB);
    }
    return gradeRowResiduo(ansB[matchIdx], att, puntiPerRigaB);
  });

  // Parte C: scelta blocco per hostRichiesti
  const residui = attesiB.map((a) => {
    const c = parseCidr(a.attesi.cidr);
    return { net: c.ip, prefix: c.prefix };
  });
  const ansC = ra?.parteC ?? {};
  const cIndRete = ansC.indRete ?? '';
  const cPrefisso = ansC.prefisso ?? '';
  let cValid = false;
  let cExpectedDisplay = '';
  let netNum = 0;
  let prefNum = 0;
  if (!isEmpty(cIndRete) && !isEmpty(cPrefisso)) {
    const ipNorm = normalizeIp(cIndRete);
    const prefNorm = normalizePrefix(cPrefisso);
    if (ipNorm !== null && prefNorm !== null) {
      netNum = parseIp(ipNorm);
      prefNum = prefNorm;
      const containedIn = residui.find((r) =>
        blockContains(r, { net: netNum, prefix: prefNum })
      );
      const aligned = isAligned(netNum, prefNum);
      const enough = hostsCount(prefNum) >= es.parteC.hostRichiesti;
      cValid = !!containedIn && aligned && enough;
    }
  }

  const expectedNetC = cValid ? formatIp(netNum) : '';
  const expectedPrefC = cValid ? String(prefNum) : '';
  cExpectedDisplay = cValid ? `${expectedNetC}/${expectedPrefC}` : '— scelta valida tra i residui';
  void cExpectedDisplay;

  const cellaIndRete = buildCella(cIndRete, expectedNetC || '(blocco residuo)', cValid);
  const cellaPrefisso = buildCella(cPrefisso, expectedPrefC || '(adeguato)', cValid && comparePrefix(cPrefisso, prefNum));
  let mascheraOk = false;
  let primoOk = false;
  let ultimoOk = false;
  let bcastOk = false;
  if (cValid) {
    mascheraOk = compareMask(ansC.maschera ?? '', prefNum);
    primoOk = compareIp(ansC.primoHost ?? '', formatIp(firstHost(netNum, prefNum)));
    ultimoOk = compareIp(ansC.ultimoHost ?? '', formatIp(lastHost(netNum, prefNum)));
    bcastOk = compareIp(ansC.broadcast ?? '', formatIp(broadcastAddress(netNum, prefNum)));
  }
  const cellaMaschera = buildCella(
    ansC.maschera ?? '',
    cValid ? formatMask(prefNum) : '(coerente)',
    mascheraOk
  );
  const cellaPrimo = buildCella(
    ansC.primoHost ?? '',
    cValid ? formatIp(firstHost(netNum, prefNum)) : '(coerente)',
    primoOk
  );
  const cellaUltimo = buildCella(
    ansC.ultimoHost ?? '',
    cValid ? formatIp(lastHost(netNum, prefNum)) : '(coerente)',
    ultimoOk
  );
  const cellaBcast = buildCella(
    ansC.broadcast ?? '',
    cValid ? formatIp(broadcastAddress(netNum, prefNum)) : '(coerente)',
    bcastOk
  );
  const allOkC = cValid && mascheraOk && primoOk && ultimoOk && bcastOk;
  const rigaC: EsitoRiga = {
    rowKey: `${es.parteC.hostRichiesti} host`,
    celle: {
      indRete: cellaIndRete,
      prefisso: cellaPrefisso,
      maschera: cellaMaschera,
      primoHost: cellaPrimo,
      ultimoHost: cellaUltimo,
      broadcast: cellaBcast,
    },
    punteggio: allOkC ? es.parteC.punti : 0,
    puntiMax: es.parteC.punti,
  };

  const tutteRighe = [...righeA, ...righeB, rigaC];
  const punteggio = tutteRighe.reduce((s, r) => s + r.punteggio, 0);
  void parent;
  return {
    esercizioId: es.id,
    titolo: es.titolo,
    righe: tutteRighe,
    punteggio: Math.round(punteggio * 10) / 10,
    puntiMax: es.puntiTotali,
    colonne: [...COLONNE_VLSM],
  };
}

export function gradeEsercizio(es: Esercizio, ra: RispostaEsercizio | undefined): EsitoEsercizio {
  switch (es.tipo) {
    case 'vlsm-alloc':
      return gradeVlsmAlloc(es, ra);
    case 'parametri':
      return gradeParametri(es, ra);
    case 'analisi-piano':
      return gradeAnalisiPiano(es, ra);
  }
}

export function gradeVerifica(
  v: Verifica,
  r: RispostaStudente,
  studente: DatiStudente,
  motivoConsegna: MotivoConsegna,
  dataConsegna: Date = new Date(),
  startedAt?: Date
): EsitoFinale {
  const esercizi = v.esercizi.map((e) => gradeEsercizio(e, r.esercizi[e.id]));
  const voto30 = Math.round(esercizi.reduce((s, e) => s + e.punteggio, 0) * 10) / 10;
  const voto10 = Math.round((voto30 / 3) * 10) / 10;
  const inizio = startedAt ?? dataConsegna;
  const durataMs = Math.max(0, dataConsegna.getTime() - inizio.getTime());
  return {
    verificaId: v.id,
    verificaTitolo: v.titolo,
    categoria: v.categoria,
    studente,
    data: dataConsegna.toLocaleDateString('it-IT'),
    esercizi,
    voto30,
    voto10,
    startedAt: inizio.toISOString(),
    consegnatoAt: dataConsegna.toISOString(),
    durataMs,
    motivoConsegna,
  };
}
