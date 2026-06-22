import "server-only";

import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

import type { SubmissionsTable } from "./forms";

// A4 portrait.
const PAGE: [number, number] = [595.28, 841.89];
const MARGIN = 50;

/**
 * Render a form's submissions as a readable PDF (one block per submission:
 * applicant/date/status header + each answered field). pdf-lib's standard fonts
 * only encode WinAnsi (Latin-1), so any character outside it (e.g. Hungarian
 * ő/ű, emoji) is transliterated to ASCII via NFKD, or dropped — best-effort, so
 * German umlauts stay intact and other scripts degrade gracefully.
 */
export async function submissionsPdf(table: SubmissionsTable): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const encodable = new Map<string, boolean>();
  const canEncode = (ch: string): boolean => {
    let v = encodable.get(ch);
    if (v === undefined) {
      try {
        font.widthOfTextAtSize(ch, 10);
        v = true;
      } catch {
        v = false;
      }
      encodable.set(ch, v);
    }
    return v;
  };
  const safe = (text: string): string => {
    let out = "";
    for (const ch of text) {
      if (ch === "\n" || canEncode(ch)) {
        out += ch;
        continue;
      }
      for (const c of ch.normalize("NFKD").replace(/\p{Diacritic}/gu, "")) {
        if (canEncode(c)) out += c;
      }
    }
    return out;
  };

  const wrap = (text: string, f: PDFFont, size: number, maxWidth: number): string[] => {
    const lines: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of para.split(/(\s+)/)) {
        if (f.widthOfTextAtSize(line + word, size) <= maxWidth) {
          line += word;
          continue;
        }
        if (line.trim()) lines.push(line.trimEnd());
        line = "";
        let chunk = "";
        for (const ch of word) {
          if (f.widthOfTextAtSize(chunk + ch, size) > maxWidth && chunk) {
            lines.push(chunk);
            chunk = ch;
          } else chunk += ch;
        }
        line = chunk;
      }
      lines.push(line.trimEnd());
    }
    return lines;
  };

  let page = doc.addPage(PAGE);
  const width = page.getWidth();
  const maxW = width - MARGIN * 2;
  let y = page.getHeight() - MARGIN;

  const ensure = (need: number) => {
    if (y - need < MARGIN) {
      page = doc.addPage(PAGE);
      y = page.getHeight() - MARGIN;
    }
  };
  const draw = (text: string, f: PDFFont, size: number, color = rgb(0, 0, 0)) => {
    for (const line of wrap(safe(text), f, size, maxW)) {
      ensure(size + 4);
      page.drawText(line, { x: MARGIN, y: y - size, size, font: f, color });
      y -= size + 4;
    }
  };

  draw(table.formTitle, bold, 18);
  y -= 6;
  draw(`${table.rows.length} submissions`, font, 9, rgb(0.4, 0.4, 0.4));
  y -= 12;

  for (const row of table.rows) {
    ensure(48);
    y -= 6;
    const header = [row[3], (row[1] ?? "").slice(0, 10), row[2]].filter(Boolean).join("   ·   ");
    draw(header, bold, 11);
    for (let i = 4; i < table.columns.length; i++) {
      if (!row[i]) continue;
      draw(`${table.columns[i]}: ${row[i]}`, font, 10, rgb(0.15, 0.15, 0.15));
    }
    y -= 6;
    ensure(8);
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: width - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
    y -= 4;
  }

  return doc.save();
}
