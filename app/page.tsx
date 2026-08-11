import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuroraBackground from "@/components/AuroraBackground";
import Footer from "@/components/Footer";

export default async function LandingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed-in visitors go straight to the product.
  if (user) redirect("/dashboard");

  return (
    <main className="relative flex min-h-screen flex-col">
      <AuroraBackground />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Prathomix
        </span>
        <Link
          href="/login"
          className="rounded-full glass px-4 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
        >
          Sign in
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 pb-24 pt-10 text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-aurora-mint animate-pulse-glow" />
          Now with PDF & DOCX support
        </div>

        <h1 className="font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Upload it robotic.{" "}
          <span className="text-gradient bg-[length:200%_100%] animate-gradient-flow">
            Download it human.
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-slate-400">
          Drop in a report, essay, or script and get back the exact same
          document — headings, bullets, and all — rewritten to read like a
          person wrote it.
        </p>

        <Link
          href="/login"
          className="relative mt-8 flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose bg-[length:200%_100%] animate-gradient-flow" />
          <span className="relative flex items-center gap-2">
            Get started <ArrowRight size={16} />
          </span>
        </Link>

        <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
          <FeatureCard
            icon={FileText}
            title="Structure preserved"
            body="Paragraphs, headings, and bullet points stay exactly where you put them."
          />
          <FeatureCard
            icon={Sparkles}
            title="Undetectable rewrites"
            body="Vocabulary and rhythm vary the way real human writing does."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Private by default"
            body="Every document is scoped to your account with row-level security."
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof FileText;
  title: string;
  body: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon size={18} className="mb-2 text-aurora-violet" />
      <p className="mb-1 text-sm font-medium text-slate-200">{title}</p>
      <p className="text-xs leading-relaxed text-slate-500">{body}</p>
    </div>
  );
}
