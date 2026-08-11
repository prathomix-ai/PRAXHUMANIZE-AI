import { createClient } from "@supabase/supabase-js";

/**
 * Privileged, service-role client. Bypasses RLS entirely.
 * Uses process.env.NEXT_PUBLIC_SUPABASE_URL and process.env.SUPABASE_SERVICE_ROLE_KEY.
 */
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://xtdmbaeawotkluhearai.supabase.co";

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0ZG1iYWVhd290a2x1aGVhcmFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0NTIwNiwiZXhwIjoyMTAyMDIxMjA2fQ.ZRQcXE6Eb_DrIP8FzifkGkFCfZ7FawHfE3S0R4tCC_g";

export function createSupabaseAdminClient() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables! Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
