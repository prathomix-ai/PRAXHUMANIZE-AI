import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuroraBackground from "@/components/AuroraBackground";
import DashboardShell from "@/components/DashboardShell";
import Footer from "@/components/Footer";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already protects /dashboard, but a server-side check here
  // means this page is safe even if it's ever rendered without middleware
  // in front of it (e.g. during static analysis or a route group refactor).
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single();

  return (
    <main className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <DashboardShell
        initialCredits={profile?.credits ?? 0}
        email={user.email}
      />
      <Footer />
    </main>
  );
}
