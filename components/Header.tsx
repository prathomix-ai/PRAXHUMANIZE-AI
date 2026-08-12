"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, LogOut, ShieldCheck, UserCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Header({
  email,
  fullName,
}: {
  email?: string;
  fullName?: string | null;
}) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    await supabaseBrowser.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayName =
    fullName && fullName.trim() !== "" ? fullName : email || "Signed In User";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative z-30 border-b border-white/10 bg-slate-950/50 backdrop-blur-xl px-6 py-4 md:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet via-aurora-blue to-aurora-rose shadow-lg shadow-aurora-violet/25 ring-1 ring-white/20">
            <Wand2 size={20} className="text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Prathomix
              </span>
              <span className="rounded-full bg-aurora-violet/15 px-2 py-0.5 text-[10px] font-bold text-aurora-violet border border-aurora-violet/30 tracking-wide uppercase">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">AI Humanizer & Detector Bypass</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Format Engine Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <ShieldCheck size={14} className="text-aurora-mint" />
            <span>Format Preserving Engine</span>
          </div>

          {/* Profile Icon & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User Profile Menu"
              className={`group flex items-center gap-2 rounded-2xl p-1.5 pr-2.5 transition-all cursor-pointer border ${
                dropdownOpen
                  ? "bg-aurora-violet/20 border-aurora-violet/60 text-white shadow-lg shadow-aurora-violet/20"
                  : "bg-white/[0.05] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet/40 to-aurora-blue/40 border border-white/20 text-white shadow-inner">
                <UserCircle size={20} />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-aurora-mint ring-2 ring-slate-950" />
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-white" : "group-hover:text-slate-200"
                }`}
              />
            </button>

            {/* Glassmorphic Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/15 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl z-50 ring-1 ring-black/40"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet/30 to-aurora-blue/30 border border-aurora-violet/40 text-aurora-mint shadow-md">
                      <UserCircle size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-100" title={displayName}>
                        {displayName}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-aurora-mint mt-0.5">
                        <CheckCircle2 size={11} /> Active Pro Account
                      </span>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/15 hover:text-rose-300 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
