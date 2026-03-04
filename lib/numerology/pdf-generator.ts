/**
 * PDF Generator for Numerologie PRO Psychomatrix
 *
 * Generates a premium PDF report using jsPDF with dark navy + gold theme
 * matching the website design.
 */

import jsPDF from 'jspdf';
import type { MatrixResult } from './calculate';
import { getPositionTieredInterpretation, getLineInterpretation } from './interpret';
import { getDateLocale } from '@/lib/i18n/admin';

// Colors (matching website theme)
const NAVY = { r: 10, g: 37, b: 51 };        // #0a2533
const NAVY_LIGHT = { r: 13, g: 45, b: 66 };  // #0d2d42
const GOLD = { r: 212, g: 175, b: 55 };       // #d4af37
const WHITE = { r: 255, g: 255, b: 255 };
const WHITE_60 = { r: 157, g: 162, b: 170 };  // white/60 on navy
const WHITE_40 = { r: 108, g: 112, b: 120 };  // white/40 on navy

const PAGE_WIDTH = 210; // A4
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;

type RGB = { r: number; g: number; b: number };

function setColor(doc: jsPDF, color: RGB) {
  doc.setTextColor(color.r, color.g, color.b);
}

function setFillColor(doc: jsPDF, color: RGB) {
  doc.setFillColor(color.r, color.g, color.b);
}

function drawGoldLine(doc: jsPDF, y: number) {
  doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
}

function addNewPageIfNeeded(doc: jsPDF, currentY: number, requiredSpace: number): number {
  if (currentY + requiredSpace > PAGE_HEIGHT - 25) {
    doc.addPage();
    // Background for new page
    setFillColor(doc, NAVY);
    doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
    return 20;
  }
  return currentY;
}

const POSITION_NAMES = {
  de: ['', 'Charakter', 'Energie', 'Kreativität', 'Gesundheit', 'Logik', 'Arbeit', 'Glück', 'Pflicht', 'Intelligenz'],
  ru: ['', 'Характер', 'Энергия', 'Творчество', 'Здоровье', 'Логика', 'Труд', 'Удача', 'Долг', 'Интеллект'],
};

const LINE_LABELS = {
  de: { row1: 'Ziel', row2: 'Familie', row3: 'Gewohnheit', col1: 'Selbstwert', col2: 'Alltag', col3: 'Talent', diagonalUp: 'Temperament', diagonalDown: 'Spiritualität' },
  ru: { row1: 'Цель', row2: 'Семья', row3: 'Привычки', col1: 'Самооценка', col2: 'Быт', col3: 'Талант', diagonalUp: 'Темперамент', diagonalDown: 'Духовность' },
};

const LINE_CONFIGS = [
  { key: 'row1', positions: [1, 4, 7], getCount: (r: MatrixResult) => r.lines.rows[0] },
  { key: 'row2', positions: [2, 5, 8], getCount: (r: MatrixResult) => r.lines.rows[1] },
  { key: 'row3', positions: [3, 6, 9], getCount: (r: MatrixResult) => r.lines.rows[2] },
  { key: 'col1', positions: [1, 2, 3], getCount: (r: MatrixResult) => r.lines.columns[0] },
  { key: 'col2', positions: [4, 5, 6], getCount: (r: MatrixResult) => r.lines.columns[1] },
  { key: 'col3', positions: [7, 8, 9], getCount: (r: MatrixResult) => r.lines.columns[2] },
  { key: 'diagonalDown', positions: [1, 5, 9], getCount: (r: MatrixResult) => r.lines.diagonalDown },
  { key: 'diagonalUp', positions: [3, 5, 7], getCount: (r: MatrixResult) => r.lines.diagonalUp },
];

const WN_LABELS = {
  de: ['Schicksalszahl', 'Seelenzahl', 'Kosmische Zahl', 'Inneres Ich'],
  ru: ['Число судьбы', 'Число души', 'Космическое число', 'Внутреннее Я'],
};

/**
 * Internal: builds the PDF and returns the jsPDF document instance.
 */
