import type { DocBlock } from "./types";

/**
 * Turns structured blocks into a plain-text format the LLM can read and
 * reproduce reliably — explicit line-prefix markers instead of Markdown,
 * because Markdown gets "helpfully" reformatted by models more than a
 * flat tag syntax does.
 *
 *   [H1] Executive Summary
 *   [P] This report outlines...
 *   [BULLET] First key finding
 *   [NUM] First step
 */
export function blocksToPromptText(blocks: DocBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
          return `[H${b.level ?? 2}] ${b.text}`;
        case "bullet":
          return `[BULLET] ${b.text}`;
        case "numbered":
          return `[NUM] ${b.text}`;
        default:
          return `[P] ${b.text}`;
      }
    })
    .join("\n");
}

export function promptTextToBlocks(text: string): DocBlock[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks: DocBlock[] = [];

  const markerRegex = /^\[(H[1-3]|BULLET|NUM|P)\]\s*(.*)$/;

  for (const line of lines) {
    const match = markerRegex.exec(line);
    if (!match) {
      // Model dropped a marker — treat as a continuation paragraph rather
      // than silently losing the sentence.
      blocks.push({ type: "paragraph", text: line });
      continue;
    }

    const [, marker, content] = match;
    if (marker.startsWith("H")) {
      blocks.push({ type: "heading", level: Number(marker[1]), text: content });
    } else if (marker === "BULLET") {
      blocks.push({ type: "bullet", text: content });
    } else if (marker === "NUM") {
      blocks.push({ type: "numbered", text: content });
    } else {
      blocks.push({ type: "paragraph", text: content });
    }
  }

  return blocks;
}
