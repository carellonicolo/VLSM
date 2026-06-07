/**
 * Generazione/scaricamento del PDF di una singola prova (verifica o esercitazione)
 * a partire dal suo dettaglio salvato sul server.
 *
 * Usa l'esito salvato se presente (include la firma originale); altrimenti
 * ricalcola il voto al volo dalle risposte. Condiviso da:
 *  - console docente (Sessioni live, Andamento studente)
 *  - dashboard studente (storico personale)
 */
import type { EsitoFinale, MotivoConsegna, RispostaStudente } from '../types/domain';
import { getVerifica } from '../data/verifiche';
import { gradeVerifica } from './grading';
import { downloadBlob } from './csv';

export interface SessionPdfSource {
  student_name: string;
  student_class: string;
  verifica_id: string;
  started_at: string;
  consegnato_at: string | null;
  updated_at: string;
  motivo_consegna: string | null;
  answers: unknown;
  eventiFocus: { startedAt: string; durataMs: number }[];
  esito: unknown;
}

/** Costruisce l'esito (salvato o ricalcolato) per una prova. */
function buildEsito(s: SessionPdfSource): EsitoFinale {
  if (s.esito && typeof s.esito === 'object') {
    return s.esito as EsitoFinale;
  }
  const verifica = getVerifica(s.verifica_id);
  if (!verifica) throw new Error('Verifica non trovata nel dataset locale.');
  const startedAt = new Date(s.started_at);
  const consegnatoAt = s.consegnato_at ? new Date(s.consegnato_at) : new Date(s.updated_at);
  const motivo: MotivoConsegna = s.motivo_consegna === 'timeout' ? 'timeout' : 'volontaria';
  return gradeVerifica(
    verifica,
    s.answers as RispostaStudente,
    { nome: s.student_name, classe: s.student_class },
    motivo,
    consegnatoAt,
    startedAt,
    s.eventiFocus ?? []
  );
}

/** Genera e scarica il PDF della prova. Lancia in caso di dati insufficienti. */
export async function downloadSessionPdf(s: SessionPdfSource): Promise<void> {
  const esito = buildEsito(s);
  const [{ pdf }, { PdfReport }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('../components/pdf/PdfReport'),
  ]);
  const blob = await pdf(<PdfReport esito={esito} />).toBlob();
  const safeName = (s.student_name || 'studente').replace(/[^a-zA-Z0-9_-]+/g, '_');
  downloadBlob(`vlsm_${safeName}_${s.verifica_id}.pdf`, blob);
}
