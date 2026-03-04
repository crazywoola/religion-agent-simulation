import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { openSync as openFontSync } from 'fontkit';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CJK_TEXT_REGEX = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

function isEmbeddableFont(filePath) {
  try {
    const font = openFontSync(filePath);
    return Boolean(font && typeof font.createSubset === 'function');
  } catch {
    return false;
  }
}

function firstExistingPath(candidates = [], options = {}) {
  const { requireEmbeddableFont = false } = options;
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (fs.existsSync(candidate)) {
      if (requireEmbeddableFont && !isEmbeddableFont(candidate)) {
        continue;
      }
      return candidate;
    }
  }
  return null;
}

function registerPdfFonts(doc) {
  const cjkRegular = firstExistingPath([
    process.env.PDF_FONT_CJK_REGULAR,
    process.env.PDF_FONT_CJK,
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansSC-Regular.ttf'),
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansCJKsc-Regular.otf'),
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
    '/System/Library/Fonts/Supplemental/Arial.ttf',
    '/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf',
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
    '/System/Library/Fonts/PingFang.ttc',
    '/System/Library/Fonts/Hiragino Sans GB.ttc',
    '/System/Library/Fonts/Supplemental/Songti.ttc'
  ], { requireEmbeddableFont: true });
  const cjkBold = firstExistingPath([
    process.env.PDF_FONT_CJK_BOLD,
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansSC-Bold.ttf'),
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansCJKsc-Bold.otf'),
    '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
    '/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc'
  ], { requireEmbeddableFont: true }) || cjkRegular;
  const cjkItalic = firstExistingPath([
    process.env.PDF_FONT_CJK_ITALIC,
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansSC-Regular.ttf'),
    path.join(PROJECT_ROOT, 'assets/fonts/NotoSansCJKsc-Regular.otf')
  ], { requireEmbeddableFont: true }) || cjkRegular;

  if (cjkRegular) {
    doc.registerFont('CJK-Regular', cjkRegular);
    doc.registerFont('CJK-Bold', cjkBold || cjkRegular);
    doc.registerFont('CJK-Italic', cjkItalic || cjkRegular);
  }

  return {
    hasCjk: Boolean(cjkRegular)
  };
}

function resolvePdfFontName(fonts, style = 'regular', text = '') {
  const needsCjk = CJK_TEXT_REGEX.test(String(text || ''));
  if (needsCjk && fonts.hasCjk) {
    if (style === 'bold') {
      return 'CJK-Bold';
    }
    if (style === 'italic') {
      return 'CJK-Italic';
    }
    return 'CJK-Regular';
  }

  if (style === 'bold') {
    return 'Helvetica-Bold';
  }
  if (style === 'italic') {
    return 'Helvetica-Oblique';
  }
  if (style === 'mono') {
    return 'Courier';
  }
  return 'Helvetica';
}

function setPdfFont(doc, fonts, style, size, text = '') {
  return doc.font(resolvePdfFontName(fonts, style, text)).fontSize(size);
}

