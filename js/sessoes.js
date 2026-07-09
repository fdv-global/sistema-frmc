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

export const CLASSIFICACAO_INFO = {
  plenitude: { label: 'Plenitude', color: 'var(--color-mint)' },
  bom: { label: 'Bom', color: 'var(--color-bom)' },
  critico: { label: 'Crítico', color: 'var(--color-warning)' },
  muito_critico: { label: 'Muito crítico', color: 'var(--color-alerta-suave)' },
};

export function isNotaValida(valor) {
  return Number.isInteger(valor) && valor >= 0 && valor <= 10;
}

/**
 * Radar SVG (11 eixos). Recalculado no client a partir dos valores dos
 * inputs — não depende de salvar antes.
 */
const RADAR_SIZE = 320;
const RADAR_CENTER = RADAR_SIZE / 2;
const RADAR_MAX_R = 118;
const RADAR_LABEL_R = RADAR_MAX_R + 26;
const RADAR_ANEIS = [2, 4, 6, 8, 10];

function pontoRadar(indice, total, raio) {
  const angulo = (Math.PI * 2 * indice) / total - Math.PI / 2;
  return {
    x: RADAR_CENTER + raio * Math.cos(angulo),
    y: RADAR_CENTER + raio * Math.sin(angulo),
  };
}

/**
 * As cores abaixo duplicam os tokens de css/tokens.css como valores literais
 * (não var(...)) de propósito: quando o SVG é exportado pro PDF, ele é
 * serializado sozinho (sem acesso a components.css nem às custom properties
 * do documento), então precisa se sustentar sozinho com atributos inline.
 * As classes CSS (rv-radar-*) continuam sendo a fonte de verdade pra tela;
 * isto aqui é só o fallback pro rasterizador.
 */
const RADAR_COR_GRADE = 'rgba(255,255,255,0.12)';
const RADAR_COR_LABEL = 'rgba(255,255,255,0.65)';
const RADAR_COR_ATUAL_FILL = 'rgba(10,71,81,0.45)';
const RADAR_COR_ATUAL_STROKE = '#0D5A67';
const RADAR_COR_DESEJADO_FILL = 'rgba(206,146,33,0.25)';
const RADAR_COR_DESEJADO_STROKE = '#CE9221';

export function renderRadarSvgContent(valores) {
  const total = AREAS_RODA_VIDA.length;

  const grades = RADAR_ANEIS.map((nivel) => {
    const raio = (nivel / 10) * RADAR_MAX_R;
    const pontos = AREAS_RODA_VIDA.map((_, i) => {
      const p = pontoRadar(i, total, raio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon class="rv-radar-grid" points="${pontos}" fill="none" stroke="${RADAR_COR_GRADE}" stroke-width="1"/>`;
  }).join('');

  const eixos = AREAS_RODA_VIDA.map((_, i) => {
    const p = pontoRadar(i, total, RADAR_MAX_R);
    return `<line class="rv-radar-axis" x1="${RADAR_CENTER}" y1="${RADAR_CENTER}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${RADAR_COR_GRADE}" stroke-width="1"/>`;
  }).join('');

  const labels = AREAS_RODA_VIDA.map((area, i) => {
    const p = pontoRadar(i, total, RADAR_LABEL_R);
    const anchor = p.x < RADAR_CENTER - 8 ? 'end' : p.x > RADAR_CENTER + 8 ? 'start' : 'middle';
    return `<text class="rv-radar-label" x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="${anchor}" fill="${RADAR_COR_LABEL}" font-size="10">${area.label}</text>`;
  }).join('');

  const poligono = (campo, cls, fill, stroke) => {
    const pontos = AREAS_RODA_VIDA.map((area, i) => {
      const valor = valores?.[area.key]?.[campo];
      const raio = (Math.max(0, Math.min(10, valor ?? 0)) / 10) * RADAR_MAX_R;
      const p = pontoRadar(i, total, raio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon class="${cls}" points="${pontos}" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`;
  };

  const poligonoDesejado = poligono('desejado', 'rv-radar-desejado', RADAR_COR_DESEJADO_FILL, RADAR_COR_DESEJADO_STROKE);
  const poligonoAtual = poligono('atual', 'rv-radar-atual', RADAR_COR_ATUAL_FILL, RADAR_COR_ATUAL_STROKE);

  return `${grades}${eixos}${poligonoDesejado}${poligonoAtual}${labels}`;
}

/**
 * Grava os 22 valores em avaliacoes_roda_vida (upsert por sessao_id —
 * unique constraint já garante 1 avaliação por sessão). media_atual e
 * classificacao voltam calculados pelo banco na linha retornada.
 */
export async function salvarAvaliacaoRodaVida(sessaoId, valores) {
  const payload = { sessao_id: sessaoId };
  for (const { key } of AREAS_RODA_VIDA) {
    payload[`atual_${key}`] = valores[key].atual;
    payload[`desejado_${key}`] = valores[key].desejado;
  }

  const { data, error } = await supabase
    .from('avaliacoes_roda_vida')
    .upsert(payload, { onConflict: 'sessao_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
