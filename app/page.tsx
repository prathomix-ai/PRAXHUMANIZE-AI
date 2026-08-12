import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LandingPageClient from "@/components/LandingPageClient";

export default async function LandingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in visitors go straight to the product.
  if (user) redirect("/dashboard");

  return <LandingPageClient />;
}

