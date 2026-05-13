import type { EsitoSommario } from './pdfData';

export interface SignatureResult {
  signature: string;
  signedAt: string;
}

const TIMEOUT_MS = 6000;

export async function signSommario(sommario: EsitoSommario): Promise<SignatureResult | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/sign', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(sommario),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SignatureResult;
    if (!data.signature || !data.signedAt) return null;
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export type VerifyStatus = 'valid' | 'invalid' | 'unsigned' | 'unavailable';

export async function verifySignature(
  payload: EsitoSommario,
  signature: string | undefined
): Promise<VerifyStatus> {
  if (!signature) return 'unsigned';
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ payload, signature }),
      signal: ctrl.signal,
    });
    if (!res.ok) return 'unavailable';
    const data = (await res.json()) as { valid?: boolean };
    return data.valid ? 'valid' : 'invalid';
  } catch {
    return 'unavailable';
  } finally {
    clearTimeout(t);
  }
}
