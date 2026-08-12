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

interface SidebarProps {
  email?: string;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenNewModal: () => void;
}

export default function Sidebar({
  email,
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

  const username = email ? email.split("@")[0] : "Creator";

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-40 hidden w-64 flex-col justify-between border-r border-white/10 bg-[#070714]/85 backdrop-blur-2xl p-5 md:flex select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet via-aurora-blue to-aurora-rose p-0.5 shadow-lg shadow-aurora-violet/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#050510]">
              <Wand2 size={19} className="text-aurora-violet" strokeWidth={2.4} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-lg font-bold tracking-tight text-white">
                Prathomix
              </span>
              <span className="rounded-full bg-aurora-violet/15 px-1.5 py-0.5 text-[9px] font-bold text-aurora-violet border border-aurora-violet/30 tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Workspace Dashboard</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
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
                    ? "bg-aurora-violet/20 text-white border border-aurora-violet/40 shadow-md shadow-aurora-violet/10 font-semibold"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? "text-aurora-violet" : "text-slate-400"}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-aurora-violet" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-white/10">
        <div className="mb-3 rounded-2xl glass-inset p-3 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet/30 to-aurora-blue/30 border border-aurora-violet/40 text-aurora-mint">
              <UserCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-xs font-semibold text-slate-200 capitalize"
                title={email || "User Account"}
              >
                {username}
              </p>
              <p className="text-[10px] text-aurora-mint flex items-center gap-1 font-medium">
                <ShieldCheck size={11} /> Pro Member
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl glass px-3 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/15 hover:text-rose-300 disabled:opacity-50 cursor-pointer border border-white/10"
        >
          <LogOut size={15} />
          <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
