export type VerificaId = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6';
export type Difficolta = 'Base' | 'Media' | 'Media-alta' | 'Alta' | 'Molto alta';

export interface EsercizioBase {
  id: string;
  titolo: string;
  puntiTotali: number;
  consegna: string;
}

export interface RequisitoSottorete {
  nome: string;
  host: number;
}

export interface EsercizioVlsmAlloc extends EsercizioBase {
  tipo: 'vlsm-alloc';
  reteMadre: string;
  requisiti: RequisitoSottorete[];
  puntiPerRiga: number;
}

export interface RigaParametriIn {
  rowKey: string;
  ipPrefisso?: string;
  indRete?: string;
  prefisso?: number;
}

export interface EsercizioParametri extends EsercizioBase {
  tipo: 'parametri';
  righe: RigaParametriIn[];
  puntiPerRiga: number;
  modalitaInput: 'ip-prefisso' | 'rete-prefisso';
}

export interface EsercizioAnalisiPiano extends EsercizioBase {
  tipo: 'analisi-piano';
  bloccoPadre: string;
  parteA: {
    punti: number;
    righe: { rowKey: string; indRete: string; prefisso: number }[];
  };
  parteB: {
    punti: number;
    numeroRighe: number;
  };
  parteC: {
    punti: number;
    hostRichiesti: number;
  };
}

export type Esercizio = EsercizioVlsmAlloc | EsercizioParametri | EsercizioAnalisiPiano;

export interface Verifica {
  id: VerificaId;
  titolo: string;
  puntiTotali: number;
  difficolta: Difficolta;
  esercizi: Esercizio[];
}

export type RispostaRiga = Record<string, string>;

export interface RispostaEsercizio {
  esercizioId: string;
  righe?: RispostaRiga[];
  parteA?: RispostaRiga[];
  parteB?: RispostaRiga[];
  parteC?: RispostaRiga;
}

export interface RispostaStudente {
  verificaId: VerificaId;
  esercizi: Record<string, RispostaEsercizio>;
}

export type StatoCella = 'corretto' | 'errato' | 'vuoto';

export interface EsitoCella {
  valoreStudente: string;
  valoreAtteso: string;
  stato: StatoCella;
}

export interface EsitoRiga {
  rowKey: string;
  celle: Record<string, EsitoCella>;
  punteggio: number;
  puntiMax: number;
}

export interface EsitoEsercizio {
  esercizioId: string;
  titolo: string;
  righe: EsitoRiga[];
  punteggio: number;
  puntiMax: number;
  colonne: string[];
}

export type MotivoConsegna = 'volontaria' | 'timeout';

export interface DatiStudente {
  nome: string;
  classe: string;
}

export interface EsitoFinale {
  verificaId: VerificaId;
  verificaTitolo: string;
  studente: DatiStudente;
  data: string;
  esercizi: EsitoEsercizio[];
  voto30: number;
  voto10: number;
  startedAt: string;
  consegnatoAt: string;
  durataMs: number;
  motivoConsegna: MotivoConsegna;
}
