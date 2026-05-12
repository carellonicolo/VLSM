import type { Difficolta, VerificaId } from '../types/domain';
import { VERIFICHE } from '../data/verifiche';

export function pickVerifica(difficolta?: Difficolta): VerificaId {
  const pool = difficolta ? VERIFICHE.filter((v) => v.difficolta === difficolta) : VERIFICHE;
  if (pool.length === 0) {
    // fallback safety
    return VERIFICHE[Math.floor(Math.random() * VERIFICHE.length)].id;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx].id;
}
