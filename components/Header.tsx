"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, LogOut, ShieldCheck, UserCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";

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
    <header className="relative z-30 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/50 backdrop-blur-xl px-6 py-4 md:px-12 transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-500 dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose shadow-md shadow-indigo-500/20 dark:shadow-aurora-violet/25 ring-1 ring-white/30">
            <Wand2 size={20} className="text-white" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Prathomix
              </span>
              <span className="rounded-full bg-indigo-50 dark:bg-aurora-violet/15 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/30 tracking-wide uppercase">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">AI Humanizer & Detector Bypass</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Format Engine Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-aurora-mint" />
            <span>Format Preserving Engine</span>
          </div>

          {/* Theme Toggle Button */}
          <ThemeToggle variant="pill" />

          {/* Profile Icon & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label="User Profile Menu"
              className={`group flex items-center gap-2 rounded-2xl p-1.5 pr-2.5 transition-all cursor-pointer border ${
                dropdownOpen
                  ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-md dark:bg-aurora-violet/20 dark:border-aurora-violet/60 dark:text-white dark:shadow-lg dark:shadow-aurora-violet/20"
                  : "bg-slate-100/80 border-slate-200/80 text-slate-700 hover:bg-slate-200/70 hover:border-slate-300 dark:bg-white/[0.05] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:border-white/20 dark:hover:text-white"
              }`}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-aurora-violet/40 dark:to-aurora-blue/40 border border-indigo-200 dark:border-white/20 text-indigo-600 dark:text-white shadow-inner">
                <UserCircle size={20} />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 dark:bg-aurora-mint ring-2 ring-white dark:ring-slate-950" />
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform duration-200 ${
                  dropdownOpen ? "rotate-180 text-slate-900 dark:text-white" : "group-hover:text-slate-700 dark:group-hover:text-slate-200"
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
                  className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-200 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl z-50 ring-1 ring-black/5 dark:ring-black/40"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-aurora-violet/20 border border-indigo-200 dark:border-aurora-violet/40 text-indigo-600 dark:text-aurora-mint shadow-sm">
                      <UserCircle size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100" title={displayName}>
                        {displayName}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-aurora-mint mt-0.5">
                        <CheckCircle2 size={11} /> Active Pro Account
                      </span>
                    </div>
                  </div>

                  {/* Theme Switcher Row in Dropdown */}
                  <div className="py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium">Appearance</span>
                    <ThemeToggle variant="buttons" />
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-rose-500/15 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer"
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
