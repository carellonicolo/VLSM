/** Helper leggeri per export CSV e download file (senza dipendenze pesanti). */

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(';')];
  for (const r of rows) lines.push(r.map(escape).join(';'));
  return '﻿' + lines.join('\n'); // BOM per Excel UTF-8
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadCsv(filename: string, content: string): void {
  downloadBlob(filename, new Blob([content], { type: 'text/csv;charset=utf-8' }));
}

/** "Mario Rossi" → "mario_rossi" per nomi file sicuri. */
export function safeFileName(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'export';
}
