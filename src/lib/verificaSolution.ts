import type {
  Categoria,
  Difficolta,
  Esercizio,
  EsercizioAnalisiPiano,
  EsercizioParametri,
  EsercizioVlsmAlloc,
  Verifica,
} from '../types/domain';
import {
  COLONNE_PARAMETRI,
  COLONNE_RESIDUI,
  COLONNE_VLSM,
  ETICHETTE_PARAMETRI,
  ETICHETTE_RESIDUI,
  ETICHETTE_VLSM,
  computeAllocAttesi,
  computeAnalisiParteAAttesi,
  computeParametriAttesi,
  computeResiduiAttesi,
} from './grading';
import {
  broadcastAddress,
  findResidualBlocks,
  firstHost,
  formatIp,
  formatMask,
  lastHost,
  minPrefixForHosts,
  networkAddress,
  parseCidr,
  parseIp,
} from './vlsm';

export type DocMode = 'verifica' | 'soluzione';

export interface ColView {
  key: string;
  label: string;
}

/** dato = valore già fornito nella consegna, mostrato in entrambe le modalità. */
export interface CellaView {
  valore: string;
  dato: boolean;
}

export interface RigaView {
  key: string;
  celle: Record<string, CellaView>;
}

export interface TabellaView {
  titolo?: string;
  nota?: string;
  colonne: ColView[];
  righe: RigaView[];
  /** Righe vuote da mostrare in modalità "verifica" quando le righe sono interamente da compilare (parti B e C). */
  blankRows?: number;
}

export interface EsercizioView {
  id: string;
  titolo: string;
  punti: number;
  consegna: string;
  contesto: string[];
  tabelle: TabellaView[];
}

export interface VerificaView {
  id: string;
  titolo: string;
  difficolta: Difficolta;
  categoria: Categoria;
  puntiTotali: number;
  esercizi: EsercizioView[];
}

function cell(valore: string, dato = false): CellaView {
  return { valore, dato };
}

function cols(keys: readonly string[], etichette: Record<string, string>): ColView[] {
  return keys.map((key) => ({ key, label: etichette[key] ?? key }));
}

function buildVlsmAlloc(es: EsercizioVlsmAlloc): EsercizioView {
  const requisitiTab: TabellaView = {
    titolo: 'Requisiti',
    colonne: [
      { key: 'nome', label: 'Sottorete' },
      { key: 'host', label: 'Host richiesti' },
    ],
    righe: es.requisiti.map((r, i) => ({
      key: `req-${i}`,
      celle: { nome: cell(r.nome, true), host: cell(String(r.host), true) },
    })),
  };

  const attesi = computeAllocAttesi(es);
  const allocTab: TabellaView = {
    titolo: 'Tabella di allocazione',
    nota: 'Ordinare le sottoreti dalla più grande alla più piccola.',
    colonne: [{ key: 'nome', label: 'Sottorete' }, ...cols(COLONNE_VLSM, ETICHETTE_VLSM)],
    righe: attesi.map((a, i) => ({
      key: `alloc-${i}`,
      celle: {
        nome: cell(a.rowKey, true),
        indRete: cell(a.attesi.indRete),
        prefisso: cell(`/${a.attesi.prefisso}`),
        maschera: cell(a.attesi.maschera),
        primoHost: cell(a.attesi.primoHost),
        ultimoHost: cell(a.attesi.ultimoHost),
        broadcast: cell(a.attesi.broadcast),
      },
    })),
  };

  return {
    id: es.id,
    titolo: es.titolo,
    punti: es.puntiTotali,
    consegna: es.consegna,
    contesto: [`Rete madre: ${es.reteMadre}`],
    tabelle: [requisitiTab, allocTab],
  };
}

function buildParametri(es: EsercizioParametri): EsercizioView {
  const attesi = computeParametriAttesi(es);
  const colonne: ColView[] = [
    { key: 'ipPrefisso', label: 'Ind. host / prefisso' },
    ...cols(COLONNE_PARAMETRI, ETICHETTE_PARAMETRI),
  ];
  const righe: RigaView[] = es.righe.map((r, i) => {
    const a = attesi[i].attesi;
    const dato = r.ipPrefisso ?? `${r.indRete}/${r.prefisso}`;
    return {
      key: `par-${i}`,
      celle: {
        ipPrefisso: cell(dato, true),
        indRete: cell(a.indRete),
        maschera: cell(a.maschera),
        primoHost: cell(a.primoHost),
        ultimoHost: cell(a.ultimoHost),
        broadcast: cell(a.broadcast),
      },
    };
  });

  return {
    id: es.id,
    titolo: es.titolo,
    punti: es.puntiTotali,
    consegna: es.consegna,
    contesto: [],
    tabelle: [{ colonne, righe }],
  };
}

