import { NextRequest, NextResponse } from "next/server";
import { humanizeText, type Category, type Tone } from "@/lib/llm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 60;

const VALID_CATEGORIES: Category[] = [
  "report",
  "website_copy",
  "essay",
  "email",
  "social_media",
  "script",
];

const VALID_TONES: Tone[] = [
  "professional",
  "conversational",
  "empathetic",
  "witty",
  "academic",
  "easy_words",
];

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: sessionData } = await supabase.auth.getSession();

    const body = await req.json();
    const { text, category, tone, language = "English", userId } = body as {
      text?: string;
      category?: Category;
      tone?: Tone;
      language?: string;
      userId?: string;
    };

    const activeUserId = sessionData?.session?.user?.id || userId;

    // --- Validate input ---
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required." },
        { status: 400 }
      );
    }
    if (text.length > 8000) {
      return NextResponse.json(
        { error: "Text is too long. Keep it under 8,000 characters." },
        { status: 400 }
      );
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "A valid category is required." },
        { status: 400 }
      );
    }
    if (!tone || !VALID_TONES.includes(tone)) {
      return NextResponse.json(
        { error: "A valid tone is required." },
        { status: 400 }
      );
    }

    // --- Optional: check credits before spending an LLM call ---
    if (activeUserId && supabaseAdmin) {
      const { data: userRow, error: userErr } = await supabaseAdmin
        .from("users")
        .select("credits")
        .eq("id", activeUserId)
        .single();

      if (!userErr && userRow && userRow.credits <= 0) {
        return NextResponse.json(
          { error: "You're out of credits. Upgrade your plan to keep going." },
          { status: 402 }
        );
      }
    }

    // --- Call the LLM ---
    const humanized = await humanizeText({ text, category, tone, language });

    // --- Persist to document_history table ---
    if (activeUserId) {
      try {
        const textSnippet =
          text.trim().length > 40 ? text.trim().substring(0, 40) + "..." : text.trim();

        const fullPayload = {
          user_id: activeUserId,
          original_filename: textSnippet,
          category,
          tone,
          language,
        };

        const fallbackPayload = {
          user_id: activeUserId,
          original_filename: textSnippet,
          category,
          tone,
        };

        let insertError: any = null;

        // Try user client first
        try {
          const { error } = await supabase
            .from("document_history")
            .insert(fullPayload);
          insertError = error;
        } catch (err: any) {
          insertError = err;
        }

        // If language column is missing in DB schema, retry without language
        if (
          insertError &&
          (insertError.message?.includes("language") ||
            insertError.details?.includes("language") ||
            insertError.code === "PGRST204")
        ) {
          console.warn(
            "[/api/humanize] 'language' column missing in DB schema, inserting without language..."
          );
          try {
            const { error: retryErr } = await supabase
              .from("document_history")
              .insert(fallbackPayload);
            insertError = retryErr;
          } catch (retryException: any) {
            insertError = retryException;
          }
        }

        // Fallback to admin client if user client RLS/session blocked
        if (insertError && supabaseAdmin) {
          try {
            const { error: adminErr } = await supabaseAdmin
              .from("document_history")
              .insert(fullPayload);
            if (
              adminErr &&
              (adminErr.message?.includes("language") ||
                adminErr.details?.includes("language") ||
                adminErr.code === "PGRST204")
            ) {
              const { error: adminRetryErr } = await supabaseAdmin
                .from("document_history")
                .insert(fallbackPayload);
              insertError = adminRetryErr;
            } else {
              insertError = adminErr;
            }
          } catch (adminErr: any) {
            insertError = adminErr;
          }
        }

        if (insertError) {
          console.log("Supabase insert error:", insertError);
        } else {
          console.log(`[/api/humanize] Successfully saved document_history record for User: ${activeUserId}`);
        }

        // Decrement credit
        if (supabaseAdmin) {
          try {
            await supabaseAdmin.rpc("decrement_credits", {
              uid: activeUserId,
              amount: 1,
            });
          } catch (credErr) {
            console.warn("[/api/humanize] Credit decrement warning:", credErr);
          }
        }
      } catch (dbErr) {
        console.log("Supabase insert error:", dbErr);
      }
    }

    return NextResponse.json({ humanizedText: humanized });

  } catch (err: any) {
    console.error("[/api/humanize] error:", err);

    const errMsg = String(err?.message || err || "").toLowerCase();
    const isKeyError =
      errMsg.includes("invalid api key") ||
      errMsg.includes("key") ||
      errMsg.includes("rejected") ||
      errMsg.includes("400") ||
      errMsg.includes("401") ||
      errMsg.includes("unauthorized");

    if (isKeyError) {
      return NextResponse.json(
        {
          success: false,
          error: "AI Providers rejected the API keys. Please verify your Gemini/Groq keys in Settings or env vars.",
          message: "AI Providers rejected the API keys. Please verify your Gemini/Groq keys in Settings or env vars.",
          isKeyError: true,
        },
        { status: 200 }
      );
    }

    const isServerDown =
      err?.isServerDown ||
      err?.name === "AllTiersExhaustedError" ||
      errMsg.includes("high load") ||
      errMsg.includes("exhausted") ||
      errMsg.includes("fetch failed");

    if (isServerDown) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is currently experiencing high load or API key limits. Please try again shortly.",
          message: "Server is currently experiencing high load or API key limits. Please try again shortly.",
          isServerDown: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Something went wrong while humanizing your text. Try again.",
        message: err?.message || "Something went wrong while humanizing your text. Try again.",
      },
      { status: 200 }
    );
  }
}


