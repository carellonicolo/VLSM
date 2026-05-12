import { PDFDownloadLink } from '@react-pdf/renderer';
import type { EsitoFinale } from '../../types/domain';
import { PdfReport } from './PdfReport';

interface Props {
  esito: EsitoFinale;
  onDownloaded?: () => void;
}

export function PdfDownload({ esito, onDownloaded }: Props) {
  const fileName = `vlsm_${esito.studente.nome.replace(/\s+/g, '_')}_${esito.verificaId}.pdf`;
  return (
    <PDFDownloadLink document={<PdfReport esito={esito} />} fileName={fileName}>
      {({ loading }) => (
        <button className="btn" type="button" disabled={loading} onClick={() => onDownloaded?.()}>
          {loading ? 'Generazione PDF…' : 'Scarica PDF della verifica'}
        </button>
      )}
    </PDFDownloadLink>
  );
}
