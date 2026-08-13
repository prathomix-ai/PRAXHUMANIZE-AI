"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wand2,
  LayoutGrid,
  Clock,
  Plus,
  Settings,
  LogOut,
  UserCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  email?: string;
  fullName?: string | null;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenNewModal: () => void;
}

export default function Sidebar({
  email,
  fullName,
  activeNav,
  setActiveNav,
  onOpenNewModal,
}: SidebarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    setLoggingOut(true);
    await supabaseBrowser.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "recent", label: "Recent Documents", icon: Clock },
    { id: "tool", label: "Humanizer Tool", icon: Wand2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const displayName =
    fullName && fullName.trim() !== ""
      ? fullName
      : email
      ? email.split("@")[0]
      : "Creator";

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-[#070714]/85 backdrop-blur-2xl p-5 md:flex select-none transition-colors duration-200">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-500 dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose p-0.5 shadow-md shadow-indigo-500/20 dark:shadow-aurora-violet/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-[#050510]">
              <Wand2 size={19} className="text-indigo-600 dark:text-aurora-violet" strokeWidth={2.4} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Prathomix
              </span>
              <span className="rounded-full bg-indigo-50 dark:bg-aurora-violet/15 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/30 tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Workspace Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === "tool") onOpenNewModal();
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-sm font-semibold dark:bg-aurora-violet/20 dark:text-white dark:border-aurora-violet/40 dark:shadow-md dark:shadow-aurora-violet/10"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? "text-indigo-600 dark:text-aurora-violet" : "text-slate-400 dark:text-slate-400"}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-indigo-600 dark:text-aurora-violet" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Profile, Theme Switcher & Logout */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-3">
        {/* Theme Toggle Strip */}
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
          <ThemeToggle variant="buttons" />
        </div>

        <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] p-3 border border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100/70 dark:bg-aurora-violet/30 border border-indigo-200 dark:border-aurora-violet/40 text-indigo-600 dark:text-aurora-mint">
              <UserCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-xs font-semibold text-slate-900 dark:text-slate-200 capitalize"
                title={email || "User Account"}
              >
                {displayName}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-aurora-mint flex items-center gap-1 font-medium">
                <ShieldCheck size={11} /> Pro Member
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 dark:bg-white/5 dark:hover:bg-rose-500/15 dark:text-rose-400 dark:hover:text-rose-300 dark:border-white/10 px-3 py-2 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={15} />
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
