/**
 * Multi-Tier Waterfall Fallback & API Key Rotation LLM integration.
 * Priority:
 * Tier 1: Local Laptop (Ollama via Cloudflare tunnel / LOCAL_OLLAMA_URL, 5s strict timeout)
 * Tier 2: Gemini API Key Rotation (GEMINI_API_KEYS array)
 * Tier 3: Groq API Key Rotation (GROQ_API_KEYS array)
 * Tier 4: Graceful Degradation Error (AllTiersExhaustedError)
 */

export type Category =
  | "report"
  | "website_copy"
  | "essay"
  | "email"
  | "social_media"
  | "script";

export type Tone =
  | "professional"
  | "conversational"
  | "empathetic"
  | "witty"
  | "academic";

interface HumanizeParams {
  text: string;
  category: Category;
  tone: Tone;
}

/**
 * Custom Error class thrown when Tier 1, all Tier 2 keys, and all Tier 3 keys fail.
 */
export class AllTiersExhaustedError extends Error {
  public isServerDown = true;
  constructor(
    message = "Server is currently experiencing high load. Please try again in a few minutes."
  ) {
    super(message);
    this.name = "AllTiersExhaustedError";
  }
}

function buildPrompt({ text, category, tone }: HumanizeParams) {
  return `You are an expert editor who rewrites AI-generated text so it reads as if it were written by a thoughtful human. 
Rewrite the text below for a "${category.replace("_", " ")}" context, in a "${tone}" tone.

Rules:
- Keep the original meaning and every factual claim intact.
- Vary sentence length and rhythm the way a real person naturally does.
- Remove robotic transitions, filler phrases, and AI clichés ("in today's world", "it is important to note", "furthermore", etc.).
- Do not add a preamble, explanation, or quotation marks — return ONLY the rewritten text.

Text to rewrite:
"""
${text}
"""`;
}

/**
 * Tier 1: Local Laptop (Ollama via LOCAL_OLLAMA_URL) with strict 5-second timeout.
 */
async function tryTier1Ollama(promptText: string): Promise<string | null> {
  const baseUrl = (
    process.env.LOCAL_OLLAMA_URL ||
    process.env.OLLAMA_BASE_URL ||
    "http://127.0.0.1:11434"
  ).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "llama3.1:latest";
  const endpoint = `${baseUrl}/api/generate`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s strict timeout

  try {
    console.log(`[Waterfall Tier 1] Connecting to local Ollama at ${endpoint} (5s timeout)...`);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: promptText,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Waterfall Tier 1 Failed] Ollama returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    if (data && typeof data.response === "string" && data.response.trim().length > 0) {
      console.log("[Waterfall Tier 1 Success] Response received from local Ollama.");
      return data.response.trim();
    }
    return null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      console.warn("[Waterfall Tier 1 Failed] Local Ollama timed out (5s limit reached).");
    } else {
      console.warn(`[Waterfall Tier 1 Failed] Local Ollama error: ${err?.message || err}`);
    }
    return null;
  }
}

/**
 * Tier 2: Gemini API Key Rotation (GEMINI_API_KEYS="key1,key2,key3...")
 */
