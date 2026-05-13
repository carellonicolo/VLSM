import * as pdfjsLib from 'pdfjs-dist';
// Worker via Vite import (URL-based)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { decodeEnvelope, type EsitoSommario } from './pdfData';
import { verifySignature, type VerifyStatus } from './pdfSign';

// Configura worker una sola volta
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ParsedFile {
  filename: string;
  sommario?: EsitoSommario;
  signature?: string;
  signedAt?: string;
  verify?: VerifyStatus;
  error?: string;
}

export async function parsePdf(file: File): Promise<ParsedFile> {
  try {
    const buf = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    const meta = await doc.getMetadata();
    const info = (meta.info ?? {}) as Record<string, unknown>;
    const candidates = [info.Subject, info.Keywords, info.Title]
      .filter((v): v is string => typeof v === 'string');
    for (const c of candidates) {
      const env = decodeEnvelope(c);
      if (env) {
        return {
          filename: file.name,
          sommario: env.payload,
          signature: env.signature,
          signedAt: env.signedAt,
        };
      }
    }
    return { filename: file.name, error: 'Nessun token VLSM_DATA trovato nei metadati del PDF.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { filename: file.name, error: `Errore parsing: ${msg}` };
  }
}

export async function parseMultiple(files: File[]): Promise<ParsedFile[]> {
  const parsed = await Promise.all(files.map(parsePdf));
  // Verifica firma in parallelo (al massimo 8 in volo per non saturare la rete)
  const targets = parsed.filter((p) => p.sommario);
  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < targets.length) {
      const idx = i++;
      const t = targets[idx];
      t.verify = await verifySignature(t.sommario!, t.signature);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return parsed;
}

export function toCsv(rows: EsitoSommario[]): string {
  const header = [
    'Nome', 'Classe', 'Categoria', 'Verifica', 'Voto/30', 'Voto/10',
    'Inizio', 'Fine', 'Durata (min)', 'Modalità consegna',
  ];
  const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [header.map(escape).join(';')];
  for (const r of rows) {
    lines.push(
      [
        r.nome,
        r.classe,
        r.categoria,
        r.verificaTitolo,
        r.voto30,
        r.voto10,
        new Date(r.startedAt).toLocaleString('it-IT'),
        new Date(r.consegnatoAt).toLocaleString('it-IT'),
        Math.round(r.durataMs / 60000),
        r.motivoConsegna,
      ].map((v) => escape(String(v ?? ''))).join(';')
    );
  }
  return '﻿' + lines.join('\n'); // BOM for Excel utf-8
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