/** Sceglie un blocco residuo adatto per i parametri richiesti dalla parte C. */
function solveParteC(es: EsercizioAnalisiPiano): Record<string, string> | null {
  const parent = parseCidr(es.bloccoPadre);
  const allocated = es.parteA.righe.map((r) => ({
    net: networkAddress(parseIp(r.indRete), r.prefisso),
    prefix: r.prefisso,
  }));
  const residui = findResidualBlocks({ net: parent.ip, prefix: parent.prefix }, allocated);
  const needed = minPrefixForHosts(es.parteC.hostRichiesti);
  const block = residui.find((b) => b.prefix <= needed);
  if (!block) return null;
  const net = block.net;
  return {
    indRete: formatIp(net),
    prefisso: String(needed),
    maschera: formatMask(needed),
    primoHost: formatIp(firstHost(net, needed)),
    ultimoHost: formatIp(lastHost(net, needed)),
    broadcast: formatIp(broadcastAddress(net, needed)),
  };
}

function buildAnalisiPiano(es: EsercizioAnalisiPiano): EsercizioView {
  const attesiA = computeAnalisiParteAAttesi(es);
  const tabA: TabellaView = {
    titolo: `a) Completare i parametri (${es.parteA.punti} pt)`,
    colonne: [
      { key: 'id', label: 'ID' },
      { key: 'indRete', label: 'Ind. di rete' },
      { key: 'prefisso', label: 'Prefisso' },
      { key: 'maschera', label: ETICHETTE_VLSM.maschera },
      { key: 'primoHost', label: ETICHETTE_VLSM.primoHost },
      { key: 'ultimoHost', label: ETICHETTE_VLSM.ultimoHost },
      { key: 'broadcast', label: ETICHETTE_VLSM.broadcast },
    ],
    righe: attesiA.map((a, i) => ({
      key: `a-${i}`,
      celle: {
        id: cell(a.rowKey, true),
        indRete: cell(a.attesi.indRete, true),
        prefisso: cell(`/${a.attesi.prefisso}`, true),
        maschera: cell(a.attesi.maschera),
        primoHost: cell(a.attesi.primoHost),
        ultimoHost: cell(a.attesi.ultimoHost),
        broadcast: cell(a.attesi.broadcast),
      },
    })),
  };

  const attesiB = computeResiduiAttesi(es);
  const tabB: TabellaView = {
    titolo: `b) Blocchi non allocati (${es.parteB.punti} pt)`,
    nota: 'Indicare i blocchi residui in notazione CIDR, in qualsiasi ordine.',
    colonne: cols(COLONNE_RESIDUI, ETICHETTE_RESIDUI),
    righe: attesiB.map((a, i) => ({
      key: `b-${i}`,
      celle: {
        cidr: cell(a.attesi.cidr),
        prefisso: cell(`/${a.attesi.prefisso}`),
        primoHost: cell(a.attesi.primoHost),
        ultimoHost: cell(a.attesi.ultimoHost),
        broadcast: cell(a.attesi.broadcast),
      },
    })),
    blankRows: es.parteB.numeroRighe,
  };

  const solC = solveParteC(es);
  const tabC: TabellaView = {
    titolo: `c) Nuova sottorete per ${es.parteC.hostRichiesti.toLocaleString('it-IT')} host (${es.parteC.punti} pt)`,
    nota: 'Scegliere il blocco residuo più adatto con la capacità minima sufficiente.',
    colonne: cols(COLONNE_VLSM, ETICHETTE_VLSM),
    righe: solC
      ? [
          {
            key: 'c-0',
            celle: {
              indRete: cell(solC.indRete),
              prefisso: cell(`/${solC.prefisso}`),
              maschera: cell(solC.maschera),
              primoHost: cell(solC.primoHost),
              ultimoHost: cell(solC.ultimoHost),
              broadcast: cell(solC.broadcast),
            },
          },
        ]
      : [],
    blankRows: 1,
  };

  return {
    id: es.id,
    titolo: es.titolo,
    punti: es.puntiTotali,
    consegna: es.consegna,
    contesto: [`Blocco padre: ${es.bloccoPadre}`],
    tabelle: [tabA, tabB, tabC],
  };
}

function buildEsercizioView(es: Esercizio): EsercizioView {
  switch (es.tipo) {
    case 'vlsm-alloc':
      return buildVlsmAlloc(es);
    case 'parametri':
      return buildParametri(es);
    case 'analisi-piano':
      return buildAnalisiPiano(es);
  }
}

export function buildVerificaView(v: Verifica): VerificaView {
  return {
    id: v.id,
    titolo: v.titolo,
    difficolta: v.difficolta,
    categoria: v.categoria,
    puntiTotali: v.puntiTotali,
    esercizi: v.esercizi.map(buildEsercizioView),
  };
}