async function tryTier2GeminiKeyRotation(promptText: string): Promise<string | null> {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  const keys = rawKeys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    console.warn("[Waterfall Tier 2 Skipped] No GEMINI_API_KEYS configured.");
    return null;
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[Waterfall Tier 2] Trying Gemini API Key ${i + 1}/${keys.length}...`);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.7 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim().length > 0) {
          console.log(`[Waterfall Tier 2 Success] Gemini API key ${i + 1} succeeded.`);
          return text.trim();
        }
      }

      console.warn(
        `[Waterfall Tier 2] Key ${i + 1}/${keys.length} failed with status ${res.status}. Rotating key...`
      );
    } catch (err: any) {
      console.warn(
        `[Waterfall Tier 2] Key ${i + 1}/${keys.length} error: ${err?.message || err}. Rotating key...`
      );
    }
  }

  console.warn("[Waterfall Tier 2 Failed] All Gemini API keys were exhausted or failed.");
  return null;
}

/**
 * Tier 3: Groq API Key Rotation (GROQ_API_KEYS="key1,key2,key3...")
 */
async function tryTier3GroqKeyRotation(promptText: string): Promise<string | null> {
  const rawKeys = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  const keys = rawKeys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    console.warn("[Waterfall Tier 3 Skipped] No GROQ_API_KEYS configured.");
    return null;
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    console.log(`[Waterfall Tier 3] Trying Groq API Key ${i + 1}/${keys.length}...`);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: promptText }],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim().length > 0) {
          console.log(`[Waterfall Tier 3 Success] Groq API key ${i + 1} succeeded.`);
          return text.trim();
        }
      }

      console.warn(
        `[Waterfall Tier 3] Key ${i + 1}/${keys.length} failed with status ${res.status}. Rotating key...`
      );
    } catch (err: any) {
      console.warn(
        `[Waterfall Tier 3] Key ${i + 1}/${keys.length} error: ${err?.message || err}. Rotating key...`
      );
    }
  }

  console.warn("[Waterfall Tier 3 Failed] All Groq API keys were exhausted or failed.");
  return null;
}

/**
 * Multi-Tier Waterfall Fallback System Orchestrator.
 * Tries Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 (AllTiersExhaustedError).
 */
export async function generateWithWaterfall(promptText: string): Promise<string> {
  // Tier 1: Local Laptop (Ollama)
  const tier1Output = await tryTier1Ollama(promptText);
  if (tier1Output) return tier1Output;

  // Tier 2: Gemini API Key Array Rotation
  console.warn("[Waterfall] Tier 1 offline/failed. Falling back to Tier 2 (Gemini API Array)...");
  const tier2Output = await tryTier2GeminiKeyRotation(promptText);
  if (tier2Output) return tier2Output;

  // Tier 3: Groq API Key Array Rotation
  console.warn("[Waterfall] Tier 2 exhausted/failed. Falling back to Tier 3 (Groq API Array)...");
  const tier3Output = await tryTier3GroqKeyRotation(promptText);
  if (tier3Output) return tier3Output;

  // Tier 4: Graceful Degradation
  console.error("[Waterfall Tier 4] All tiers (Ollama, Gemini, Groq) failed or were exhausted!");
  throw new AllTiersExhaustedError(
    "Server is currently experiencing high load. Please try again in a few minutes."
  );
}

/**
 * Humanizes text embedded within HTML tags, preserving exact HTML structure.
 */
export async function humanizeHtmlChunk(
  htmlChunk: string,
  category: Category = "report",
  tone: Tone = "professional"
): Promise<string> {
  const prompt = `You are a text humanizer. You will receive text embedded within HTML tags. Your job is to rewrite the text content to make it sound human-written. CRITICAL RULE: You MUST perfectly preserve every single HTML tag, attribute, and structural element exactly as provided. Do NOT output Markdown. Only change the words inside the tags.

Context: Rewrite for a "${category.replace("_", " ")}" context in a "${tone}" tone.

HTML to humanize:
${htmlChunk}`;

  const rawOutput = await generateWithWaterfall(prompt);

  // Clean up any accidental markdown codeblock wrappers if LLM returns ```html ... ```
  let cleanHtml = rawOutput
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return cleanHtml || htmlChunk;
}

/**
 * Humanizes a single paragraph or chunk of text.
 */
export async function humanizeChunk(text: string): Promise<string> {
  const prompt = `You are an elite document formatter and editor. Humanize the following text so it sounds naturally human while maintaining exact meaning and markers. Do not add explanations or conversational filler. Return ONLY the rewritten text.\n\n${text}`;
  return generateWithWaterfall(prompt);
}

/**
 * Humanizes raw text input from user interface.
 */
export async function humanizeText(params: HumanizeParams): Promise<string> {
  return generateWithWaterfall(buildPrompt(params));
}

/**
 * Humanizes raw document blocks.
 */
export async function humanizeDocumentBlocks(markedUpText: string): Promise<string> {
  const prompt = `You are an elite document formatter and editor. Humanize the following text to bypass AI detectors. CRITICAL: You MUST preserve exact line markers like [H1], [P], [BULLET], [NUM]. Do not merge paragraphs or change markers. Return ONLY the rewritten text.\n\n${markedUpText}`;
  return generateWithWaterfall(prompt);
}

