import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const baseOrigin = !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin;
      const redirectPath = next.startsWith("/") ? next : `/${next}`;
      return NextResponse.redirect(`${baseOrigin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could%20not%20authenticate`);
}


