import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DocBlock } from "./types";

// ---------------------------------------------------------------------------
// DOCX generation
// ---------------------------------------------------------------------------
const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

export async function generateDocx(blocks: DocBlock[]): Promise<Buffer> {
  const children: Paragraph[] = blocks.map((block) => {
    if (block.type === "heading") {
      return new Paragraph({
        heading: HEADING_MAP[block.level ?? 2] ?? HeadingLevel.HEADING_2,
        children: [new TextRun({ text: block.text, bold: true })],
        spacing: { before: 240, after: 120 },
      });
    }
    if (block.type === "bullet") {
      return new Paragraph({
        text: block.text,
        bullet: { level: 0 },
        spacing: { after: 80 },
      });
    }
    if (block.type === "numbered") {
      return new Paragraph({
        text: block.text,
        numbering: { reference: "numbered-list", level: 0 },
        spacing: { after: 80 },
      });
    }
    return new Paragraph({
      children: [new TextRun(block.text)],
      spacing: { after: 160 },
    });
  });

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "numbered-list",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: "start",
            },
          ],
        },
      ],
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

// ---------------------------------------------------------------------------
// PDF generation — hand-rolled text layout with word-wrapping, since we're
// building the file from structured blocks rather than editing an existing
// PDF's pages.
// ---------------------------------------------------------------------------
export async function generatePdf(blocks: DocBlock[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612; // US Letter
  const pageHeight = 792;
  const margin = 56;
  const maxWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursorY = pageHeight - margin;

  const newPageIfNeeded = (neededHeight: number) => {
    if (cursorY - neededHeight < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursorY = pageHeight - margin;
    }
  };

  const wrapText = (text: string, size: number, useFont = font) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (useFont.widthOfTextAtSize(trial, size) > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const drawBlock = (
    text: string,
    { size, useFont, indent = 0, gapAfter = 10 }: { size: number; useFont: typeof font; indent?: number; gapAfter?: number }
  ) => {
    const lines = wrapText(text, size, useFont);
    const lineHeight = size * 1.4;

    for (const line of lines) {
      newPageIfNeeded(lineHeight);
      page.drawText(line, {
        x: margin + indent,
        y: cursorY,
        size,
        font: useFont,
        color: rgb(0.1, 0.1, 0.14),
      });
      cursorY -= lineHeight;
    }
    cursorY -= gapAfter;
  };

  let numberedIndex = 1;

  for (const block of blocks) {
    if (block.type === "heading") {
      const size = block.level === 1 ? 20 : block.level === 3 ? 13 : 15;
      newPageIfNeeded(size * 1.6 + 14);
      cursorY -= 6;
      drawBlock(block.text, { size, useFont: boldFont, gapAfter: 10 });
    } else if (block.type === "bullet") {
      drawBlock(`•  ${block.text}`, { size: 11, useFont: font, indent: 4, gapAfter: 6 });
    } else if (block.type === "numbered") {
      drawBlock(`${numberedIndex}.  ${block.text}`, {
        size: 11,
        useFont: font,
        indent: 4,
        gapAfter: 6,
      });
      numberedIndex += 1;
    } else {
      drawBlock(block.text, { size: 11, useFont: font, gapAfter: 12 });
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

export async function generateFile(
  blocks: DocBlock[],
  fileType: "pdf" | "docx"
): Promise<Buffer> {
  return fileType === "pdf" ? generatePdf(blocks) : generateDocx(blocks);
}
