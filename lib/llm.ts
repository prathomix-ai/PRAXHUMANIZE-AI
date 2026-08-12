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
/**
 * Tier 1: Local Laptop (Ollama via LOCAL_OLLAMA_URL) with 8-second connection timeout.
 */
async function tryTier1Ollama(promptText: string): Promise<string | null> {
  try {
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
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s connection/generation limit

    console.log(`[Waterfall Tier 1] Attempting connection to local Ollama at ${endpoint}...`);

    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: promptText,
          stream: false,
        }),
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      console.warn(
        `[Waterfall Tier 1 Offline] Local Ollama is offline or unreachable (${fetchErr?.message || fetchErr}). Falling back to Tier 2...`
      );
      return null;
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(
        `[Waterfall Tier 1 Failed] Ollama status ${res.status}: ${errBody}. Falling back to Tier 2...`
      );
      return null;
    }

    const data = await res.json().catch(() => null);
    if (data && typeof data.response === "string" && data.response.trim().length > 0) {
      console.log("[Waterfall Tier 1 Success] Response received from local Ollama.");
      return data.response.trim();
    }

    console.warn(
      "[Waterfall Tier 1 Failed] Ollama returned empty or invalid response. Falling back to Tier 2..."
    );
    return null;
  } catch (err: any) {
    console.warn(
      `[Waterfall Tier 1 Error] Unexpected Tier 1 error: ${err?.message || err}. Falling back to Tier 2...`
    );
    return null;
  }
}

/**
 * Aggressive helper to clean and trim environment variable API keys.
 * Removes ALL single/double quotes, carriage returns (\r), newlines (\n),
 * tabs (\t), zero-width Unicode spaces, and trims outer whitespace.
 */
