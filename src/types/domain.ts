export type VerificaId =
  | 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8'
  | 'v9' | 'v10' | 'v11' | 'v12' | 'v13' | 'v14' | 'v15' | 'v16'
  | 'v17' | 'v18' | 'v19' | 'v20' | 'v21' | 'v22' | 'v23' | 'v24'
  | 'v25' | 'v26' | 'v27' | 'v28' | 'v29' | 'v30' | 'v31' | 'v32'
  | 'v33' | 'v34' | 'v35' | 'v36' | 'v37' | 'v38' | 'v39' | 'v40'
  | 'v41' | 'v42' | 'v43' | 'v44' | 'v45' | 'v46' | 'v47' | 'v48'
  | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7' | 's8'
  | 's9' | 's10' | 's11' | 's12' | 's13' | 's14' | 's15' | 's16'
  | 's17' | 's18' | 's19' | 's20' | 's21' | 's22' | 's23' | 's24'
  | 's25' | 's26' | 's27' | 's28' | 's29' | 's30' | 's31' | 's32';
export type Difficolta = 'Base' | 'Media' | 'Alta' | 'Esperta';
export type Categoria = 'verifica' | 'esercitazione';

export const DIFFICOLTA_ORDER: Difficolta[] = ['Base', 'Media', 'Alta', 'Esperta'];

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
  categoria: Categoria;
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

export interface EventoFocus {
  startedAt: string;
  durataMs: number;
}

export interface Ammonizione {
  at: string;
  message: string;
}

export interface DatiStudente {
  nome: string;
  classe: string;
}

export interface EsitoFinale {
  verificaId: VerificaId;
  verificaTitolo: string;
  categoria: Categoria;
  studente: DatiStudente;
  data: string;
  esercizi: EsitoEsercizio[];
  voto30: number;
  voto10: number;
  startedAt: string;
  consegnatoAt: string;
  durataMs: number;
  motivoConsegna: MotivoConsegna;
  signature?: string;
  signedAt?: string;
  eventiFocus: EventoFocus[];
  ammonizioni?: Ammonizione[];
}
