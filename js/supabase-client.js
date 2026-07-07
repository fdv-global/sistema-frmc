/**
 * FRMC — Cliente Supabase
 * Instância única do client, consumida por auth.js, coachees.js, ciclos.js,
 * sessoes.js e admin.js. Depende de window.__ENV__ (ver js/env-config.js,
 * gerado via `npm run env:generate` a partir de .env).
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.__ENV__ || {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[FRMC] SUPABASE_URL/SUPABASE_ANON_KEY ausentes. Rode "npm run env:generate" após preencher o .env.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
