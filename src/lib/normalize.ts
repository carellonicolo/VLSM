import { parseIp, formatIp } from './vlsm';

export function isEmpty(s: string | undefined): boolean {
  return !s || s.trim() === '';
}

export function normalizeIp(s: string): string | null {
  try {
    return formatIp(parseIp(s));
  } catch {
    return null;
  }
}

export function normalizePrefix(s: string): number | null {
  const trimmed = s.trim();
  const m = trimmed.match(/^\/?\s*(\d{1,2})\s*$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 0 || n > 32) return null;
  return n;
}

export function compareIp(studente: string, atteso: string): boolean {
  if (isEmpty(studente)) return false;
  const norm = normalizeIp(studente);
  if (norm === null) return false;
  return norm === atteso;
}

export function comparePrefix(studente: string, atteso: number): boolean {
  if (isEmpty(studente)) return false;
  const norm = normalizePrefix(studente);
  return norm === atteso;
}

export function compareMask(studente: string, attesaPrefix: number): boolean {
  if (isEmpty(studente)) return false;
  const norm = normalizeIp(studente);
  if (norm === null) return false;
  return norm === formatIp(prefixToMaskNumber(attesaPrefix));
}

function prefixToMaskNumber(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}
