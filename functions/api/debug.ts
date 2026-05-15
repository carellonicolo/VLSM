/**
 * Endpoint diagnostico: NON espone valori, solo presenza/assenza dei binding.
 * Da rimuovere o nascondere dopo il setup iniziale se vuoi essere paranoico.
 */
import type { SharedEnv } from '../_lib/shared';

export const onRequestGet: PagesFunction<SharedEnv> = async ({ env }) => {
  const info: Record<string, unknown> = {
    hasDB: typeof env.DB !== 'undefined' && env.DB !== null,
    hasAppPassword: !!env.APP_PASSWORD,
    hasAdminPassword: !!env.ADMIN_PASSWORD,
    hasViteAppPassword: !!env.VITE_APP_PASSWORD,
    hasViteAdminPassword: !!env.VITE_ADMIN_PASSWORD,
  };

  // Tenta una query banale per verificare la connessione e lo schema.
  if (info.hasDB) {
    try {
      const row = await env.DB.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'`
      ).first();
      info.schemaApplied = !!row;
    } catch (e) {
      info.dbError = e instanceof Error ? e.message : String(e);
      info.schemaApplied = false;
    }
  }

  return new Response(JSON.stringify(info, null, 2), {
    headers: { 'content-type': 'application/json' },
  });
};
