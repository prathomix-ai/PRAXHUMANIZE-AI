"use client";

import { motion } from "framer-motion";
import { Wand2, Zap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Header({
  credits,
  email,
}: {
  credits: number;
  email?: string;
}) {
  const router = useRouter();

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet to-aurora-blue shadow-lg shadow-aurora-violet/20">
          <Wand2 size={17} className="text-white" strokeWidth={2.4} />
        </div>
        <span className="font-display text-lg font-semibold tracking-tight text-white">
          Prathomix
        </span>
      </div>

      <div className="flex items-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex items-center gap-1.5 rounded-full px-3.5 py-1.5"
        >
          <Zap size={13} className="text-aurora-mint" fill="currentColor" />
          <span className="font-mono text-xs text-slate-300">
            {credits} credits
          </span>
        </motion.div>

        {email && (
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-xs text-slate-500">{email}</span>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-full glass-inset text-slate-400 transition-colors hover:text-slate-200"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
