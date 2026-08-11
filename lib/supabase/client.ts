"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a browser-side Supabase client.
 * Strictly uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from environment variables.
 */
export function createSupabaseBrowserClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://xtdmbaeawotkluhearai.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZG1iYWVhd290a2x1aGVhcmFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDUyMDYsImV4cCI6MjEwMjAyMTIwNn0.LvyinE66BIfNn8zrnCPJ2hoZjDHtjgDTZ5QZR61JZoE";

  if (!url || !anonKey) {
    console.error(
      "[Supabase Client Error] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables."
    );
  }

  return createBrowserClient(url, anonKey);
}

// Single shared browser client for client-side components
export const supabaseBrowser = createSupabaseBrowserClient();
