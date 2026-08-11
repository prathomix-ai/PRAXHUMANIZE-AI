import { Wand2 } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import AuthForm from "@/components/AuthForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const next = searchParams.next || "/dashboard";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <AuroraBackground />

      <div className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-violet to-aurora-blue shadow-lg shadow-aurora-violet/30">
          <Wand2 size={20} className="text-white" strokeWidth={2.4} />
        </div>
        <h1 className="font-display text-2xl font-semibold text-white">
          Welcome to Prathomix
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to humanize your documents
        </p>
      </div>

      <AuthForm next={next} />

      <p className="mt-6 max-w-xs text-center text-xs text-slate-600">
        By continuing you agree to Prathomix&apos;s Terms of Service and
        Privacy Policy.
      </p>
    </main>
  );
}
