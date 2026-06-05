import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AdminStudent } from '../../lib/cloudSync';

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
  header: { backgroundColor: '#0b3d91', color: '#fff', padding: 8, fontSize: 8, marginBottom: 12, textAlign: 'center' },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  subtitle: { fontSize: 9, color: '#555', marginBottom: 10, textAlign: 'center' },
  table: { borderWidth: 0.5, borderColor: '#bbb' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#bbb' },
  th: { backgroundColor: '#eef1f7', padding: 4, fontSize: 8, fontWeight: 'bold', borderRightWidth: 0.5, borderRightColor: '#bbb' },
  td: { padding: 4, fontSize: 8, borderRightWidth: 0.5, borderRightColor: '#bbb' },
  footer: { position: 'absolute', bottom: 15, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#888' },
});

const STATO: Record<string, string> = {
  validated: 'Convalidato',
  pending: 'In attesa',
  rejected: 'Rifiutato',
  disabled: 'Disabilitato',
};

const COLS: { label: string; flex: number }[] = [
  { label: 'Nome', flex: 1.6 },
  { label: 'Email', flex: 2.2 },
  { label: 'Classe', flex: 1 },
  { label: 'Stato', flex: 1 },
  { label: 'Verifiche', flex: 0.7 },
  { label: 'Eserc.', flex: 0.6 },
  { label: 'Ultimo accesso', flex: 1.4 },
];

interface Props {
  students: AdminStudent[];
}

export function StudentsListPdf({ students }: Props) {
  const today = new Date().toLocaleString('it-IT');
  return (
    <Document title="Elenco studenti VLSM" author="Prof. N. Carello">
      <Page size="A4" orientation="landscape" style={s.page} wrap>
        <Text style={s.header}>
          ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026
        </Text>
        <Text style={s.title}>Elenco studenti</Text>
        <Text style={s.subtitle}>{students.length} account · generato il {today}</Text>

        <View style={s.table}>
          <View style={s.row}>
            {COLS.map((c) => (
              <View key={c.label} style={[s.th, { flex: c.flex }]}><Text>{c.label}</Text></View>
            ))}
          </View>
          {students.map((st) => (
            <View key={st.id} style={s.row} wrap={false}>
              <View style={[s.td, { flex: COLS[0].flex }]}><Text>{st.full_name}</Text></View>
              <View style={[s.td, { flex: COLS[1].flex }]}><Text>{st.email}</Text></View>
              <View style={[s.td, { flex: COLS[2].flex }]}><Text>{st.class || st.declared_class || '—'}</Text></View>
              <View style={[s.td, { flex: COLS[3].flex }]}><Text>{STATO[st.status] ?? st.status}</Text></View>
              <View style={[s.td, { flex: COLS[4].flex }]}><Text>{st.n_verifiche}</Text></View>
              <View style={[s.td, { flex: COLS[5].flex }]}><Text>{st.n_esercitazioni}</Text></View>
              <View style={[s.td, { flex: COLS[6].flex }]}><Text>{st.last_login_at ? new Date(st.last_login_at).toLocaleString('it-IT') : '—'}</Text></View>
            </View>
          ))}
        </View>

        <Text style={s.footer} fixed>Nicolò Carello — info@nicolocarello.it</Text>
      </Page>
    </Document>
  );
}
