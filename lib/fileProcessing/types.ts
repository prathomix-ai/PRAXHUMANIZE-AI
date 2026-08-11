/**
 * A document is represented as an ordered list of structural blocks.
 * Every extractor (PDF/DOCX) produces this shape, every generator
 * (PDF/DOCX) consumes it, and the LLM round-trips it as marked-up text —
 * one common format so "preserve structure" only has to be solved once.
 */
export type BlockType = "heading" | "paragraph" | "bullet" | "numbered";

export interface DocBlock {
  type: BlockType;
  level?: number; // heading level 1-3, or bullet indent depth
  text: string;
}
