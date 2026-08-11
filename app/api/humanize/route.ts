import { NextRequest, NextResponse } from "next/server";
import { humanizeText, type Category, type Tone } from "@/lib/llm";
import { supabaseAdmin as supabaseServer } from "@/lib/supabase/admin";

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
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, category, tone, userId } = body as {
      text?: string;
      category?: Category;
      tone?: Tone;
      userId?: string;
    };

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
    if (userId) {
      const { data: userRow, error: userErr } = await supabaseServer
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();

      if (!userErr && userRow && userRow.credits <= 0) {
        return NextResponse.json(
          { error: "You're out of credits. Upgrade your plan to keep going." },
          { status: 402 }
        );
      }
    }

    // --- Call the LLM (see lib/llm.ts to swap providers) ---
    const humanized = await humanizeText({ text, category, tone });

    // --- Persist to history + spend a credit (best-effort, non-blocking) ---
    if (userId) {
      await supabaseServer.from("generations").insert({
        user_id: userId,
        original_text: text,
        humanized_text: humanized,
        category,
        tone,
      });
      await supabaseServer.rpc("decrement_credits", {
        uid: userId,
        amount: 1,
      });
    }

    return NextResponse.json({ humanizedText: humanized });
  } catch (err) {
    console.error("[/api/humanize] error:", err);
    return NextResponse.json(
      { error: "Something went wrong while humanizing your text. Try again." },
      { status: 500 }
    );
  }
}
