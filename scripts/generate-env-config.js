/**
 * Gera js/env-config.js a partir do .env na raiz do projeto.
 * O client vanilla não lê .env diretamente no browser — este script
 * materializa as chaves públicas do Supabase em um arquivo carregado
 * via <script> antes de supabase-client.js.
 *
 * Uso: npm run env:generate  (ou: node scripts/generate-env-config.js)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const OUTPUT_PATH = path.join(ROOT, 'js', 'env-config.js');

function parseEnv(content) {
  const vars = {};
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    vars[key] = value;
  }
  return vars;
}

if (!fs.existsSync(ENV_PATH)) {
  console.error('[env-config] .env não encontrado na raiz do projeto.');
  process.exit(1);
}

const env = parseEnv(fs.readFileSync(ENV_PATH, 'utf8'));
const SUPABASE_URL = env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[env-config] SUPABASE_URL ou SUPABASE_ANON_KEY vazios no .env — preencha antes de testar login.');
}

const output = `/**
 * GERADO AUTOMATICAMENTE por scripts/generate-env-config.js — NÃO editar à mão.
 * Fonte: .env (não versionado). Regenere com: npm run env:generate
 */
window.__ENV__ = {
  SUPABASE_URL: ${JSON.stringify(SUPABASE_URL)},
  SUPABASE_ANON_KEY: ${JSON.stringify(SUPABASE_ANON_KEY)},
};
`;

fs.writeFileSync(OUTPUT_PATH, output, 'utf8');
console.log('[env-config] js/env-config.js gerado a partir de .env');
