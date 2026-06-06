import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { CellaView, DocMode, TabellaView, VerificaView } from '../../lib/verificaSolution';

Font.registerHyphenationCallback((word) => [word]);

const INTESTAZIONE = 'ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#1a2233' },
  header: { backgroundColor: '#0b3d91', color: '#fff', padding: 8, fontSize: 8, marginBottom: 12, textAlign: 'center' },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  banner: {
    backgroundColor: '#fff3c4',
    border: 1,
    borderColor: '#d4a017',
    borderStyle: 'solid',
    color: '#7c5d00',
    padding: 6,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 9,
    fontWeight: 'bold',
  },
  exTitle: { fontSize: 11, fontWeight: 'bold', color: '#0b3d91', marginTop: 10, marginBottom: 4 },
  consegna: { fontSize: 8.5, marginBottom: 4, color: '#333' },
  contesto: { fontSize: 8.5, fontWeight: 'bold', marginBottom: 2 },
  tabTitle: { fontSize: 9.5, fontWeight: 'bold', marginTop: 6, marginBottom: 3 },
  nota: { fontSize: 7.5, color: '#666', marginBottom: 3 },
  table: { marginBottom: 8, borderStyle: 'solid', borderWidth: 0.5, borderColor: '#bbb' },
  tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#bbb' },
  th: {
    backgroundColor: '#eef1f7',
    padding: 3,
    fontSize: 7,
    fontWeight: 'bold',
    borderRightWidth: 0.5,
    borderRightColor: '#bbb',
    flex: 1,
  },
  td: { padding: 3, fontSize: 7.5, borderRightWidth: 0.5, borderRightColor: '#bbb', flex: 1, minHeight: 15 },
  tdDato: { backgroundColor: '#f3f4f7', color: '#555' },
  tdSol: { backgroundColor: '#e6f5ec', color: '#1f7a3c' },
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

function rowList(t: TabellaView, isSol: boolean): { key: string; celle: Record<string, CellaView> }[] {
  if (!isSol && t.blankRows != null) {
    return Array.from({ length: t.blankRows }, (_, i) => ({ key: `blank-${i}`, celle: {} }));
  }
  return t.righe;
}

function Tabella({ t, isSol }: { t: TabellaView; isSol: boolean }) {
  const righe = rowList(t, isSol);
  return (
    <View>
      {t.titolo && <Text style={styles.tabTitle}>{t.titolo}</Text>}
      {t.nota && <Text style={styles.nota}>{t.nota}</Text>}
      <View style={styles.table}>
        <View style={styles.tr} wrap={false}>
          {t.colonne.map((c) => (
            <View key={c.key} style={styles.th}>
              <Text>{c.label}</Text>
            </View>
          ))}
        </View>
        {righe.map((r) => (
          <View key={r.key} style={styles.tr} wrap={false}>
            {t.colonne.map((c) => {
              const cella = r.celle[c.key] ?? { valore: '', dato: false };
              const tdStyle = cella.dato
                ? [styles.td, styles.tdDato]
                : isSol
                  ? [styles.td, styles.tdSol]
                  : [styles.td];
              const text = cella.dato ? cella.valore : isSol ? cella.valore || '—' : ' ';
              return (
                <View key={c.key} style={tdStyle}>
                  <Text>{text}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

interface Props {
  view: VerificaView;
  mode: DocMode;
}

export function VerificaDocPdf({ view, mode }: Props) {
  const isSol = mode === 'soluzione';
  const tipo = isSol ? 'Correzione' : 'Testo';
  return (
    <Document title={`${view.titolo} — ${tipo}`} author="ITIS G. Marconi — Sistemi e Reti" creator="VLSM app">
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.header}>{INTESTAZIONE}</Text>
        <Text style={styles.title}>
          {view.titolo} — {tipo} ({view.difficolta}, {view.puntiTotali} pt)
        </Text>
        {view.categoria === 'esercitazione' && (
          <Text style={styles.banner}>ESERCITAZIONE LIBERA — non vale come verifica ufficiale</Text>
        )}
        {view.esercizi.map((es) => (
          <View key={es.id}>
            <Text style={styles.exTitle}>
              {es.titolo} — {es.punti} pt
            </Text>
            {es.consegna ? <Text style={styles.consegna}>{es.consegna}</Text> : null}
            {es.contesto.map((c, i) => (
              <Text key={i} style={styles.contesto}>
                {c}
              </Text>
            ))}
            {es.tabelle.map((t, ti) => (
              <Tabella key={ti} t={t} isSol={isSol} />
            ))}
          </View>
        ))}
        <Text style={styles.footer} fixed>
          Nicolò Carello — info@nicolocarello.it
        </Text>
      </Page>
    </Document>
  );
}
