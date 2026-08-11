import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  processDocxWithHtmlPipeline,
  processPdfWithHtmlPipeline,
} from "@/lib/fileProcessing/htmlPipeline";
import { processPptxWithPipeline } from "@/lib/fileProcessing/pptxPipeline";
import type { Category, Tone } from "@/lib/llm";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds Vercel hobby timeout limit

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // ---- 1. Initialize Supabase Server Client & Check Authentication -----
    const supabase = createSupabaseServerClient();
    const { data, error: authError } = await supabase.auth.getSession();

    // Strictly check if data.session exists
    if (authError || !data?.session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to process files." },
        { status: 401 }
      );
    }

    const userId = data.session.user.id;

    // ---- 2. Parse form data ----------------------------------------------
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as Category) || "report";
    const tone = (formData.get("tone") as Tone) || "professional";
    const language = (formData.get("language") as string) || "English";

    if (!file) {
      return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File size exceeds limit (Max 10MB)." },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx" && ext !== "pptx") {
      return NextResponse.json(
        { error: "Only .pdf, .docx, and .pptx files are supported." },
        { status: 400 }
      );
    }
    const fileType = ext as "pdf" | "docx" | "pptx";

    // ---- 3. Verify / Manage user credits safely --------------------------
    let creditsRemaining = 10;
    if (supabaseAdmin) {
      try {
        const { data: userRow } = await supabaseAdmin
          .from("users")
          .select("credits")
          .eq("id", userId)
          .single();

        if (userRow && typeof userRow.credits === "number") {
          creditsRemaining = userRow.credits;
        } else {
          await supabaseAdmin
            .from("users")
            .upsert({ id: userId, email: data.session.user.email, credits: 10 }, { onConflict: "id" });
        }
      } catch (dbErr) {
        console.warn("[process-file] Credit check fallback activated:", dbErr);
      }
    }

    if (creditsRemaining <= 0) {
      return NextResponse.json(
        { error: "You are out of credits. Please upgrade to continue." },
        { status: 402 }
      );
    }

    // ---- 4. Execute LLM Document Humanization Pipeline ------------------
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    let outputBuffer: Buffer;
    if (fileType === "pptx") {
      outputBuffer = await processPptxWithPipeline(inputBuffer, category, tone, language);
    } else if (fileType === "docx") {
      outputBuffer = await processDocxWithHtmlPipeline(inputBuffer, category, tone, language);
    } else {
      outputBuffer = await processPdfWithHtmlPipeline(inputBuffer, category, tone, "pdf", language);
    }


    if (!outputBuffer || outputBuffer.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate formatted document payload." },
        { status: 500 }
      );
    }

    // ---- 5. Insert Record into document_history Table -------------------
    const { error: insertError } = await supabase
      .from("document_history")
      .insert({
        user_id: userId,
        original_filename: fileName,
        category: category,
        tone: tone,
      });

    if (insertError) {
      console.error("[process-file] Error inserting into document_history:", insertError);
    }

    // Decrement user credits if admin client available
    if (supabaseAdmin) {
      try {
        await supabaseAdmin.rpc("decrement_credits", {
          uid: userId,
          amount: 1,
        });
      } catch (genErr) {
        console.warn("[process-file] Credit deduction warning:", genErr);
      }
    }

    // ---- 6. Return binary file response with download headers -------------
    const downloadFileName = `Humanized_${fileName}`;
    const contentType =
      fileType === "pdf"
        ? "application/pdf"
        : fileType === "pptx"
        ? "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${downloadFileName}"`,
      },
    });

  } catch (err: any) {
    console.error("[/api/process-file] Route execution error:", err);

    const isServerDown =
      err?.isServerDown ||
      err?.name === "AllTiersExhaustedError" ||
      err?.message?.includes("high load") ||
      err?.message?.includes("exhausted");

    return NextResponse.json(
      {
        success: false,
        message: isServerDown
          ? "Server is currently experiencing high load. Please try again in a few minutes."
          : err?.message || "Internal server error occurred while processing file.",
        error: err?.message || "Server error",
        isServerDown: Boolean(isServerDown),
      },
      { status: isServerDown ? 503 : 500 }
    );
  }
}


