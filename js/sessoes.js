/**
 * FRMC — Sessões / Roda da Vida
 * Bloco B.
 */

import { supabase } from './supabase-client.js';

export const AREAS_RODA_VIDA = [
  {
    key: 'espiritual',
    label: 'Espiritual',
    icon: '<path d="M12 3l1.8 5.6L19 10l-5.2 1.4L12 17l-1.8-5.6L5 10l5.2-1.4L12 3z"/>',
  },
  {
    key: 'emocional',
    label: 'Emocional',
    icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  },
  {
    key: 'parentes',
    label: 'Parentes',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    key: 'conjugal',
    label: 'Conjugal',
    icon: '<circle cx="8" cy="14" r="5"/><circle cx="16" cy="14" r="5"/>',
  },
  {
    key: 'filhos',
    label: 'Filhos',
    icon: '<circle cx="12" cy="7" r="2.5"/><path d="M7.5 21v-1.5a4.5 4.5 0 0 1 9 0V21"/>',
  },
  {
    key: 'social',
    label: 'Social',
    icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    key: 'saude',
    label: 'Saúde',
    icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  },
  {
    key: 'servir',
    label: 'Servir',
    icon: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  },
  {
    key: 'intelectual',
    label: 'Intelectual',
    icon: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    icon: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  },
  {
    key: 'profissional',
    label: 'Profissional',
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  },
];

/**
 * Sessão + ciclo + coachee (join implícito via PostgREST, sem precisar
 * conhecer os nomes exatos das FKs).
 */
export async function getSessaoComContexto(sessaoId) {
  const { data, error } = await supabase
    .from('sessoes')
    .select('*, ciclos(*, coachees(*))')
    .eq('id', sessaoId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAvaliacaoRodaVida(sessaoId) {
  const { data, error } = await supabase
    .from('avaliacoes_roda_vida')
    .select('*')
    .eq('sessao_id', sessaoId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function isNotaValida(valor) {
  return Number.isInteger(valor) && valor >= 0 && valor <= 10;
}
