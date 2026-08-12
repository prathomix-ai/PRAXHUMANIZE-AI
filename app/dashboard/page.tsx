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
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("credits, full_name, gender")
    .eq("id", user.id)
    .single();

  const { data: history } = await supabase
    .from("document_history")
    .select("id, original_text")
    .eq("user_id", user.id);

  return (
    <main className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <DashboardShell
        initialCredits={profile?.credits ?? 20}
        initialFullName={profile?.full_name ?? null}
        initialGender={profile?.gender ?? null}
        initialHistory={history || []}
        email={user.email}
      />
      <div className="md:pl-64">
        <Footer />
      </div>
    </main>
  );
}