function buildPDF(
  result: MatrixResult,
  birthdate: string,
  locale: 'de' | 'ru'
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // --- Page 1 Background ---
  setFillColor(doc, NAVY);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  let y = 25;

  // --- Header ---
  setColor(doc, GOLD);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('NUMEROLOGIE PRO', PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  setColor(doc, WHITE_60);
  const subtitle = locale === 'de'
    ? 'Deine persönliche Psychomatrix-Analyse'
    : 'Твой персональный анализ психоматрицы';
  doc.text(subtitle, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 10;

  drawGoldLine(doc, y);
  y += 8;

  // --- Birthdate + Date ---
  setColor(doc, WHITE);
  doc.setFontSize(10);
  const bdLabel = locale === 'de' ? 'Geburtsdatum:' : 'Дата рождения:';
  doc.text(`${bdLabel} ${birthdate}`, MARGIN, y);

  const dateLabel = locale === 'de' ? 'Erstellt am:' : 'Создано:';
  const today = new Date().toLocaleDateString(getDateLocale(locale));
  doc.text(`${dateLabel} ${today}`, PAGE_WIDTH - MARGIN, y, { align: 'right' });
  y += 10;

  // --- Working Numbers ---
  const wnTitle = locale === 'de' ? 'ARBEITSZAHLEN' : 'РАБОЧИЕ ЧИСЛА';
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(wnTitle, MARGIN, y);
  y += 6;

  const wnBoxWidth = (CONTENT_WIDTH - 9) / 4; // 4 boxes with 3px gap
  for (let i = 0; i < 4; i++) {
    const x = MARGIN + i * (wnBoxWidth + 3);

    // Box background
    setFillColor(doc, NAVY_LIGHT);
    doc.roundedRect(x, y, wnBoxWidth, 18, 2, 2, 'F');

    // Gold border
    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, wnBoxWidth, 18, 2, 2, 'S');

    // Label
    setColor(doc, WHITE_40);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(WN_LABELS[locale][i], x + wnBoxWidth / 2, y + 6, { align: 'center' });

    // Number
    setColor(doc, GOLD);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(result.workingNumbers[i]), x + wnBoxWidth / 2, y + 14, { align: 'center' });
  }
  y += 26;

  // --- Matrix Grid (matches website layout: 4 cols × 5 rows) ---
  const matrixTitle = locale === 'de' ? 'PSYCHOMATRIX' : 'ПСИХОМАТРИЦА';
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(matrixTitle, MARGIN, y);
  y += 6;

  const cellSize = 28;
  const lineCell = 16; // smaller cells for line values
  const gridGap = 3;
  const gridWidth = cellSize * 3 + lineCell + gridGap * 3;
  const gridStartX = (PAGE_WIDTH - gridWidth) / 2;
  const names = POSITION_NAMES[locale];
  const ll = LINE_LABELS[locale];
  const { rows, columns, diagonalDown, diagonalUp } = result.lines;

  // Helper: draw a small line-value cell (label + number)
  function drawLineCell(x: number, cy: number, w: number, h: number, label: string, value: number, isGold = false) {
    setFillColor(doc, isGold ? { r: 15, g: 40, b: 30 } : NAVY_LIGHT);
    doc.roundedRect(x, cy, w, h, 2, 2, 'F');
    doc.setDrawColor(isGold ? GOLD.r : 50, isGold ? GOLD.g : 60, isGold ? GOLD.b : 80);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, cy, w, h, 2, 2, 'S');
    // Label
    setColor(doc, WHITE_60);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + w / 2, cy + h / 2 - 2, { align: 'center' });
    // Value
    setColor(doc, GOLD);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), x + w / 2, cy + h / 2 + 4, { align: 'center' });
  }

  // Row 0: Birthdate header (span 3 cols) + Temperament
  const headerH = 14;
  const headerX = gridStartX;
  const headerW = cellSize * 3 + gridGap * 2;
  setFillColor(doc, NAVY_LIGHT);
  doc.roundedRect(headerX, y, headerW, headerH, 2, 2, 'F');
  doc.setDrawColor(50, 60, 80);
  doc.setLineWidth(0.2);
  doc.roundedRect(headerX, y, headerW, headerH, 2, 2, 'S');
  setColor(doc, WHITE_60);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text(locale === 'de' ? 'GEBURTSDATUM' : 'ДАТА РОЖДЕНИЯ', headerX + headerW / 2, y + 5, { align: 'center' });
  setColor(doc, GOLD);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(birthdate, headerX + headerW / 2, y + 11, { align: 'center' });

  // Temperament (top-right)
  const tempX = gridStartX + headerW + gridGap;
  drawLineCell(tempX, y, lineCell, headerH, ll.diagonalUp, diagonalUp, true);
  y += headerH + gridGap;

  // Rows 1-3: Position cells + row line values
  const rowPositions = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
  const rowLabels = [ll.row1, ll.row2, ll.row3];

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const pos = rowPositions[r][c];
      const cx = gridStartX + c * (cellSize + gridGap);
      const cy = y;
      const digits = result.grid[pos] || [];
      const count = digits.length;

      // Cell background
      const bgAlpha = count === 0 ? 0.3 : count >= 3 ? 0.8 : 0.5;
      setFillColor(doc, {
        r: Math.round(NAVY_LIGHT.r * bgAlpha + NAVY.r * (1 - bgAlpha)),
        g: Math.round(NAVY_LIGHT.g * bgAlpha + NAVY.g * (1 - bgAlpha)),
        b: Math.round(NAVY_LIGHT.b * bgAlpha + NAVY.b * (1 - bgAlpha)),
      });
      doc.roundedRect(cx, cy, cellSize, cellSize, 2, 2, 'F');

      // Gold border
      const borderAlpha = count === 0 ? 0.15 : count >= 3 ? 0.7 : 0.3;
      doc.setDrawColor(
        Math.round(GOLD.r * borderAlpha + NAVY.r * (1 - borderAlpha)),
        Math.round(GOLD.g * borderAlpha + NAVY.g * (1 - borderAlpha)),
        Math.round(GOLD.b * borderAlpha + NAVY.b * (1 - borderAlpha))
      );
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, cy, cellSize, cellSize, 2, 2, 'S');

      // Position number (top-left)
      setColor(doc, WHITE_40);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(String(pos), cx + 2.5, cy + 4.5);

      // Position name (below number)
      setColor(doc, WHITE_60);
      doc.setFontSize(5.5);
      doc.text(names[pos], cx + cellSize / 2, cy + 8, { align: 'center' });

      // Digits or dash
      if (count > 0) {
        setColor(doc, GOLD);
        const fontSize = count >= 5 ? 11 : count >= 3 ? 14 : 16;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', 'bold');
      } else {
        setColor(doc, WHITE_40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(count > 0 ? digits.join('') : '—', cx + cellSize / 2, cy + 17, { align: 'center' });

      // Count label
      if (count > 0) {
        setColor(doc, WHITE_60);
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.text(`${count}x`, cx + cellSize / 2, cy + 21.5, { align: 'center' });
      }

      // Strength dots
      for (let d = 0; d < 5; d++) {
        const dotX = cx + cellSize / 2 - 8 + d * 4;
        const dotY = cy + 25;
        if (d < Math.min(count, 5)) {
          setFillColor(doc, GOLD);
        } else {
          setFillColor(doc, { r: 40, g: 50, b: 70 });
        }
        doc.circle(dotX, dotY, 0.8, 'F');
      }
    }

    // Row line value (right side)
    const rvX = gridStartX + 3 * (cellSize + gridGap);
    drawLineCell(rvX, y, lineCell, cellSize, rowLabels[r], rows[r]);

    y += cellSize + gridGap;
  }

  // Bottom row: Column values + Spiritualität
  const colLabels = [ll.col1, ll.col2, ll.col3];
  for (let c = 0; c < 3; c++) {
    const cx = gridStartX + c * (cellSize + gridGap);
    drawLineCell(cx, y, cellSize, lineCell, colLabels[c], columns[c]);
  }
  // Spiritualität (bottom-right)
  drawLineCell(gridStartX + 3 * (cellSize + gridGap), y, lineCell, lineCell, ll.diagonalDown, diagonalDown, true);

  y += lineCell + 10;

  // --- Position Interpretations ---
  drawGoldLine(doc, y);
  y += 8;

  const posTitle = locale === 'de' ? 'POSITIONEN — INTERPRETATION' : 'ПОЗИЦИИ — ИНТЕРПРЕТАЦИЯ';
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(posTitle, MARGIN, y);
  y += 7;

  for (let pos = 1; pos <= 9; pos++) {
    const digits = result.grid[pos] || [];
    const interp = getPositionTieredInterpretation(pos, digits.length, locale);

    // Use full text for PDF (premium content)
    const fullText = interp.full || interp.description;
    const estimatedLines = Math.ceil(fullText.length / 80);
    y = addNewPageIfNeeded(doc, y, 12 + estimatedLines * 3.5);

    // Position number badge
    setFillColor(doc, NAVY_LIGHT);
    doc.circle(MARGIN + 4, y + 3, 4, 'F');
    doc.setDrawColor(GOLD.r, GOLD.g, GOLD.b);
    doc.setLineWidth(0.2);
    doc.circle(MARGIN + 4, y + 3, 4, 'S');
    setColor(doc, GOLD);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(String(pos), MARGIN + 4, y + 4.5, { align: 'center' });

    // Title + digit count
    setColor(doc, WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(interp.title, MARGIN + 12, y + 4);

    const digitStr = digits.length > 0 ? digits.join('') : '—';
    setColor(doc, GOLD);
    doc.text(digitStr, PAGE_WIDTH - MARGIN, y + 4, { align: 'right' });

    // Full interpretation text
    y += 7;
    setColor(doc, WHITE_60);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(fullText, CONTENT_WIDTH - 12);
    doc.text(descLines, MARGIN + 12, y);
    y += descLines.length * 3.5 + 5;
  }

  // --- Lines Analysis ---
  y = addNewPageIfNeeded(doc, y, 30);
  drawGoldLine(doc, y);
  y += 8;

  const linesTitle = locale === 'de' ? 'LINIEN-ANALYSE' : 'АНАЛИЗ ЛИНИЙ';
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(linesTitle, MARGIN, y);
  y += 7;

  for (const lineConfig of LINE_CONFIGS) {
    const count = lineConfig.getCount(result);
    const interp = getLineInterpretation(lineConfig.key, count, locale);

    y = addNewPageIfNeeded(doc, y, 18);

    // Position indicators
    setColor(doc, WHITE_40);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    const posStr = `[${lineConfig.positions.join(',')}]`;
    doc.text(posStr, MARGIN, y + 3.5);

    // Title
    setColor(doc, WHITE);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(interp.title, MARGIN + 18, y + 3.5);

    // Count
    setColor(doc, GOLD);
    doc.setFontSize(8.5);
    doc.text(String(count), PAGE_WIDTH - MARGIN, y + 3.5, { align: 'right' });

    // Strength dots
    for (let d = 0; d < 5; d++) {
      const dotX = PAGE_WIDTH - MARGIN - 18 + d * 3;
      const dotY = y + 3;
      if (d < Math.min(count, 5)) {
        setFillColor(doc, GOLD);
      } else {
        setFillColor(doc, { r: 40, g: 50, b: 70 });
      }
      doc.circle(dotX, dotY, 0.6, 'F');
    }

    // Description
    y += 6;
    setColor(doc, WHITE_60);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(interp.description, CONTENT_WIDTH - 18);
    doc.text(lines, MARGIN + 18, y);
    y += lines.length * 3.2 + 4;
  }

  // --- Deep Analysis: Personality Profile ---
  y = addNewPageIfNeeded(doc, y, 40);
  drawGoldLine(doc, y);
  y += 8;

  const profileTitle = locale === 'de' ? 'PERSÖNLICHKEITSPROFIL — TIEFENANALYSE' : 'ПРОФИЛЬ ЛИЧНОСТИ — ГЛУБОКИЙ АНАЛИЗ';
  setColor(doc, GOLD);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(profileTitle, MARGIN, y);
  y += 8;

  // Stärken & Schwächen
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const STRENGTH_LABELS = {
    de: ['', 'Charakter', 'Energie', 'Kreativität', 'Gesundheit', 'Logik', 'Arbeit', 'Glück', 'Pflicht', 'Intelligenz'],
    ru: ['', 'Характер', 'Энергия', 'Творчество', 'Здоровье', 'Логика', 'Труд', 'Удача', 'Долг', 'Интеллект'],
  };

  for (let p = 1; p <= 9; p++) {
    const count = (result.grid[p] || []).length;
    const name = STRENGTH_LABELS[locale][p];
    if (count >= 3) strengths.push(`${name} (${count})`);
    else if (count === 0) weaknesses.push(name);
  }

  // Strengths box
  y = addNewPageIfNeeded(doc, y, 30);
  setFillColor(doc, { r: 15, g: 50, b: 35 }); // dark green tint
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'F');
  doc.setDrawColor(80, 180, 100);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'S');

  setColor(doc, { r: 120, g: 220, b: 140 });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const strengthsLabel = locale === 'de' ? 'DEINE STÄRKEN' : 'ВАШИ СИЛЬНЫЕ СТОРОНЫ';
  doc.text(strengthsLabel, MARGIN + 5, y + 6);

  setColor(doc, WHITE_60);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const strengthsText = strengths.length > 0
    ? strengths.join(', ')
    : (locale === 'de' ? 'Keine stark ausgeprägten Positionen' : 'Нет ярко выраженных позиций');
  doc.text(strengthsText, MARGIN + 5, y + 13);
  y += 24;

  // Weaknesses box
  y = addNewPageIfNeeded(doc, y, 30);
  setFillColor(doc, { r: 50, g: 25, b: 15 }); // dark orange tint
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'F');
  doc.setDrawColor(200, 130, 50);
  doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'S');

  setColor(doc, { r: 230, g: 160, b: 70 });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const weaknessLabel = locale === 'de' ? 'ENTWICKLUNGSPOTENZIAL' : 'ПОТЕНЦИАЛ РАЗВИТИЯ';
  doc.text(weaknessLabel, MARGIN + 5, y + 6);

  setColor(doc, WHITE_60);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const weaknessText = weaknesses.length > 0
    ? weaknesses.join(', ')
    : (locale === 'de' ? 'Alle Positionen besetzt — ausgeglichenes Profil' : 'Все позиции заполнены — сбалансированный профиль');
  doc.text(weaknessText, MARGIN + 5, y + 13);
  y += 26;

  // Total digits analysis
  y = addNewPageIfNeeded(doc, y, 25);
  const totalDigits = result.totalDigits;
  const balanceLabel = locale === 'de' ? 'GESAMTBILANZ' : 'ОБЩИЙ БАЛАНС';
  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(balanceLabel, MARGIN, y);

  setColor(doc, WHITE);
  doc.setFontSize(12);
  doc.text(String(totalDigits), MARGIN + 35, y);

  setColor(doc, WHITE_60);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(locale === 'de' ? 'Ziffern in der Matrix' : 'цифр в матрице', MARGIN + 45, y);
  y += 6;

  let balanceText = '';
  if (locale === 'de') {
    if (totalDigits <= 10) balanceText = 'Wenige Ziffern — du bist ein Freigeist mit großem Entwicklungspotenzial. Konzentriere dich auf deine vorhandenen Stärken und baue sie systematisch aus.';
    else if (totalDigits <= 15) balanceText = 'Ausgeglichene Verteilung — eine harmonische Matrix mit einer guten Mischung aus Stärken und Entwicklungsbereichen. Du hast vielseitige Talente.';
    else balanceText = 'Viele Ziffern — eine kraftvolle Matrix mit intensiven Energien. Du hast starke Ausprägungen und solltest darauf achten, deine Energie gezielt einzusetzen.';
  } else {
    if (totalDigits <= 10) balanceText = 'Мало цифр — вы свободный дух с большим потенциалом развития. Сосредоточьтесь на имеющихся сильных сторонах и системно развивайте их.';
    else if (totalDigits <= 15) balanceText = 'Сбалансированное распределение — гармоничная матрица с хорошим сочетанием сильных сторон и зон развития. У вас разносторонние таланты.';
    else balanceText = 'Много цифр — мощная матрица с интенсивными энергиями. У вас ярко выраженные качества, и важно направлять энергию целенаправленно.';
  }

  const balanceLines = doc.splitTextToSize(balanceText, CONTENT_WIDTH);
  doc.text(balanceLines, MARGIN, y);
  y += balanceLines.length * 3.2 + 6;

  // Practical recommendations
  y = addNewPageIfNeeded(doc, y, 30);
  const recsTitle = locale === 'de' ? 'PRAKTISCHE EMPFEHLUNGEN' : 'ПРАКТИЧЕСКИЕ РЕКОМЕНДАЦИИ';
  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(recsTitle, MARGIN, y);
  y += 6;

  const recs: string[] = [];
  if (locale === 'de') {
    if ((result.grid[1] || []).length >= 3) recs.push('Dein starker Charakter eignet sich für Führungspositionen. Suche Rollen, in denen du Verantwortung übernehmen kannst.');
    if ((result.grid[2] || []).length === 0) recs.push('Stärke deine Energie durch regelmäßige Bewegung, Meditation oder Naturaufenthalte.');
    if ((result.grid[5] || []).length >= 2) recs.push('Deine analytischen Fähigkeiten sind ausgeprägt. Nutze sie für strategische Planung und Problemlösung.');
    if ((result.grid[6] || []).length >= 3) recs.push('Deine Arbeitsmoral ist beeindruckend. Achte darauf, auch Pausen einzuplanen und Work-Life-Balance zu halten.');
    if ((result.grid[9] || []).length >= 2) recs.push('Dein scharfer Verstand eignet sich für intellektuelle Berufe. Investiere in Weiterbildung und lebenslanges Lernen.');
    if (recs.length === 0) recs.push('Arbeite an einer ausgewogenen Entwicklung aller Bereiche. Setze dir kleine, erreichbare Ziele für jede Position deiner Matrix.');
  } else {
    if ((result.grid[1] || []).length >= 3) recs.push('Ваш сильный характер подходит для руководящих позиций. Ищите роли, где можно брать ответственность.');
    if ((result.grid[2] || []).length === 0) recs.push('Укрепляйте энергию регулярными физическими упражнениями, медитацией или пребыванием на природе.');
    if ((result.grid[5] || []).length >= 2) recs.push('Ваши аналитические способности развиты. Используйте их для стратегического планирования и решения проблем.');
    if ((result.grid[6] || []).length >= 3) recs.push('Ваша трудовая этика впечатляет. Следите за балансом работы и отдыха.');
    if ((result.grid[9] || []).length >= 2) recs.push('Ваш острый ум подходит для интеллектуальных профессий. Инвестируйте в образование и непрерывное обучение.');
    if (recs.length === 0) recs.push('Работайте над сбалансированным развитием всех областей. Ставьте маленькие достижимые цели для каждой позиции матрицы.');
  }

  setColor(doc, WHITE_60);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');

  for (const rec of recs) {
    y = addNewPageIfNeeded(doc, y, 12);
    // Bullet point
    setFillColor(doc, GOLD);
    doc.circle(MARGIN + 2, y + 1.5, 0.8, 'F');
    // Text
    const recLines = doc.splitTextToSize(rec, CONTENT_WIDTH - 8);
    doc.text(recLines, MARGIN + 6, y + 2.5);
    y += recLines.length * 3.2 + 3;
  }

  // --- Footer ---
  y = addNewPageIfNeeded(doc, y, 35);
  y += 5;
  drawGoldLine(doc, y);
  y += 10;

  setColor(doc, GOLD);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const ctaTitle = locale === 'de'
    ? 'Möchtest du tiefer gehen?'
    : 'Хочешь узнать больше?';
  doc.text(ctaTitle, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 6;

  setColor(doc, WHITE_60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const ctaText = locale === 'de'
    ? 'Buche dein persönliches Live-Reading mit Swetlana und erfahre die volle Bedeutung deiner Matrix.'
    : 'Запишись на персональный ридинг со Светланой и узнай полное значение своей матрицы.';
  doc.text(ctaText, PAGE_WIDTH / 2, y, { align: 'center' });
  y += 8;

  setColor(doc, GOLD);
  doc.setFontSize(8);
  doc.text('numerologie-pro.de', PAGE_WIDTH / 2, y, { align: 'center' });

  return doc;
}

/**
 * Client-side: generates and triggers download of the PDF.
 */
export async function generateMatrixPDF(
  result: MatrixResult,
  birthdate: string,
  locale: 'de' | 'ru'
): Promise<void> {
  const doc = buildPDF(result, birthdate, locale);
  const safeBirthdate = birthdate.replace(/\./g, '-');
  doc.save(`psychomatrix-${safeBirthdate}.pdf`);
}

/**
 * Server-side: generates the PDF and returns it as a Buffer (for email attachment).
 */
export function generateMatrixPDFBuffer(
  result: MatrixResult,
  birthdate: string,
  locale: 'de' | 'ru'
): Buffer {
  const doc = buildPDF(result, birthdate, locale);
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
