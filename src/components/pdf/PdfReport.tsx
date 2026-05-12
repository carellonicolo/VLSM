import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { EsitoFinale } from '../../types/domain';
import { ETICHETTE_VLSM, ETICHETTE_PARAMETRI, ETICHETTE_RESIDUI } from '../../lib/grading';

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a2233',
  },
  header: {
    backgroundColor: '#0b3d91',
    color: '#fff',
    padding: 8,
    fontSize: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 9,
  },
  votoBox: {
    backgroundColor: '#0b3d91',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    textAlign: 'center',
    marginBottom: 12,
  },
  voto30: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  voto10: {
    fontSize: 11,
    marginTop: 2,
  },
  exTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0b3d91',
    marginTop: 10,
    marginBottom: 4,
  },
  table: {
    marginBottom: 8,
    borderStyle: 'solid',
    borderWidth: 0.5,
    borderColor: '#bbb',
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#bbb',
  },
  th: {
    backgroundColor: '#eef1f7',
    padding: 3,
    fontSize: 7.5,
    fontWeight: 'bold',
    borderRightWidth: 0.5,
    borderRightColor: '#bbb',
  },
  td: {
    padding: 3,
    fontSize: 7.5,
    borderRightWidth: 0.5,
    borderRightColor: '#bbb',
  },
  tdCorretto: { backgroundColor: '#e6f5ec' },
  tdErrato: { backgroundColor: '#ffe6e1' },
  tdVuoto: { backgroundColor: '#ffe6e1' },
  attesa: {
    fontSize: 6.5,
    color: '#1f7a3c',
    marginTop: 1,
  },
  firme: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#bbb',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  firmaBox: {
    width: '45%',
  },
  firmaLabel: {
    fontSize: 9,
    marginBottom: 18,
  },
  firmaLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#888',
  },
});

function labelFor(esercizioId: string, colKey: string): string {
  if (esercizioId.startsWith('es4')) {
    if (ETICHETTE_RESIDUI[colKey]) return ETICHETTE_RESIDUI[colKey];
  }
  if (ETICHETTE_VLSM[colKey]) return ETICHETTE_VLSM[colKey];
  if (ETICHETTE_PARAMETRI[colKey]) return ETICHETTE_PARAMETRI[colKey];
  return colKey;
}

interface Props {
  esito: EsitoFinale;
}

export function PdfReport({ esito }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.header}>
          ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026
        </Text>
        <Text style={styles.title}>{esito.verificaTitolo} — Correzione automatica</Text>

        <View style={styles.meta}>
          <Text>
            Alunno: <Text style={{ fontWeight: 'bold' }}>{esito.studente.nome}</Text>
          </Text>
          <Text>
            Classe: <Text style={{ fontWeight: 'bold' }}>{esito.studente.classe}</Text>
          </Text>
          <Text>Data: {esito.data}</Text>
        </View>

        <View style={styles.votoBox}>
          <Text style={styles.voto30}>VOTO: {esito.voto30}/30</Text>
          <Text style={styles.voto10}>Equivalente in decimi: {esito.voto10}/10</Text>
          {esito.motivoConsegna === 'timeout' && (
            <Text style={{ fontSize: 8, marginTop: 4 }}>Consegna automatica per scadenza del tempo</Text>
          )}
        </View>

        {esito.esercizi.map((e) => (
          <View key={e.esercizioId} wrap={false}>
            <Text style={styles.exTitle}>
              {e.titolo} — {Math.round(e.punteggio * 10) / 10}/{e.puntiMax} pt
            </Text>
            {e.righe.length > 0 && (
              <View style={styles.table}>
                <View style={styles.tr}>
                  <View style={[styles.th, { width: '8%' }]}>
                    <Text>Riga</Text>
                  </View>
                  {Object.keys(e.righe[0].celle).map((col) => (
                    <View key={col} style={[styles.th, { flex: 1 }]}>
                      <Text>{labelFor(e.esercizioId, col)}</Text>
                    </View>
                  ))}
                  <View style={[styles.th, { width: '8%' }]}>
                    <Text>Pt</Text>
                  </View>
                </View>
                {e.righe.map((r) => (
                  <View key={r.rowKey} style={styles.tr}>
                    <View style={[styles.td, { width: '8%' }]}>
                      <Text>{r.rowKey}</Text>
                    </View>
                    {Object.entries(r.celle).map(([col, c]) => {
                      const tdStyle =
                        c.stato === 'corretto'
                          ? [styles.td, styles.tdCorretto, { flex: 1 }]
                          : c.stato === 'vuoto'
                            ? [styles.td, styles.tdVuoto, { flex: 1 }]
                            : [styles.td, styles.tdErrato, { flex: 1 }];
                      return (
                        <View key={col} style={tdStyle}>
                          <Text>{c.valoreStudente || '—'}</Text>
                          {c.stato !== 'corretto' && <Text style={styles.attesa}>✓ {c.valoreAtteso}</Text>}
                        </View>
                      );
                    })}
                    <View style={[styles.td, { width: '8%' }]}>
                      <Text>
                        {Math.round(r.punteggio * 10) / 10}/{Math.round(r.puntiMax * 10) / 10}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={styles.firme} wrap={false}>
          <View style={styles.firmaBox}>
            <Text style={styles.firmaLabel}>Firma studente:</Text>
            <View style={styles.firmaLine} />
          </View>
          <View style={styles.firmaBox}>
            <Text style={styles.firmaLabel}>Firma docente:</Text>
            <View style={styles.firmaLine} />
          </View>
        </View>

        <Text style={styles.footer} fixed>
          Nicolò Carello — info@nicolocarello.it
        </Text>
      </Page>
    </Document>
  );
}
