import mammoth from "mammoth";
import type { DocBlock } from "./types";

// ---------------------------------------------------------------------------
// DOCX — mammoth gives us real HTML with semantic tags, so structure
// extraction is exact rather than heuristic.
// ---------------------------------------------------------------------------
export async function extractDocx(buffer: Buffer): Promise<DocBlock[]> {
  const { value: html } = await mammoth.convertToHtml({ buffer });
  const blocks: DocBlock[] = [];

  // Lightweight tag walk — good enough for the block types we care about
  // (h1-h3, p, li) without pulling in a full DOM/HTML parser dependency.
  const tagRegex = /<(h[1-3]|p|li)[^>]*>(.*?)<\/\1>/gis;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const text = stripInlineTags(match[2]).trim();
    if (!text) continue;

    if (tag.startsWith("h")) {
      blocks.push({ type: "heading", level: Number(tag[1]), text });
    } else if (tag === "li") {
      blocks.push({ type: "bullet", text });
    } else {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// PDF — pdf-parse only returns a text stream, so structure is inferred with
// heuristics: short standalone lines are headings, lines starting with a
// bullet glyph or "1." are list items, blank-line-separated runs are
// paragraphs.
// ---------------------------------------------------------------------------
export async function extractPdf(buffer: Buffer): Promise<DocBlock[]> {
  // pdf-parse's main export sometimes tries to read a bundled test fixture
  // at import time in some bundling setups — importing the lib entrypoint
  // directly (not the debug wrapper) avoids that.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default as (
    data: Buffer
  ) => Promise<{ text: string }>;

  const { text } = await pdfParse(buffer);
  const rawLines = text.split("\n").map((l) => l.trim());

  const blocks: DocBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ") });
      paragraphBuffer = [];
    }
  };

  const bulletPattern = /^[-•●▪*]\s+/;
  const numberedPattern = /^\d+[.)]\s+/;
  const headingPattern = /^[A-Z][A-Za-z0-9 ,'&-]{2,60}$/;

  for (const line of rawLines) {
    if (!line) {
      flushParagraph();
      continue;
    }

    if (bulletPattern.test(line)) {
      flushParagraph();
      blocks.push({ type: "bullet", text: line.replace(bulletPattern, "") });
    } else if (numberedPattern.test(line)) {
      flushParagraph();
      blocks.push({ type: "numbered", text: line.replace(numberedPattern, "") });
    } else if (
      headingPattern.test(line) &&
      line.split(" ").length <= 10 &&
      !line.endsWith(".")
    ) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: line });
    } else {
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();

  return blocks;
}

export async function extractBlocks(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<DocBlock[]> {
  return fileType === "pdf" ? extractPdf(buffer) : extractDocx(buffer);
}

function stripInlineTags(html: string) {
  return html.replace(/<[^>]+>/g, "");
}
