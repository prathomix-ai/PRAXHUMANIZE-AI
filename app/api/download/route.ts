import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing generation id." }, { status: 400 });
  }

  // Look the row up scoped to this user — never trust the id alone.
  const { data: generation, error } = await supabaseAdmin
    .from("generations")
    .select("storage_path, user_id, file_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !generation?.storage_path) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const { data: signedUrl, error: signErr } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(generation.storage_path, 60 * 10);

  if (signErr || !signedUrl) {
    return NextResponse.json({ error: "Could not generate a download link." }, { status: 500 });
  }

  return NextResponse.json({
    downloadUrl: signedUrl.signedUrl,
    fileName: generation.file_name,
  });
}