function normalizeInlineMarkdown(text = '') {
  return String(text || '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function parseTableRow(line) {
  const text = String(line || '').trim();
  if (!text.includes('|')) {
    return null;
  }
  const compact = text.replace(/^\|/, '').replace(/\|$/, '');
  const cells = compact.split('|').map((cell) => normalizeInlineMarkdown(cell.trim()));
  return cells.length ? cells : null;
}

function isMarkdownTableDivider(line) {
  const text = String(line || '').trim();
  if (!text.includes('|')) {
    return false;
  }
  const compact = text.replace(/^\|/, '').replace(/\|$/, '');
  return compact.split('|').every((segment) => /^:?-{3,}:?$/.test(segment.trim()));
}

function collectMarkdownTable(lines, startIndex) {
  if (!lines[startIndex]) {
    return null;
  }
  if (!lines[startIndex].includes('|') || !isMarkdownTableDivider(lines[startIndex + 1])) {
    return null;
  }
  const header = parseTableRow(lines[startIndex]);
  if (!header) {
    return null;
  }
  const rows = [];
  let cursor = startIndex + 2;
  while (cursor < lines.length) {
    const line = lines[cursor];
    if (!line.trim() || !line.includes('|')) {
      break;
    }
    const row = parseTableRow(line);
    if (!row) {
      break;
    }
    rows.push(row);
    cursor += 1;
  }
  return { header, rows, nextIndex: cursor };
}

function ensurePdfSpace(doc, neededHeight = 24, footerReserve = 26) {
  const bottom = doc.page.height - doc.page.margins.bottom - footerReserve;
  if (doc.y + neededHeight > bottom) {
    doc.addPage();
  }
}

function drawPdfTable(doc, table, pageWidth, fonts) {
  const columnCount = Math.max(1, table.header.length, ...table.rows.map((row) => row.length));
  const normalizeRow = (row) =>
    Array.from({ length: columnCount }, (_, index) => normalizeInlineMarkdown(row[index] || ''));

  const header = normalizeRow(table.header);
  const rows = table.rows.map((row) => normalizeRow(row));
  const maxChars = new Array(columnCount).fill(8);
  for (const row of [header, ...rows]) {
    row.forEach((cell, index) => {
      maxChars[index] = Math.max(maxChars[index], Math.min(36, cell.length));
    });
  }

  const totalChars = maxChars.reduce((sum, value) => sum + value, 0);
  const colWidths = maxChars.map((chars) => (pageWidth * chars) / totalChars);
  const startX = doc.page.margins.left;
  const cellPadX = 6;
  const cellPadY = 4;
  const minRowHeight = 18;

  const rowHeight = (row, isHeader = false) => {
    const size = isHeader ? 10 : 9.5;
    const style = isHeader ? 'bold' : 'regular';
    let height = minRowHeight;
    for (let i = 0; i < row.length; i += 1) {
      const text = row[i];
      const cellWidth = Math.max(30, colWidths[i] - cellPadX * 2);
      setPdfFont(doc, fonts, style, size, text);
      const measured = doc.heightOfString(text || ' ', { width: cellWidth, lineGap: 1 });
      height = Math.max(height, measured + cellPadY * 2);
    }
    return height;
  };

  const drawRow = (row, isHeader = false) => {
    const height = rowHeight(row, isHeader);
    let x = startX;
    const y = doc.y;
    for (let i = 0; i < row.length; i += 1) {
      const width = colWidths[i];
      doc.rect(x, y, width, height).fillAndStroke(isHeader ? '#e7edf9' : '#ffffff', '#8a9cb1');
      const text = row[i];
      const style = isHeader ? 'bold' : 'regular';
      const size = isHeader ? 10 : 9.5;
      setPdfFont(doc, fonts, style, size, text)
        .fillColor('#1f2b3d')
        .text(text, x + cellPadX, y + cellPadY, {
          width: Math.max(30, width - cellPadX * 2),
          lineGap: 1
        });
      x += width;
    }
    doc.y = y + height;
    return height;
  };

  doc.moveDown(0.25);
  ensurePdfSpace(doc, rowHeight(header, true));
  drawRow(header, true);
  for (const row of rows) {
    const currentHeight = rowHeight(row, false);
    const bottom = doc.page.height - doc.page.margins.bottom - 26;
    if (doc.y + currentHeight > bottom) {
      doc.addPage();
      drawRow(header, true);
    }
    drawRow(row, false);
  }
  doc.moveDown(0.35);
}

export function generatePdfBuffer(markdownText, metadata = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: metadata.title || 'Religion Simulation Analysis Report',
        Author: 'AI Multi-Agent Religion Simulation',
        Subject: 'Academic analysis of religious dynamics',
        Creator: 'Religion Agent Simulation System'
      },
      bufferPages: true
    });
    const fonts = registerPdfFonts(doc);
    if (!fonts.hasCjk) {
      console.warn(
        '[PDF] CJK font not found. Chinese/Japanese characters may render incorrectly. Set PDF_FONT_CJK or install a system CJK font.'
      );
    }

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const lines = String(markdownText || '').split(/\r?\n/);
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      const trimmed = line.trim();

      const table = collectMarkdownTable(lines, index);
      if (table) {
        drawPdfTable(doc, table, pageWidth, fonts);
        index = table.nextIndex;
        continue;
      }

      if (!trimmed) {
        doc.moveDown(0.32);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const codeLines = [];
        index += 1;
        while (index < lines.length && !lines[index].trim().startsWith('```')) {
          codeLines.push(lines[index]);
          index += 1;
        }
        if (index < lines.length && lines[index].trim().startsWith('```')) {
          index += 1;
        }
        const blockText = codeLines.join('\n').trim() || ' ';
        ensurePdfSpace(doc, doc.heightOfString(blockText, { width: pageWidth - 24 }) + 16);
        const y = doc.y;
        const blockHeight =
          doc.heightOfString(blockText, { width: pageWidth - 24, lineGap: 1.5 }) + 12;
        doc.rect(doc.page.margins.left, y, pageWidth, blockHeight).fill('#f3f5f9');
        setPdfFont(doc, fonts, 'mono', 9, blockText)
          .fillColor('#2f3747')
          .text(blockText, doc.page.margins.left + 12, y + 6, {
            width: pageWidth - 24,
            lineGap: 1.5
          });
        doc.y = y + blockHeight + 5;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        ensurePdfSpace(doc, 36);
        const title = normalizeInlineMarkdown(trimmed.slice(2));
        doc.moveDown(0.45);
        setPdfFont(doc, fonts, 'bold', 18, title)
          .fillColor('#13233f')
          .text(title, { width: pageWidth, lineGap: 2 });
        doc.moveDown(0.2);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        ensurePdfSpace(doc, 30);
        const title = normalizeInlineMarkdown(trimmed.slice(3));
        doc.moveDown(0.3);
        setPdfFont(doc, fonts, 'bold', 14.5, title)
          .fillColor('#1a3356')
          .text(title, { width: pageWidth, lineGap: 2 });
        doc.moveDown(0.15);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('### ')) {
        ensurePdfSpace(doc, 24);
        const title = normalizeInlineMarkdown(trimmed.slice(4));
        doc.moveDown(0.2);
        setPdfFont(doc, fonts, 'bold', 12, title)
          .fillColor('#274469')
          .text(title, { width: pageWidth });
        doc.moveDown(0.1);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('#### ')) {
        ensurePdfSpace(doc, 20);
        const title = normalizeInlineMarkdown(trimmed.slice(5));
        setPdfFont(doc, fonts, 'bold', 10.8, title)
          .fillColor('#274469')
          .text(title, { width: pageWidth });
        index += 1;
        continue;
      }

      if (trimmed === '---') {
        ensurePdfSpace(doc, 12);
        const y = doc.y + 2;
        doc
          .moveTo(doc.page.margins.left, y)
          .lineTo(doc.page.margins.left + pageWidth, y)
          .strokeColor('#c4ccd9')
          .lineWidth(0.6)
          .stroke();
        doc.moveDown(0.4);
        index += 1;
        continue;
      }

      if (trimmed.startsWith('>')) {
        const quote = normalizeInlineMarkdown(trimmed.replace(/^>\s?/, ''));
        const quoteHeight = doc.heightOfString(quote, { width: pageWidth - 18, lineGap: 2 }) + 10;
        ensurePdfSpace(doc, quoteHeight);
        const startY = doc.y;
        doc
          .moveTo(doc.page.margins.left + 2, startY)
          .lineTo(doc.page.margins.left + 2, startY + quoteHeight)
          .lineWidth(2)
          .strokeColor('#90a3bd')
          .stroke();
        setPdfFont(doc, fonts, 'italic', 10.5, quote)
          .fillColor('#3a4a63')
          .text(quote, doc.page.margins.left + 10, startY + 2, {
            width: pageWidth - 16,
            lineGap: 2
          });
        doc.y = startY + quoteHeight + 2;
        index += 1;
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const text = normalizeInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''));
        ensurePdfSpace(doc, 18);
        setPdfFont(doc, fonts, 'regular', 10.8, text)
          .fillColor('#222f42')
          .text(`\u2022 ${text}`, doc.page.margins.left + 8, doc.y, {
            width: pageWidth - 8,
            lineGap: 2
          });
        index += 1;
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        const matched = trimmed.match(/^(\d+\.)\s+(.+)$/);
        const label = matched?.[1] || '';
        const text = normalizeInlineMarkdown(matched?.[2] || trimmed);
        ensurePdfSpace(doc, 18);
        setPdfFont(doc, fonts, 'regular', 10.8, `${label} ${text}`)
          .fillColor('#222f42')
          .text(`${label} ${text}`, doc.page.margins.left + 4, doc.y, {
            width: pageWidth - 4,
            lineGap: 2
          });
        index += 1;
        continue;
      }

      const paragraph = normalizeInlineMarkdown(trimmed);
      ensurePdfSpace(doc, doc.heightOfString(paragraph, { width: pageWidth, lineGap: 2 }) + 4);
      setPdfFont(doc, fonts, 'regular', 10.8, paragraph)
        .fillColor('#2a3140')
        .text(paragraph, { width: pageWidth, lineGap: 2, align: 'justify' });
      doc.moveDown(0.06);
      index += 1;
    }

    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i += 1) {
      doc.switchToPage(i);
      const pageFooter = `${metadata.title || 'Religion Simulation Report'} — Page ${i + 1} / ${pageCount}`;
      setPdfFont(doc, fonts, 'regular', 8, pageFooter)
        .fillColor('#8c95a4')
        .text(pageFooter, doc.page.margins.left, doc.page.height - 38, {
          width: pageWidth,
          align: 'center'
        });
    }

    doc.end();
  });
}

