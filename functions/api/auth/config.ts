import { jsonOk, type SharedEnv } from '../../_lib/shared';
import { getVerificaEnabled } from '../../_lib/settings';

/**
 * GET /api/auth/config — restituisce informazioni pubbliche sulla configurazione
 * runtime (es. modalità verifica abilitata/disabilitata). Nessuna auth richiesta.
 */
export const onRequestGet: PagesFunction<SharedEnv> = async ({ env }) => {
  try {
    const verificaEnabled = await getVerificaEnabled(env);
    return jsonOk({ verificaEnabled });
  } catch {
    // Se il DB non è disponibile, default permissivo: verifica abilitata.
    return jsonOk({ verificaEnabled: true });
  }
};
