import type { EsitoSommario } from './pdfData';

/**
 * VERIFICA della firma di un esito. La FIRMA non viene più generata dal client:
 * è prodotta esclusivamente dal server alla consegna (vedi
 * functions/api/student/session/save.ts + functions/_lib/grade.ts). Qui resta
 * solo la verifica, che è un'operazione sicura da esporre pubblicamente.
 */

const TIMEOUT_MS = 6000;

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