function cleanKey(k?: string): string {
  if (!k) return "";
  return k
    .replace(/['"\r\n\t]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

/**
 * Robust helper function to extract all API keys for a specific provider
 * by dynamically scanning process.env, handling comma-separated or numbered variables.
 */
export function getApiKeys(providerPrefix: string): string[] {
  const keys: string[] = [];

  const sanitize = (val: string) => cleanKey(val);

  // Method A: Check for single/comma-separated variables (e.g., GROQ_API_KEYS, GROQ_API_KEY)
  const candidateSingleVars = [
    process.env[`${providerPrefix}_KEYS`],
    process.env[`${providerPrefix}_KEY`],
    process.env[providerPrefix],
  ];

  for (const singleVar of candidateSingleVars) {
    if (singleVar) {
      keys.push(...singleVar.split(",").map(sanitize).filter(Boolean));
    }
  }

  // Method B: Dynamically scan process.env for numbered variables (e.g., GROQ_API_KEY_1, GROQ_API_KEY_2)
  for (const [key, value] of Object.entries(process.env)) {
    if (value && typeof value === "string") {
      const isMatch =
        key.startsWith(`${providerPrefix}_KEY_`) ||
        key.startsWith(`${providerPrefix}_`) ||
        key.startsWith(`${providerPrefix}KEY_`);

      if (isMatch) {
        const cleaned = sanitize(value);
        if (cleaned) {
          // In case individual numbered var also contains comma-separated keys
          keys.push(...cleaned.split(",").map(sanitize).filter(Boolean));
        }
      }
    }
  }

  // Return unique valid keys (minimum 5 characters to filter empty placeholders)
  const uniqueKeys = [...new Set(keys)].filter((k) => k.length > 5);
  console.log(
    `[getApiKeys] Aggressively sanitized ${uniqueKeys.length} unique keys for provider prefix '${providerPrefix}'`
  );
  return uniqueKeys;
}

/**
 * Collects Gemini API keys dynamically from environment variables.
 */
function getGeminiApiKeys(): string[] {
  let keys = getApiKeys("GEMINI_API");
  if (keys.length === 0) {
    keys = getApiKeys("GEMINI");
  }
  return keys;
}

/**
 * Collects Groq API keys dynamically from environment variables.
 */
function getGroqApiKeys(): string[] {
  let keys = getApiKeys("GROQ_API");
  if (keys.length === 0) {
    keys = getApiKeys("GROQ");
  }
  return keys;
}

/**
 * Tier 2: Gemini API Key Rotation (GEMINI_API_KEY_1..10 or GEMINI_API_KEYS)
 */
async function tryTier2GeminiKeyRotation(promptText: string): Promise<string | null> {
  try {
    const keys = getGeminiApiKeys();

    if (keys.length === 0) {
      console.warn("[Waterfall Tier 2 Skipped] No Gemini API keys configured.");
      return null;
    }

    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    for (let i = 0; i < keys.length; i++) {
      const apiKey = cleanKey(keys[i]);
      const keyPreview = apiKey.length > 8 ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}` : "key";
      console.log(`[Waterfall Tier 2] Trying Gemini API Key ${i + 1}/${keys.length} (${keyPreview})...`);

      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        let res: Response;
        try {
          res = await fetch(endpoint, {
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
            signal: controller.signal,
          });
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          console.error(
            `[Waterfall Tier 2] Key ${i + 1}/${keys.length} fetch error: ${fetchErr?.message || fetchErr}. Rotating key...`
          );
          continue;
        }
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error(`🔴 GEMINI REJECTED (${res.status}):`, errText);
          throw new Error(`Gemini fetch failed (${res.status})`);
        }

        const data = await res.json().catch(() => null);
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim().length > 0) {
          console.log(`[Waterfall Tier 2 Success] Gemini API key ${i + 1} succeeded.`);
          return text.trim();
        }
      } catch (err: any) {
        console.error(
          `[Waterfall Tier 2] Key ${i + 1}/${keys.length} error: ${err?.message || err}. Rotating key...`
        );
      }
    }

    console.warn("[Waterfall Tier 2 Failed] All Gemini API keys were exhausted or failed.");
    return null;
  } catch (err: any) {
    console.error(`[Waterfall Tier 2 Error] Unexpected Tier 2 error: ${err?.message || err}`);
    return null;
  }
}

/**
 * Tier 3: Groq API Key Rotation (GROQ_API_KEY_1..10 or GROQ_API_KEYS)
 */
async function tryTier3GroqKeyRotation(promptText: string): Promise<string | null> {
  try {
    const keys = getGroqApiKeys();

    if (keys.length === 0) {
      console.warn("[Waterfall Tier 3 Skipped] No Groq API keys configured.");
      return null;
    }

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    for (let i = 0; i < keys.length; i++) {
      const apiKey = cleanKey(keys[i]);
      const keyPreview = apiKey.length > 8 ? `${apiKey.slice(0, 5)}...${apiKey.slice(-4)}` : "key";
      console.log(`[Waterfall Tier 3] Trying Groq API Key ${i + 1}/${keys.length} (${keyPreview})...`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        let res: Response;
        try {
          res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            signal: controller.signal,
          });
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          console.error(
            `[Waterfall Tier 3] Key ${i + 1}/${keys.length} fetch error: ${fetchErr?.message || fetchErr}. Rotating key...`
          );
          continue;
        }
        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error(`🔴 GROQ REJECTED (${res.status}):`, errText);
          throw new Error(`Groq fetch failed (${res.status})`);
        }

        const data = await res.json().catch(() => null);
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim().length > 0) {
          console.log(`[Waterfall Tier 3 Success] Groq API key ${i + 1} succeeded.`);
          return text.trim();
        }
      } catch (err: any) {
        console.error(
          `[Waterfall Tier 3] Key ${i + 1}/${keys.length} error: ${err?.message || err}. Rotating key...`
        );
      }
    }

    console.warn("[Waterfall Tier 3 Failed] All Groq API keys were exhausted or failed.");
    return null;
  } catch (err: any) {
    console.error(`[Waterfall Tier 3 Error] Unexpected Tier 3 error: ${err?.message || err}`);
    return null;
  }
}

/**
 * Multi-Tier Waterfall Fallback System Orchestrator.
 * Tries Tier 1 -> Tier 2 -> Tier 3 -> Tier 4 (Safe Fallback Return).
 */
export async function generateWithWaterfall(promptText: string): Promise<string | null> {
  // Tier 1: Local Laptop (Ollama)
  try {
    const tier1Output = await tryTier1Ollama(promptText);
    if (tier1Output) return tier1Output;
  } catch (err: any) {
    console.warn(`[Waterfall] Tier 1 unhandled error: ${err?.message || err}`);
  }

  // Tier 2: Gemini API Key Array Rotation
  console.warn("[Waterfall] Tier 1 offline/failed. Falling back to Tier 2 (Gemini API Array)...");
  try {
    const tier2Output = await tryTier2GeminiKeyRotation(promptText);
    if (tier2Output) return tier2Output;
  } catch (err: any) {
    console.warn(`[Waterfall] Tier 2 unhandled error: ${err?.message || err}`);
  }

  // Tier 3: Groq API Key Array Rotation
  console.warn("[Waterfall] Tier 2 exhausted/failed. Falling back to Tier 3 (Groq API Array)...");
  try {
    const tier3Output = await tryTier3GroqKeyRotation(promptText);
    if (tier3Output) return tier3Output;
  } catch (err: any) {
    console.warn(`[Waterfall] Tier 3 unhandled error: ${err?.message || err}`);
  }

  // Tier 4: Graceful Degradation (No throw, no stack trace!)
  console.warn(
    "🔴 [Waterfall] All AI providers failed or were exhausted. Returning safe fallback response to client."
  );
  return null;
}

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

HTML to humanize:
${htmlChunk}`;

  const rawOutput = await generateWithWaterfall(prompt);
  if (!rawOutput) return htmlChunk;

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
  if (!raw) return fallbackHumanize(text, language);

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
  if (!raw) {
    console.warn("[humanizeText] Waterfall returned null. Executing safe fallback rewrite.");
    return fallbackHumanize(text, language);
  }

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
  if (!raw) return fallbackHumanize(markedUpText, language);

  const cleaned = cleanConversationalFillers(raw);
  if (isRefusalOrSafetyBoilerplate(cleaned)) {
    return fallbackHumanize(markedUpText, language);
  }
  return cleaned;
}
