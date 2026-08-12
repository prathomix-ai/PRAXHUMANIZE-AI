import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Server Component / Route Handler client — reads the caller's session
 * from cookies, so all queries respect RLS as that user. Use this for
 * anything that should be scoped to "the currently signed-in person".
 */
export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xtdmbaeawotkluhearai.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZG1iYWVhd290a2x1aGVhcmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDUyMDYsImV4cCI6MjEwMjAyMTIwNn0.LvyinE66BIfNn8zrnCPJ2hoZjDHtjgDTZ5QZR61JZoE";

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies —
          // safe to ignore because middleware refreshes the session.
        }
      },
    },
  });
}
