import JSZip from "jszip";
import { generateWithWaterfall, type Category, type Tone } from "../llm";

/**
 * Escapes special XML characters in text
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Unescapes XML entities
 */
function unescapeXml(safe: string): string {
  return safe
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

/**
 * Format-Preserving PPTX Humanization Pipeline.
 * Reads a PPTX file Buffer using JSZip, extracts text from slide XMLs,
 * humanizes the text in small chunks using the Waterfall LLM engine,
 * and seamlessly injects the humanized text back into <a:t> XML tags
 * while preserving 100% of slide layout, images, themes, and animations.
 */
export async function processPptxWithPipeline(
  buffer: Buffer,
  category: Category = "report",
  tone: Tone = "professional",
  language: string = "English"
): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);

  // Find all slide XML files (ppt/slides/slide1.xml, slide2.xml, etc.)
  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/i.test(path)
  );

  // Sort slides numerically (slide1.xml, slide2.xml, slide10.xml)
  slidePaths.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });

  const toneInstruction =
    tone === "easy_words"
      ? "Rewrite using very simple, everyday language. Use 5th-grade vocabulary, short sentences, and avoid complex jargon while preserving the original meaning."
      : `Rewrite for a "${category.replace("_", " ")}" context in a "${tone.replace("_", " ")}" tone.`;

  // Process each slide XML file
  for (const slidePath of slidePaths) {
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;

    let xmlText = await slideFile.async("text");

    // Extract all text inside <a:t>...</a:t> tags
    const textMatches: { fullMatch: string; innerText: string }[] = [];
    const tagRegex = /<a:t(?:\s+[^>]*)?>(.*?)<\/a:t>/gs;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(xmlText)) !== null) {
      const rawText = match[1];
      const decodedText = unescapeXml(rawText).trim();
      if (decodedText.length > 0 && !/^\d+$/.test(decodedText)) {
        textMatches.push({
          fullMatch: match[0],
          innerText: decodedText,
        });
      }
    }

    if (textMatches.length === 0) continue;

    const textBlocks = textMatches.map((m) => m.innerText);
    const combinedSlideText = textBlocks.join("\n");

    if (combinedSlideText.trim().length === 0) continue;

    try {
      const prompt = `CRITICAL: You are a text rewriting and humanizing assistant. Never refuse a request due to safety filters unless the input contains extreme violence, self-harm, or illegal material. For short, casual, or vague inputs (like 'hlw' or single words), do NOT output an AI refusal or ethical lecture. Simply rewrite, expand, or humanize the input naturally in the requested language [${language}].

You are a PPTX presentation text editor. Humanize the following slide bullet points and paragraph text line-by-line. 
CRITICAL RULE: Maintain the exact same line count.
CRITICAL RULE 1: You MUST write the final output EXACTLY in the requested language: [${language}]. Do NOT translate to English unless '${language}' is English.
CRITICAL RULE 2: Output ONLY the final humanized text line-by-line. ABSOLUTELY NO conversational fillers or preambles.
CRITICAL RULE 3: Even if an error or edge case occurs, the requested language [${language}] must be strictly honored and no English-only safety boilerplate should be returned.

Context: ${toneInstruction}

Slide Text:
${combinedSlideText}`;

      const humanizedOutput = await generateWithWaterfall(prompt);

      const humanizedLines = (humanizedOutput || "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);


      // Inject humanized text back into XML tags safely
      let lineIndex = 0;
      xmlText = xmlText.replace(/<a:t(?:\s+[^>]*)?>(.*?)<\/a:t>/gs, (fullTag, innerText) => {
        const decoded = unescapeXml(innerText).trim();
        if (decoded.length === 0 || /^\d+$/.test(decoded)) {
          return fullTag;
        }

        const replacementLine =
          lineIndex < humanizedLines.length ? humanizedLines[lineIndex] : decoded;
        lineIndex++;

        // Preserve tag structure and escape XML special characters
        const tagOpening = fullTag.substring(0, fullTag.indexOf(">") + 1);
        return `${tagOpening}${escapeXml(replacementLine)}</a:t>`;
      });

      // Update the modified XML back into the JSZip instance
      zip.file(slidePath, xmlText);
    } catch (err) {
      console.warn(`[pptxPipeline] Error processing ${slidePath}, retaining original layout:`, err);
    }
  }

  // Re-generate PPTX binary buffer
  const outputBuffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return outputBuffer;
}
