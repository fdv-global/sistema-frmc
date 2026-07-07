/**
 * FRMC — Coachees
 * Listagem dos coachees vinculados ao coach logado. RLS filtra
 * automaticamente via coach_atual_id() — nenhum join manual com
 * coach_coachee é necessário no client.
 */

import { supabase } from './supabase-client.js';

export async function listCoachees() {
  const { data, error } = await supabase.from('coachees').select('*');
  if (error) throw error;
  return data;
}

export function coacheeInitials(nomeCasual) {
  if (!nomeCasual) return '?';
  return nomeCasual
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
