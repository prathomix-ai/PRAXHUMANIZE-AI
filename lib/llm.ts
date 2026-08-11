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
  | "academic"
  | "easy_words";

export interface HumanizeParams {
  text: string;
  category: Category;
  tone: Tone;
  language?: string;
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

/**
 * Helper to strip unwanted conversational preambles/fillers from LLM responses.
 */
/**
 * Helper to strip unwanted conversational preambles/fillers from LLM responses.
 */
export function cleanConversationalFillers(text: string): string {
  return text
    .replace(/^```[a-z]*\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(
      /^(here is|here's|here are|sure, here is|sure, here's|below is|here is the rewritten|here is the humanized|certainly! here is|certainly, here is|sure! here is)[\s\S]*?:\s*\n?/i,
      ""
    )
    .trim();
}

/**
 * Checks if the output contains generic AI refusal messages or safety filter boilerplate.
 */
export function isRefusalOrSafetyBoilerplate(text: string): boolean {
  if (!text || typeof text !== "string") return false;
  const lower = text.toLowerCase().trim();
  const refusalPatterns = [
    /i cannot fulfill/i,
    /i am unable to/i,
    /unable to (fulfill|process|rewrite|humanize|handle|complete)/i,
    /i cannot rewrite/i,
    /i cannot process/i,
    /i cannot humanize/i,
    /i am an ai/i,
    /as an ai/i,
    /safety policy/i,
    /ethical guidelines/i,
    /i cannot assist/i,
    /sorry, but i cannot/i,
    /i'm sorry, but i cannot/i,
    /i am sorry, but i cannot/i,
    /main is/i,
    /samajhne ki prakriya/i,
    /i am analyzing/i,
    /i am in the process of/i,
    /this is a short/i,
    /this appears to be/i,
    /this might be/i,
  ];
  return refusalPatterns.some((pattern) => pattern.test(lower));
}

/**
 * Language-enforcing fallback for edge cases where the LLM produces a refusal or hallucination.
 */
export function fallbackHumanize(text: string, language: string = "English"): string {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const shortGreetings = ["hlw", "hi", "hello", "hey", "hiu", "hlo", "helo", "yo", "sup"];
  if (shortGreetings.includes(lower) || (trimmed.length <= 5 && !/\s/.test(trimmed))) {
    switch (language.toLowerCase()) {
      case "spanish":
        return "¡Hola! Espero que estés bien.";
      case "french":
        return "Bonjour ! J'espère que vous allez bien.";
      case "german":
        return "Hallo! Ich hoffe, es geht Ihnen gut.";
      case "hindi":
        return "नमस्ते! उम्मीद है आप अच्छे होंगे।";
      default:
        return "Hello! Hope you are doing well.";
    }
  }

  return trimmed;
}

function buildPrompt({ text, category, tone, language = "English" }: HumanizeParams) {
  const toneInstruction =
    tone === "easy_words"
      ? "Rewrite the text using very simple, everyday language. Use 5th-grade vocabulary. Avoid complex jargon, keep sentences short, and ensure it is incredibly easy to read while preserving the original meaning."
      : `in a "${tone.replace("_", " ")}" tone.`;

  return `CRITICAL RULE: You are a text humanizer, NOT a conversational AI or text analyzer. 
- NEVER output meta-commentary, explanations, or analysis about the input text (e.g., do NOT say 'This is a short sentence', 'This might be a name', 'I am analyzing this', or 'Main is vakya ko...').
- Even if the input is bizarre, misspelled, or extremely short (like 'hiu' or 'test'), you must treat it as raw text and rewrite/humanize/expand it directly into a clean, natural-sounding version in the requested language [${language}]. 
- Your response must contain ONLY the final rewritten text and nothing else.

CRITICAL: You are a text rewriting and humanizing assistant. Never refuse a request due to safety filters unless the input contains extreme violence, self-harm, or illegal material. For short, casual, or vague inputs (like 'hlw' or single words), do NOT output an AI refusal, ethical lecture, or meta-commentary. Simply rewrite, expand, or humanize the input naturally in the requested language [${language}].

You are an expert editor who rewrites AI-generated text so it reads as if it were written by a thoughtful human. 
Rewrite the text below for a "${category.replace("_", " ")}" context, ${toneInstruction}

Rules:
- Keep the original meaning and every factual claim intact.
- Vary sentence length and rhythm the way a real person naturally does.
- Remove robotic transitions, filler phrases, and AI clichés ("in today's world", "it is important to note", "furthermore", etc.).
- CRITICAL RULE 1: You MUST write the final output EXACTLY in the requested language: [${language}]. Do NOT translate the text to English unless '${language}' is English. If the target language uses a specific script (e.g., Devanagari for Hindi/Sanskrit), you must use that script.
- CRITICAL RULE 2: Output ONLY the final humanized text. ABSOLUTELY NO conversational fillers, introductions, meta-analysis, or pleasantries (e.g., do not say 'Here is the rewritten text:' or 'Main is...'). Just output the text itself.
- CRITICAL RULE 3: Even if an error or edge case occurs, the requested language [${language}] must be strictly honored and no English-only safety boilerplate or refusal message should be returned.

Text to rewrite:
"""
${text}
"""`;
}



/**
 * Tier 1: Local Laptop (Ollama via LOCAL_OLLAMA_URL) with 60-second timeout.
 */
async function tryTier1Ollama(promptText: string): Promise<string | null> {
  const rawUrl = (
    process.env.LOCAL_OLLAMA_URL ||
    process.env.OLLAMA_BASE_URL ||
    "http://127.0.0.1:11434"
  ).trim();

  const cleanUrl = rawUrl.replace(/\/$/, "");
  const endpoint = cleanUrl.endsWith("/api/generate")
    ? cleanUrl
    : `${cleanUrl}/api/generate`;

  const model = process.env.OLLAMA_MODEL || "llama3.1:latest";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for local LLM generation

  try {
    console.log(`[Waterfall Tier 1] Connecting to local Ollama at ${endpoint} (60s timeout)...`);
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
      const errBody = await res.text().catch(() => "");
      console.warn(`[Waterfall Tier 1 Failed] Ollama status ${res.status}: ${errBody}`);
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
      console.warn("[Waterfall Tier 1 Failed] Local Ollama timed out (60s limit reached).");
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
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
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
/**
 * Humanizes text embedded within HTML tags, preserving exact HTML structure.
 */
export async function humanizeHtmlChunk(
  htmlChunk: string,
  category: Category = "report",
  tone: Tone = "professional",
  language: string = "English"
): Promise<string> {
  const toneInstruction =
    tone === "easy_words"
      ? "Rewrite the text using very simple, everyday language. Use 5th-grade vocabulary. Avoid complex jargon, keep sentences short, and ensure it is incredibly easy to read while preserving the original meaning."
      : `Rewrite for a "${category.replace("_", " ")}" context in a "${tone.replace("_", " ")}" tone.`;

  const prompt = `CRITICAL: You are a text rewriting and humanizing assistant. Never refuse a request due to safety filters unless the input contains extreme violence, self-harm, or illegal material. For short, casual, or vague inputs (like 'hlw' or single words), do NOT output an AI refusal or ethical lecture. Simply rewrite, expand, or humanize the input naturally in the requested language [${language}].

You are a text humanizer. You will receive text embedded within HTML tags. Your job is to rewrite the text content to make it sound human-written. CRITICAL RULE: You MUST perfectly preserve every single HTML tag, attribute, and structural element exactly as provided. Do NOT output Markdown. Only change the words inside the tags.

Context: ${toneInstruction}
CRITICAL RULE 1: You MUST write the final output EXACTLY in the requested language: [${language}]. Do NOT translate the text to English unless '${language}' is English. If the target language uses a specific script (e.g., Devanagari for Hindi/Sanskrit), you must use that script.
CRITICAL RULE 2: Output ONLY the final humanized text. ABSOLUTELY NO conversational fillers, introductions, or pleasantries (e.g., do not say 'Here is the rewritten text:'). Just output the text itself.
CRITICAL RULE 3: Even if an error or edge case occurs, the requested language [${language}] must be strictly honored and no English-only safety boilerplate or refusal message should be returned.

HTML to humanize:
${htmlChunk}`;

  const rawOutput = await generateWithWaterfall(prompt);
  const cleanHtml = cleanConversationalFillers(rawOutput);

  if (isRefusalOrSafetyBoilerplate(cleanHtml)) {
    console.warn(
      `[humanizeHtmlChunk] Refusal detected from LLM, returning original htmlChunk preserving language [${language}].`
    );
    return htmlChunk;
  }

  return cleanHtml || htmlChunk;
}

/**
 * Humanizes a single paragraph or chunk of text.
 */
export async function humanizeChunk(text: string, language: string = "English"): Promise<string> {
  const prompt = `CRITICAL: You are a text rewriting and humanizing assistant. Never refuse a request due to safety filters unless the input contains extreme violence, self-harm, or illegal material. For short, casual, or vague inputs (like 'hlw' or single words), do NOT output an AI refusal or ethical lecture. Simply rewrite, expand, or humanize the input naturally in the requested language [${language}].

You are an elite document formatter and editor. Humanize the following text so it sounds naturally human while maintaining exact meaning and markers. Do not add explanations or conversational filler. 
CRITICAL RULE 1: You MUST write the final output EXACTLY in the requested language: [${language}]. Do NOT translate to English unless '${language}' is English.
CRITICAL RULE 2: Output ONLY the final humanized text. ABSOLUTELY NO conversational fillers or introductions.
CRITICAL RULE 3: Even if an error or edge case occurs, the requested language [${language}] must be strictly honored and no English-only safety boilerplate or refusal message should be returned.

Text:
${text}`;
  const raw = await generateWithWaterfall(prompt);
  const cleaned = cleanConversationalFillers(raw);
  if (isRefusalOrSafetyBoilerplate(cleaned)) {
    return fallbackHumanize(text, language);
  }
  return cleaned;
}

/**
 * Humanizes raw text input from user interface.
 */
export async function humanizeText(params: HumanizeParams): Promise<string> {
  const { text, language = "English" } = params;
  const raw = await generateWithWaterfall(buildPrompt(params));
  const cleaned = cleanConversationalFillers(raw);

  const isShortInput = text.trim().length <= 5;
  const isChatbotQuestion =
    /^(kya aapko|do you need|how can i|is there anything|would you like me to|what can i help)/i.test(
      cleaned
    );

  if (isRefusalOrSafetyBoilerplate(cleaned) || (isShortInput && isChatbotQuestion)) {
    console.warn(
      `[humanizeText] Safety/refusal or unasked chatbot response detected for input "${text.slice(0, 30)}...". Triggering language-compliant fallback.`
    );
    return fallbackHumanize(text, language);
  }

  return cleaned;
}

/**
 * Humanizes raw document blocks.
 */
export async function humanizeDocumentBlocks(
  markedUpText: string,
  language: string = "English"
): Promise<string> {
  const prompt = `CRITICAL: You are a text rewriting and humanizing assistant. Never refuse a request due to safety filters unless the input contains extreme violence, self-harm, or illegal material. For short, casual, or vague inputs (like 'hlw' or single words), do NOT output an AI refusal or ethical lecture. Simply rewrite, expand, or humanize the input naturally in the requested language [${language}].

You are an elite document formatter and editor. Humanize the following text to bypass AI detectors. CRITICAL: You MUST preserve exact line markers like [H1], [P], [BULLET], [NUM]. Do not merge paragraphs or change markers.
CRITICAL RULE 1: You MUST write the final output EXACTLY in the requested language: [${language}].
CRITICAL RULE 2: Return ONLY the rewritten text without any preamble or conversational fillers.
CRITICAL RULE 3: Even if an error or edge case occurs, the requested language [${language}] must be strictly honored and no English-only safety boilerplate or refusal message should be returned.\n\n${markedUpText}`;
  const raw = await generateWithWaterfall(prompt);
  const cleaned = cleanConversationalFillers(raw);
  if (isRefusalOrSafetyBoilerplate(cleaned)) {
    return fallbackHumanize(markedUpText, language);
  }
  return cleaned;
}


