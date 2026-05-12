import type { VerificaId } from '../types/domain';
import { VERIFICHE } from '../data/verifiche';

export function pickVerifica(): VerificaId {
  const idx = Math.floor(Math.random() * VERIFICHE.length);
  return VERIFICHE[idx].id;
}
