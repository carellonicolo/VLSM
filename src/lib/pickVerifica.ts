import type { Categoria, Difficolta, VerificaId } from '../types/domain';
import { VERIFICHE } from '../data/verifiche';

export function pickVerifica(difficolta?: Difficolta, categoria: Categoria = 'verifica'): VerificaId {
  const pool = VERIFICHE.filter(
    (v) => v.categoria === categoria && (difficolta ? v.difficolta === difficolta : true)
  );
  if (pool.length === 0) {
    const anyPool = VERIFICHE.filter((v) => v.categoria === categoria);
    if (anyPool.length === 0) return VERIFICHE[0].id;
    return anyPool[Math.floor(Math.random() * anyPool.length)].id;
  }
  return pool[Math.floor(Math.random() * pool.length)].id;
}
