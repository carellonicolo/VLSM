import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ProgressStats } from '../../lib/progress';
import type { HistorySession } from '../../lib/studentApi';

const s = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica' },
  header: { backgroundColor: '#0b3d91', color: '#fff', padding: 8, fontSize: 8, marginBottom: 12, textAlign: 'center' },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#555', marginBottom: 10 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  statTile: { width: '25%', padding: 4 },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#0b3d91' },
  statLabel: { fontSize: 7, color: '#666' },
  cat: { fontSize: 11, fontWeight: 'bold', color: '#0b3d91', marginTop: 8, marginBottom: 4 },
  table: { marginBottom: 10, borderWidth: 0.5, borderColor: '#bbb' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#bbb' },
  th: { backgroundColor: '#eef1f7', padding: 4, fontSize: 8, fontWeight: 'bold', borderRightWidth: 0.5, borderRightColor: '#bbb' },
  td: { padding: 4, fontSize: 8, borderRightWidth: 0.5, borderRightColor: '#bbb' },
  footer: { position: 'absolute', bottom: 15, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#888' },
});

interface Props {
  subjectName: string;
  subtitle?: string;
  stats: ProgressStats;
  sessions: HistorySession[];
}

function fmt(v: number | null): string {
  return v == null ? '—' : String(v);
}

function statoLabel(st: string): string {
  if (st === 'consegnata') return 'Consegnata';
  if (st === 'annullata') return 'Annullata';
  if (st === 'in_progress') return 'In corso';
  if (st === 'abbandonata') return 'Abbandonata';
  return st;
}

const COLS: { label: string; flex: number }[] = [
  { label: 'Data', flex: 1.1 },
  { label: 'Tipo', flex: 0.8 },
  { label: 'Prova', flex: 1.8 },
  { label: 'Livello', flex: 0.8 },
  { label: 'Voto', flex: 0.6 },
  { label: 'Distr.', flex: 0.6 },
  { label: 'Ammon.', flex: 0.6 },
  { label: 'Stato', flex: 1 },
];

export function AndamentoPdf({ subjectName, subtitle, stats, sessions }: Props) {
  const today = new Date().toLocaleString('it-IT');
  const tiles: { label: string; value: string }[] = [
    { label: 'Media /30', value: fmt(stats.mediaVoto30) },
    { label: 'Media /10', value: fmt(stats.mediaVoto10) },
    { label: 'Ultimo voto', value: fmt(stats.ultimoVoto30) },
    { label: 'Miglior voto', value: fmt(stats.miglioreVoto30) },
    { label: 'Verifiche', value: String(stats.nVerificheConsegnate) },
    { label: 'Esercitazioni', value: String(stats.nEsercitazioni) },
    { label: 'Distrazioni', value: String(stats.totDistrazioni) },
    { label: 'Ammonizioni', value: String(stats.totAmmonizioni) },
  ];

  return (
    <Document title={`Andamento — ${subjectName}`} author="Prof. N. Carello">
      <Page size="A4" style={s.page} wrap>
        <Text style={s.header}>
          ITIS G. Marconi — Verona | Sistemi e Reti (SRI) | Prof. N. Carello | A.S. 2025/2026
        </Text>
        <Text style={s.title}>Andamento — {subjectName}</Text>
        <Text style={s.subtitle}>{subtitle ? `${subtitle} · ` : ''}Generato il {today}</Text>

        <View style={s.statsRow}>
          {tiles.map((t) => (
            <View key={t.label} style={s.statTile}>
              <Text style={s.statValue}>{t.value}</Text>
              <Text style={s.statLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        <Text style={s.cat}>Media per livello</Text>
        <View style={s.table}>
          <View style={s.row}>
            <View style={[s.th, { flex: 1 }]}><Text>Livello</Text></View>
            <View style={[s.th, { flex: 1 }]}><Text>Media /30</Text></View>
            <View style={[s.th, { flex: 1 }]}><Text>Verifiche</Text></View>
          </View>
          {stats.perLivello.map((l) => (
            <View key={l.livello} style={s.row}>
              <View style={[s.td, { flex: 1 }]}><Text>{l.livello}</Text></View>
              <View style={[s.td, { flex: 1 }]}><Text>{fmt(l.media)}</Text></View>
              <View style={[s.td, { flex: 1 }]}><Text>{l.count}</Text></View>
            </View>
          ))}
        </View>

        <Text style={s.cat}>Storico attività ({sessions.length})</Text>
        <View style={s.table}>
          <View style={s.row}>
            {COLS.map((c) => (
              <View key={c.label} style={[s.th, { flex: c.flex }]}><Text>{c.label}</Text></View>
            ))}
          </View>
          {sessions.map((r) => (
            <View key={r.id} style={s.row} wrap={false}>
              <View style={[s.td, { flex: COLS[0].flex }]}><Text>{new Date(r.started_at).toLocaleDateString('it-IT')}</Text></View>
              <View style={[s.td, { flex: COLS[1].flex }]}><Text>{r.categoria === 'verifica' ? 'Verifica' : 'Eserc.'}</Text></View>
              <View style={[s.td, { flex: COLS[2].flex }]}><Text>{r.verifica_titolo}</Text></View>
              <View style={[s.td, { flex: COLS[3].flex }]}><Text>{r.difficolta ?? '—'}</Text></View>
              <View style={[s.td, { flex: COLS[4].flex }]}><Text>{r.voto30 != null ? `${r.voto30}/30` : '—'}</Text></View>
              <View style={[s.td, { flex: COLS[5].flex }]}><Text>{r.distrazioni_count ?? 0}</Text></View>
              <View style={[s.td, { flex: COLS[6].flex }]}><Text>{r.ammonizioni_count ?? 0}</Text></View>
              <View style={[s.td, { flex: COLS[7].flex }]}><Text>{statoLabel(r.state)}</Text></View>
            </View>
          ))}
        </View>

        <Text style={s.footer} fixed>Nicolò Carello — info@nicolocarello.it</Text>
      </Page>
    </Document>
  );
}