export function ensureAcademicReportStructure(markdownText, snapshot) {
  let text = String(markdownText || '').trim();
  if (!text) {
    return text;
  }

  const topReligion = [...(snapshot.religions || [])].sort((a, b) => b.followers - a.followers)[0];
  const strongestTransfer = [...(snapshot.topTransfers || [])].sort((a, b) => b.amount - a.amount)[0];
  const share = topReligion
    ? ((topReligion.followers / Math.max(1, snapshot.totalFollowers)) * 100).toFixed(1)
    : 'N/A';
  const defaultTitle = `# Religion Dynamics Under Social Stress: Round ${snapshot.round} Analysis`;
  if (!/^#\s+/m.test(text)) {
    text = `${defaultTitle}\n\n${text}`;
  }

  const has = (pattern) => pattern.test(text);
  if (!has(/(^|\n)##\s+Abstract\b/i)) {
    text = text.replace(
      /^#\s+.+$/m,
      (title) =>
        `${title}\n\n## Abstract\nThis report analyzes simulation round ${snapshot.round} under scenario "${snapshot.scenario}", focusing on religious redistribution dynamics, institutional constraints, and event shocks. The currently dominant group is ${topReligion?.name || 'N/A'} (${share}%). Transfer evidence indicates the strongest observed corridor is ${strongestTransfer ? `${strongestTransfer.from} -> ${strongestTransfer.to}` : 'N/A'}, suggesting structured rather than random conversion pressure. Findings are interpreted through religious studies, historical sociology, and philosophy of religion, with explicit claim-evidence coupling and reproducible references to simulation records [1][2].`
    );
  }
  if (!has(/(^|\n)##\s+Keywords\b/i)) {
    text += `\n\n## Keywords\nreligion dynamics; social signals; conversion flow; institutional governance; computational simulation`;
  }
  if (!has(/(^|\n)##\s+1\.\s*Introduction\b/i)) {
    text += `\n\n## 1. Introduction\nThe simulation models inter-religious conversion with a fixed total population and dynamic social signal shocks. This section frames the analytical scope and research questions [1].`;
  }
  if (!has(/(^|\n)##\s+2\.\s*Methodology\b/i)) {
    text += `\n\n## 2. Methodology and Data\nThe analysis uses round-level state snapshots, transfer corridors, event history, and judgment records.\n\n| Indicator | Definition | Source |\n|---|---|---|\n| Followers | Current adherent count by religion | Snapshot religion state [1] |\n| Transfer Flow | Directed conversion volume | Top transfer events [2] |\n| Judgment Blocking | Tribunal-mediated blocked conversions | Judgment records [3] |`;
  }
  if (!has(/(^|\n)##\s+3\.\s*Empirical Findings\b/i)) {
    text += `\n\n## 3. Empirical Findings\n### Claim 1\nArgument: Institutional capacity and retention jointly increase stability of high-cohesion traditions.\nEvidence: Dominance and transfer concentration in this round indicate asymmetric conversion resilience [1][2].\n\n### Claim 2\nArgument: Social signal fluctuations alter channel effectiveness faster than doctrinal baselines.\nEvidence: Event shocks and signal deltas align with observed changes in corridor intensity [2][4].\n\n### Claim 3\nArgument: Legal-pluralism and regulation tension mediates conversion efficiency.\nEvidence: Judgment blocking records and net conversion efficiency metrics move in opposite directions under restrictive conditions [3].`;
  }
  if (!has(/(^|\n)##\s+4\.\s*Discussion\b/i)) {
    text += `\n\n## 4. Discussion\nThis section should synthesize religious studies, historical path dependence, and philosophical meaning-formation under modern social fragmentation [1][4].`;
  }
  if (!has(/(^|\n)##\s+5\.\s*Conclusion\b/i)) {
    text += `\n\n## 5. Conclusion\nThe model suggests that conversion pathways are structurally constrained by institutional cohesion, social shocks, and regional compatibility. Future work should add demographic cohorts and empirical calibration [1][2].`;
  }
  if (!has(/(^|\n)##\s+References\b/i)) {
    text += `\n\n## References\n1. [1] Simulation snapshot data (religion states, round ${snapshot.round}).\n2. [2] Transfer corridor records (topTransfers, structureOutput).\n3. [3] Religious judgment and blocking records.\n4. [4] Event history and social signal trajectory logs.`;
  }
  if (!has(/(^|\n)##\s+Appendix\b/i)) {
    text += `\n\n## Appendix A. Supplementary Tables\n| Metric | Value |\n|---|---|\n| Round | ${snapshot.round} |\n| Scenario | ${snapshot.scenario} |\n| Total Followers | ${snapshot.totalFollowers} |`;
  }

  return text;
}
