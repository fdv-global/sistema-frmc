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

/**
 * Anel de progresso (média 0-10 da última Roda da Vida aplicada).
 * `media` é null enquanto o Bloco B (Roda da Vida) não entrega dado real —
 * renderiza o estado tracejado vazio nesse caso.
 */
export function renderProgressRing(media) {
  const size = 48;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (media == null) {
    return `
      <svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle class="progress-ring-track--empty" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke-width="${stroke}" stroke-dasharray="4 4"/>
        <line class="progress-ring-dash" x1="${center - 6}" y1="${center}" x2="${center + 6}" y2="${center}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }

  const pct = Math.max(0, Math.min(10, media)) / 10;
  const offset = circumference * (1 - pct);
  return `
    <svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle class="progress-ring-track" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke-width="${stroke}"/>
      <circle class="progress-ring-fill" cx="${center}" cy="${center}" r="${radius}" fill="none" stroke-width="${stroke}"
        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
        transform="rotate(-90 ${center} ${center})"/>
      <text class="progress-ring-value" x="50%" y="50%" text-anchor="middle" dominant-baseline="central">${media.toFixed(1)}</text>
    </svg>
  `;
}

/**
 * Badges de status/tipo do ciclo mais recente. `ciclo` é null enquanto o
 * Bloco B (ciclos) não entrega dado real — renderiza "Sem ciclo iniciado".
 */
export function renderCicloBadges(ciclo) {
  if (!ciclo) {
    return `<span class="badge badge--neutral">Sem ciclo iniciado</span>`;
  }
  const statusBadge = ciclo.status === 'ativo'
    ? `<span class="badge badge--success">Ciclo ativo</span>`
    : `<span class="badge badge--neutral">Ciclo finalizado</span>`;
  const tipoBadge = ciclo.tipo === 'experimental'
    ? `<span class="badge badge--gold">Experimental</span>`
    : `<span class="badge badge--gold">Completo</span>`;
  return statusBadge + tipoBadge;
}
