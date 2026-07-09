/**
 * FRMC — Exportação PDF da Roda da Vida (Bloco B)
 * PDF intencionalmente incompleto: só a Roda da Vida desta sessão.
 * A versão completa da sessão é do Bloco F.
 */

import { AREAS_RODA_VIDA, CLASSIFICACAO_INFO } from './sessoes.js';

const CLASSIFICACAO_HEX = {
  plenitude: '#5DCAA5',
  bom: '#3E8C7A',
  critico: '#C98A1C',
  muito_critico: '#C97355',
};

function svgParaPngDataUrl(svgEl) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    const box = svgEl.viewBox.baseVal;
    const width = box && box.width ? box.width : 360;
    const height = box && box.height ? box.height : 360;
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const svgData = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0F1517';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Gera e baixa o PDF da Roda da Vida.
 * @param {object} params
 * @param {string} params.coacheeNome
 * @param {string} params.sessaoData - data da sessão já formatada
 * @param {Record<string, {atual:number, desejado:number}>} params.valores
 * @param {number} params.media - media_atual vinda do banco
 * @param {string} params.classificacao - valor cru vindo do banco
 * @param {SVGElement} params.radarEl
 */
export async function exportarRodaVidaPdf({ coacheeNome, sessaoData, valores, media, classificacao, radarEl }) {
  const { jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/+esm');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor('#0A4751');
  doc.text('FRMC', marginX, y);

  doc.setFontSize(13);
  doc.setTextColor('#1A1A1A');
  y += 22;
  doc.text('Roda da Vida', marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#5C5C5C');
  y += 16;
  doc.text(`Coachee: ${coacheeNome}`, marginX, y);
  y += 14;
  doc.text(`Sessão: ${sessaoData}`, marginX, y);

  y += 24;
  const { dataUrl, width, height } = await svgParaPngDataUrl(radarEl);
  const imgW = 220;
  const imgH = (height / width) * imgW;
  doc.addImage(dataUrl, 'PNG', marginX, y, imgW, imgH);

  const classInfo = CLASSIFICACAO_INFO[classificacao] || { label: classificacao };
  const classHex = CLASSIFICACAO_HEX[classificacao] || '#1A1A1A';
  const infoX = marginX + imgW + 32;
  let infoY = y + 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#5C5C5C');
  doc.text('Média atual', infoX, infoY);
  infoY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor('#0A4751');
  doc.text(media != null ? media.toFixed(1) : '—', infoX, infoY);

  infoY += 28;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#5C5C5C');
  doc.text('Classificação', infoX, infoY);
  infoY += 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(classHex);
  doc.text(classInfo.label, infoX, infoY);

  y += imgH + 32;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#0A4751');
  doc.text('Áreas avaliadas', marginX, y);

  y += 16;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#5C5C5C');
  const col1 = marginX;
  const col2 = marginX + 220;
  const col3 = marginX + 320;
  doc.text('Área', col1, y);
  doc.text('Atual', col2, y);
  doc.text('Desejado', col3, y);
  y += 6;
  doc.setDrawColor('#E4DFD6');
  doc.line(marginX, y, pageWidth - marginX, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#1A1A1A');
  for (const { key, label } of AREAS_RODA_VIDA) {
    y += 18;
    const valor = valores[key] || {};
    doc.text(label, col1, y);
    doc.text(String(valor.atual ?? '—'), col2, y);
    doc.text(String(valor.desejado ?? '—'), col3, y);
  }

  y += 32;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor('#5C5C5C');
  doc.text(
    'Este documento contém apenas a Roda da Vida desta sessão. O relatório completo de sessão será gerado em uma etapa futura.',
    marginX,
    y,
    { maxWidth: pageWidth - marginX * 2 }
  );

  const nomeArquivo = `roda-da-vida-${coacheeNome.trim().toLowerCase().replace(/\s+/g, '-')}.pdf`;
  doc.save(nomeArquivo);
}
