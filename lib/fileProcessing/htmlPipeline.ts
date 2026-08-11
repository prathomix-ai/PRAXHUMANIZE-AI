import mammoth from "mammoth";
import HTMLtoDOCX from "html-to-docx";
import { extractPdf } from "./extract";
import { generatePdf } from "./generate";
import { humanizeHtmlChunk, type Category, type Tone } from "../llm";
import type { DocBlock } from "./types";

/**
 * Splits an HTML string into complete top-level HTML block elements
 * (e.g. <p>...</p>, <h1>...</h1>, <ul>...</ul>, <table>...</table>)
 * and groups them into chunks of at most `maxChunkSize` characters.
 * This guarantees that HTML tags are NEVER split or broken across LLM chunks.
 */
export function splitHtmlIntoChunks(html: string, maxChunkSize = 2500): string[] {
  if (!html || !html.trim()) return ["<p></p>"];

  // Match top-level HTML block tags
  const blockRegex = /<(h[1-6]|p|ul|ol|table|blockquote|div|section)[^>]*>.*?<\/\1>/gis;
  const blocks: string[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      const textBetween = html.substring(lastIndex, match.index).trim();
      if (textBetween) {
        blocks.push(textBetween.startsWith("<") ? textBetween : `<p>${textBetween}</p>`);
      }
    }
    blocks.push(match[0]);
    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < html.length) {
    const trailing = html.substring(lastIndex).trim();
    if (trailing) {
      blocks.push(trailing.startsWith("<") ? trailing : `<p>${trailing}</p>`);
    }
  }

  // Fallback: If no block tags were found, split by double line breaks and wrap in <p>
  if (blocks.length === 0) {
    const lines = html.split(/\n\s*\n/).filter((l) => l.trim());
    for (const line of lines) {
      blocks.push(`<p>${line.trim()}</p>`);
    }
  }

  // Group HTML block elements into chunks within maxChunkSize
  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of blocks) {
    if (currentChunk && (currentChunk + "\n" + block).length > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = block;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n${block}` : block;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [html];
}

/**
 * Converts DocBlocks to semantic HTML string
 */
export function blocksToHtml(blocks: DocBlock[]): string {
  return blocks
    .map((b) => {
      if (b.type === "heading") {
        const lvl = b.level || 2;
        return `<h${lvl}>${escapeHtml(b.text)}</h${lvl}>`;
      }
      if (b.type === "bullet") {
        return `<ul><li>${escapeHtml(b.text)}</li></ul>`;
      }
      if (b.type === "numbered") {
        return `<ol><li>${escapeHtml(b.text)}</li></ol>`;
      }
      return `<p>${escapeHtml(b.text)}</p>`;
    })
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Process DOCX files using the Format-Preserving HTML Pipeline:
 * DOCX -> Mammoth HTML -> HTML Chunking -> Ollama (HTML preserving) -> HTMLtoDOCX -> Buffer
 */
export async function processDocxWithHtmlPipeline(
  buffer: Buffer,
  category: Category = "report",
  tone: Tone = "professional"
): Promise<Buffer> {
  // 1. Convert DOCX to rich semantic HTML via Mammoth
  const { value: rawHtml } = await mammoth.convertToHtml({ buffer });

  const htmlToProcess =
    rawHtml && rawHtml.trim().length > 0 ? rawHtml : "<p>No readable content found.</p>";

  // 2. Split HTML into safe chunks by block tags
  const chunks = splitHtmlIntoChunks(htmlToProcess, 2500);

  // 3. Process each HTML chunk sequentially through Ollama
  const humanizedChunks: string[] = [];
  for (const chunk of chunks) {
    const humanizedChunk = await humanizeHtmlChunk(chunk, category, tone);
    humanizedChunks.push(humanizedChunk);
  }

  const finalHtml = humanizedChunks.join("\n");

  // 4. Reconstruct DOCX file from humanized HTML using html-to-docx
  const docxBuffer = await HTMLtoDOCX(finalHtml, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  return Buffer.from(docxBuffer as any);
}

/**
 * Process PDF files using the Format-Preserving HTML Pipeline:
 * PDF -> DocBlocks -> HTML -> HTML Chunking -> Ollama -> Reconstructed File Buffer
 */
export async function processPdfWithHtmlPipeline(
  buffer: Buffer,
  category: Category = "report",
  tone: Tone = "professional",
  outputType: "docx" | "pdf" = "pdf"
): Promise<Buffer> {
  const blocks = await extractPdf(buffer);
  const rawHtml = blocksToHtml(blocks);

  const chunks = splitHtmlIntoChunks(rawHtml, 2500);
  const humanizedChunks: string[] = [];

  for (const chunk of chunks) {
    const humanizedChunk = await humanizeHtmlChunk(chunk, category, tone);
    humanizedChunks.push(humanizedChunk);
  }

  const finalHtml = humanizedChunks.join("\n");

  if (outputType === "docx") {
    const docxBuffer = await HTMLtoDOCX(finalHtml, null, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
    return Buffer.from(docxBuffer as any);
  }

  // Convert HTML back to DocBlocks for PDF generation
  const tagRegex = /<(h[1-6]|p|li)[^>]*>(.*?)<\/\1>/gis;
  const parsedBlocks: DocBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(finalHtml)) !== null) {
    const tag = match[1].toLowerCase();
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (!text) continue;

    if (tag.startsWith("h")) {
      parsedBlocks.push({ type: "heading", level: Number(tag[1]), text });
    } else if (tag === "li") {
      parsedBlocks.push({ type: "bullet", text });
    } else {
      parsedBlocks.push({ type: "paragraph", text });
    }
  }

  const pdfBlocks = parsedBlocks.length > 0 ? parsedBlocks : blocks;
  return generatePdf(pdfBlocks);
}
