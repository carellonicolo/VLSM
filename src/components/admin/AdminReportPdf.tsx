import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { EsitoSommario } from '../../lib/pdfData';

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
  header: {
    backgroundColor: '#0b3d91', color: '#fff', padding: 8, fontSize: 8,
    marginBottom: 12, textAlign: 'center',
  },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 9, color: '#555', marginBottom: 10, textAlign: 'center' },
  table: { marginBottom: 10, borderWidth: 0.5, borderColor: '#bbb' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#bbb' },
  th: { backgroundColor: '#eef1f7', padding: 4, fontSize: 8, fontWeight: 'bold', borderRightWidth: 0.5, borderRightColor: '#bbb' },
  td: { padding: 4, fontSize: 8, borderRightWidth: 0.5, borderRightColor: '#bbb' },
  firma: { marginTop: 24, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#000' },
  footer: { position: 'absolute', bottom: 15, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#888' },
  cat: { fontSize: 11, fontWeight: 'bold', color: '#0b3d91', marginTop: 12, marginBottom: 4 },
});

const COLS: { label: string; flex: number; key: keyof EsitoSommario | 'durataMin' | 'data' | 'distrazioni' }[] = [
  { label: 'Nome', flex: 1.8, key: 'nome' },
  { label: 'Classe', flex: 0.8, key: 'classe' },
  { label: 'Verifica', flex: 1.3, key: 'verificaTitolo' },
  { label: 'Voto /30', flex: 0.6, key: 'voto30' },
  { label: 'Voto /10', flex: 0.6, key: 'voto10' },
  { label: 'Durata', flex: 0.7, key: 'durataMin' },
  { label: 'Distrazioni', flex: 0.9, key: 'distrazioni' },
  { label: 'Consegna', flex: 1.1, key: 'data' },
];

function rowValue(r: EsitoSommario, key: typeof COLS[number]['key']): string {
  if (key === 'durataMin') return `${Math.round(r.durataMs / 60000)} min`;
  if (key === 'data') return new Date(r.consegnatoAt).toLocaleString('it-IT');
  if (key === 'distrazioni') {
    const eventi = r.eventiFocus ?? [];
    if (eventi.length === 0) return '0';
    const sec = Math.round(eventi.reduce((a, e) => a + e.durataMs, 0) / 1000);
    return `${eventi.length} (${sec}s)`;
  }
  const v = (r as unknown as Record<string, unknown>)[key];
  return String(v ?? '');
}

interface Props {
  verifiche: EsitoSommario[];
  esercitazioni: EsitoSommario[];
}

export function AdminReportPdf({ verifiche, esercitazioni }: Props) {
  const today = new Date().toLocaleString('it-IT');
  return (
    <Document title="Report bulk VLSM" author="Prof. N. Carello">
      <Page size="A4" orientation="landscape" style={s.page} wrap>
        <Text style={s.header}>
          ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026
        </Text>
        <Text style={s.title}>Report consegne VLSM — riepilogo per registro</Text>
        <Text style={s.subtitle}>Generato il {today} — {verifiche.length} verifiche, {esercitazioni.length} esercitazioni</Text>

        {verifiche.length > 0 && (
          <View>
            <Text style={s.cat}>Verifiche ufficiali ({verifiche.length})</Text>
            <View style={s.table}>
              <View style={s.row}>
                {COLS.map((c) => (
                  <View key={c.label} style={[s.th, { flex: c.flex }]}>
                    <Text>{c.label}</Text>
                  </View>
                ))}
              </View>
              {verifiche.map((r, i) => (
                <View key={i} style={s.row} wrap={false}>
                  {COLS.map((c) => (
                    <View key={c.label} style={[s.td, { flex: c.flex }]}>
                      <Text>{rowValue(r, c.key)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {esercitazioni.length > 0 && (
          <View>
            <Text style={s.cat}>Esercitazioni libere ({esercitazioni.length})</Text>
            <View style={s.table}>
              <View style={s.row}>
                {COLS.map((c) => (
                  <View key={c.label} style={[s.th, { flex: c.flex }]}>
                    <Text>{c.label}</Text>
                  </View>
                ))}
              </View>
              {esercitazioni.map((r, i) => (
                <View key={i} style={s.row} wrap={false}>
                  {COLS.map((c) => (
                    <View key={c.label} style={[s.td, { flex: c.flex }]}>
                      <Text>{rowValue(r, c.key)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={s.firma} wrap={false}>
          <Text style={{ fontSize: 9, marginTop: 18 }}>Firma docente: ______________________________</Text>
        </View>

        <Text style={s.footer} fixed>
          Nicolò Carello — info@nicolocarello.it
        </Text>
      </Page>
    </Document>
  );
}
