/**
 * CORREZIONE AUTOREVOLE LATO SERVER.
 *
 * Il voto di una verifica NON deve mai fidarsi del client: qui il server
 * ricalcola l'intero esito dalle risposte inviate, usando ESATTAMENTE gli stessi
 * moduli puri del client (grading + dataset verifiche), e firma il sommario con
 * HMAC. Il client adotta l'esito restituito così che display, PDF e firma
 * restino perfettamente coerenti (`buildSommario(esitoServer)` == payload firmato).
 *
 * Import cross-boundary da `src/`: i moduli importati sono PURI (nessun global
 * del browser) e vengono inclusi nel bundle della Function da esbuild (Pages).
 * Vedi tsconfig.json (`include: ["src"]`): le Functions non passano da tsc, ma
 * il runtime le bundla correttamente.
 */
import { getVerifica } from '../../src/data/verifiche';
import { gradeVerifica } from '../../src/lib/grading';
import { buildSommario, type EsitoSommario } from '../../src/lib/pdfData';
import type {
  Ammonizione,
  EsitoFinale,
  EventoFocus,
  MotivoConsegna,
  RispostaStudente,
} from '../../src/types/domain';
import { canonicalJson, hmacSha256Base64 } from './crypto';

export interface ServerGradeInput {
  verificaId: string;
  /** Risposte inviate dal client: forma non fidata, il grading le tratta in modo difensivo. */
  answers: unknown;
  studentName: string;
  studentClass: string;
  startedAt: string;
  consegnatoAt: string;
  motivoConsegna: MotivoConsegna;
  eventiFocus: EventoFocus[];
  ammonizioni?: Ammonizione[];
}

export interface ServerGradeResult {
  esito: EsitoFinale;
  sommario: EsitoSommario;
  voto30: number;
  signature: string | null;
  signedAt: string | null;
}

/** dd/mm/yyyy deterministico dalla data ISO, senza dipendere da Intl nel runtime Worker. */
function formatDateIt(consegnatoAt: string): string {
  const iso = typeof consegnatoAt === 'string' ? consegnatoAt : '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(consegnatoAt);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/**
 * Ricalcola l'esito lato server e (se il segreto è configurato) lo firma.
 * Ritorna `null` se la verifica non esiste o il grading fallisce: il chiamante
 * decide come registrare la consegna (mai fidandosi del voto del client).
 */
export async function gradeAndSign(
  input: ServerGradeInput,
  secret: string | undefined
): Promise<ServerGradeResult | null> {
  const verifica = getVerifica(input.verificaId);
  if (!verifica) return null;

  const studente = { nome: input.studentName ?? '', classe: input.studentClass ?? '' };
  const started = input.startedAt ? new Date(input.startedAt) : undefined;
  const consegnato = input.consegnatoAt ? new Date(input.consegnatoAt) : new Date();
  const answers = (input.answers && typeof input.answers === 'object'
    ? input.answers
    : { verificaId: verifica.id, esercizi: {} }) as RispostaStudente;

  let esito: EsitoFinale;
  try {
    esito = gradeVerifica(
      verifica,
      answers,
      studente,
      input.motivoConsegna,
      consegnato,
      started,
      input.eventiFocus ?? []
    );
  } catch {
    return null;
  }

  if (input.ammonizioni && input.ammonizioni.length > 0) esito.ammonizioni = input.ammonizioni;
  // `data` è solo display (NON entra nel sommario firmato): formato deterministico.
  esito.data = formatDateIt(input.consegnatoAt);

  const sommario = buildSommario(esito);

  let signature: string | null = null;
  let signedAt: string | null = null;
  if (secret && secret.length >= 16) {
    signature = await hmacSha256Base64(secret, canonicalJson(sommario));
    signedAt = new Date().toISOString();
    esito.signature = signature;
    esito.signedAt = signedAt;
  }

  return { esito, sommario, voto30: esito.voto30, signature, signedAt };
}
