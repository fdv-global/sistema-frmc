/**
 * FRMC — Ciclos e Sessões (navegação real do coachee)
 * Bloco B.
 */

import { supabase } from './supabase-client.js';

/**
 * Coachee + seus ciclos + as sessões de cada ciclo, num único round-trip
 * via embed do PostgREST (mesmo padrão de getSessaoComContexto em
 * sessoes.js). RLS já escopa tudo ao coach logado.
 */
export async function getCoacheeComCiclos(coacheeId) {
  const { data, error } = await supabase
    .from('coachees')
    .select('*, ciclos(*, sessoes(*))')
    .eq('id', coacheeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getCoachAtual() {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: coach, error } = await supabase
    .from('coaches')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  if (error) throw error;
  return coach;
}

/**
 * ciclos.coach_id é NOT NULL sem default — precisa resolver o coach logado
 * antes do insert. data_inicio e status têm default no banco (current_date
 * e 'ativo'), mas status é enviado explicitamente por clareza.
 */
export async function criarCiclo(coacheeId, tipo) {
  const coach = await getCoachAtual();
  const { data, error } = await supabase
    .from('ciclos')
    .insert({ coachee_id: coacheeId, coach_id: coach.id, tipo, status: 'ativo' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

function hojeISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * numero é MAX(numero)+1 dentro do ciclo, calculado a partir das sessões já
 * carregadas na página (evita round-trip extra pro banco). data recebe a
 * data de hoje (agendamento imediato) — sem UI de escolha de data neste
 * escopo.
 */
export async function criarSessao(cicloId, sessoesExistentes) {
  const maiorNumero = sessoesExistentes.reduce((max, s) => Math.max(max, s.numero ?? 0), 0);
  const { data, error } = await supabase
    .from('sessoes')
    .insert({ ciclo_id: cicloId, numero: maiorNumero + 1, data: hojeISO(), status: 'agendada' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export const SESSAO_STATUS_INFO = {
  agendada: { label: 'Agendada', badgeClass: 'badge--neutral' },
  realizada: { label: 'Realizada', badgeClass: 'badge--gold' },
  finalizada: { label: 'Finalizada', badgeClass: 'badge--success' },
};

export function renderSessaoStatusBadge(status) {
  const info = SESSAO_STATUS_INFO[status] || { label: status, badgeClass: 'badge--neutral' };
  return `<span class="badge ${info.badgeClass}">${info.label}</span>`;
}
