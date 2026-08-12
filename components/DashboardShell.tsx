"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Type,
  UploadCloud,
  X,
  Wand2,
  Menu,
  Sparkles,
  LayoutGrid,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
  BookOpen,
  Mail,
  Settings,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import FileDropzone from "./FileDropzone";
import GammaHistoryGrid from "./GammaHistoryGrid";
import ProfileSettings from "./ProfileSettings";
import { supabaseBrowser } from "@/lib/supabase/client";

type InputMode = "text" | "document";

interface HistoryItem {
  id: string;
  original_text?: string | null;
}

interface DashboardShellProps {
  initialCredits: number;
  initialFullName?: string | null;
  initialGender?: string | null;
  initialHistory?: HistoryItem[];
  email?: string;
}

export default function DashboardShell({
  initialCredits,
  initialFullName = "",
  initialGender = "Prefer not to say",
  initialHistory = [],
  email,
}: DashboardShellProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [fullName, setFullName] = useState(initialFullName || "");
  const [gender, setGender] = useState(initialGender || "Prefer not to say");
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [refreshKey, setRefreshKey] = useState(0);

  // New Humanization Modal / Workspace State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync data when refreshKey updates (e.g. after a new document is humanized)
  useEffect(() => {
    async function refreshData() {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabaseBrowser
          .from("users")
          .select("credits, full_name, gender")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCredits(profile.credits);
          if (profile.full_name !== null && profile.full_name !== undefined) {
            setFullName(profile.full_name);
          }
          if (profile.gender !== null && profile.gender !== undefined) {
            setGender(profile.gender);
          }
        }

        const { data: docHistory } = await supabaseBrowser
          .from("document_history")
          .select("id, original_text")
          .eq("user_id", user.id);

        if (docHistory) {
          setHistory(docHistory);
        }
      } catch (err) {
        console.error("Error refreshing dashboard data:", err);
      }
    }

    if (refreshKey > 0) {
      refreshData();
    }
  }, [refreshKey]);

  const handleProcessed = () => {
    setRefreshKey((k) => k + 1);
    setCredits((c) => Math.max(c - 1, 0));
  };

  // Dynamic calculation of stats from real document history
  const totalWordsHumanized = history.reduce((acc, doc) => {
    if (!doc.original_text) return acc;
    const words = doc.original_text.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  const totalDocumentsBypassed = history.length;

  const userDisplayName =
    fullName && fullName.trim() !== ""
      ? fullName
      : email
        ? email.split("@")[0]
        : "Creator";

  return (
    <div className="relative min-h-screen bg-[#050510] text-slate-100 font-body antialiased overflow-x-hidden">
      {/* Background Texture & Soft Top Radial Gradient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050510] to-[#050510]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      <div className="pointer-events-none fixed top-1/4 left-1/3 h-96 w-96 rounded-full bg-aurora-violet/15 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-aurora-blue/15 blur-[120px]" />

      {/* Fixed Left Sidebar for Desktop */}
      <Sidebar
        email={email}
        fullName={fullName}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenNewModal={() => setIsModalOpen(true)}
      />

      {/* Mobile Navigation Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#070714]/80 backdrop-blur-xl px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet via-aurora-blue to-aurora-rose p-0.5 shadow-md">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#050510]">
              <Wand2 size={16} className="text-aurora-violet" />
            </div>
          </div>
          <span className="font-display text-base font-bold text-white">Prathomix</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-aurora-violet to-aurora-blue px-3 py-1.5 text-xs font-semibold text-white shadow-md cursor-pointer"
          >
            <Plus size={15} /> New
          </button>

          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="flex h-9 w-9 items-center justify-center rounded-xl glass text-slate-300 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden sticky top-14 z-30 border-b border-white/10 glass bg-slate-950/95 p-4 backdrop-blur-2xl"
          >
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveNav("dashboard");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <LayoutGrid size={16} className="text-aurora-violet" /> Dashboard
              </button>
              <button
                onClick={() => {
                  setActiveNav("settings");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10"
              >
                <Settings size={16} className="text-aurora-blue" /> Profile Settings
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-aurora-mint hover:bg-white/10"
              >
                <Plus size={16} /> + New Humanization
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area (With Left Margin for Desktop Sidebar) */}
      <main className="relative z-10 md:pl-64 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-10 space-y-8">
          {activeNav === "settings" ? (
            <ProfileSettings
              email={email}
              initialFullName={fullName}
              initialGender={gender}
              onProfileUpdated={({ fullName: newName, gender: newGender }) => {
                setFullName(newName);
                setGender(newGender);
              }}
            />
          ) : (
            <>
              {/* Top Greeting & Primary CTA Bar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-white/10">
                <div>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-white md:text-4xl capitalize">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_100%]">
                      {userDisplayName}
                    </span>{" "}
                    👋
                  </h1>
                  <p className="mt-1 text-xs md:text-sm text-slate-400">
                    Manage your humanized documents or create a new AI detector bypass project.
                  </p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative group flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl p-px font-semibold text-sm text-white shadow-2xl shadow-aurora-violet/30 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose bg-[length:200%_100%] animate-gradient-flow" />
                  <span className="relative flex items-center gap-2 rounded-[15px] bg-slate-950 px-6 py-3 transition-colors group-hover:bg-transparent">
                    <Plus size={18} />
                    <span>+ New Humanization</span>
                  </span>
                </button>
              </div>

              {/* Bento Stat Cards Row (100% Dynamic Real Data) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1: Words Humanized */}
                <div className="relative overflow-hidden rounded-3xl glass border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15),transparent_70%)] bg-slate-950/80 p-6 backdrop-blur-xl shadow-xl transition-all hover:border-aurora-violet/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Words Humanized
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/30">
                      <Sparkles size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-extrabold text-white">
                      {totalWordsHumanized.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                      <TrendingUp size={12} /> Live Total
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Total words converted to 100% human score
                  </p>
                </div>

                {/* Card 2: AI Detectors Bypassed */}
                <div className="relative overflow-hidden rounded-3xl glass border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_70%)] bg-slate-950/80 p-6 backdrop-blur-xl shadow-xl transition-all hover:border-aurora-blue/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Documents Bypassed
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-blue/15 text-aurora-blue border border-aurora-blue/30">
                      <ShieldCheck size={18} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-extrabold text-white">
                      {totalDocumentsBypassed.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-aurora-mint">
                      History Count
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Bypasses Turnitin, Originality.ai & GPTZero
                  </p>
                </div>

                {/* Card 3: Current Plan */}
                <div className="relative overflow-hidden rounded-3xl glass border border-white/10 bg-[radial-gradient(ellipse_at_top_left,rgba(236,72,153,0.15),transparent_70%)] bg-slate-950/80 p-6 backdrop-blur-xl shadow-xl transition-all hover:border-aurora-rose/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current Plan
                      </span>
                      <span className="rounded-full bg-aurora-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-aurora-violet border border-aurora-violet/40">
                        PRO MEMBER
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-2xl font-extrabold text-white">
                        {credits} Credits Left
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[11px] text-slate-400">
                      Real-time Database Balance
                    </span>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="rounded-xl glass border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Use Credits
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Start Shortcuts Section */}
              <div className="rounded-3xl glass border border-white/10 bg-slate-950/50 p-5 backdrop-blur-xl shadow-xl space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="text-aurora-violet" /> Quick Start Workspaces
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setInputMode("text");
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 rounded-2xl glass-inset p-3.5 border border-white/10 hover:border-aurora-violet/40 hover:bg-white/[0.04] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/30 group-hover:scale-105 transition-transform">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white">
                        Humanize Essay
                      </h4>
                      <p className="text-[10px] text-slate-400">Academic & Research papers</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputMode("document");
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 rounded-2xl glass-inset p-3.5 border border-white/10 hover:border-aurora-blue/40 hover:bg-white/[0.04] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aurora-blue/15 text-aurora-blue border border-aurora-blue/30 group-hover:scale-105 transition-transform">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white">
                        Bypass Turnitin
                      </h4>
                      <p className="text-[10px] text-slate-400">Upload .docx / .pdf file</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputMode("text");
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 rounded-2xl glass-inset p-3.5 border border-white/10 hover:border-aurora-rose/40 hover:bg-white/[0.04] transition-all text-left group cursor-pointer"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-aurora-rose/15 text-aurora-rose border border-aurora-rose/30 group-hover:scale-105 transition-transform">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white">
                        Write Email
                      </h4>
                      <p className="text-[10px] text-slate-400">Professional communications</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Real-Time Search Row */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 rounded-2xl glass p-1.5 border border-white/15 bg-white/[0.03] backdrop-blur-xl shadow-xl w-fit">
                  {[
                    { id: "all", label: "All Projects" },
                    { id: "recent", label: "Recent (7 Days)" },
                    { id: "documents", label: "Documents (.docx/.pdf)" },
                    { id: "text", label: "Raw Text" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id)}
                      className={`relative rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${filterTab === tab.id
                          ? "text-white shadow-md"
                          : "text-slate-400 hover:text-slate-200"
                        }`}
                    >
                      {filterTab === tab.id && (
                        <motion.div
                          layoutId="gamma-filter-tab"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-aurora-violet/80 to-aurora-blue/80"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Real-time Search Input */}
                <div className="relative w-full md:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history by name or tone..."
                    className="w-full rounded-2xl glass py-2.5 pl-10 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-aurora-violet/50 border border-white/15 bg-white/[0.03] backdrop-blur-xl shadow-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Document History Grid (Gamma Style) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-bold text-slate-100">
                    Recent Projects
                  </h2>
                </div>

                <GammaHistoryGrid
                  refreshKey={refreshKey}
                  searchQuery={searchQuery}
                  filterTab={filterTab}
                  onNewProject={() => setIsModalOpen(true)}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {/* --- Interactive "+ New Humanization" Creation Modal --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl rounded-3xl glass border border-white/20 p-6 md:p-8 shadow-2xl bg-slate-950/95 my-8 max-h-[90vh] overflow-y-auto thin-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora-violet/20 border border-aurora-violet/30 text-aurora-violet">
                    <Wand2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">
                      New Humanization Project
                    </h3>
                    <p className="text-xs text-slate-400">
                      Bypass Turnitin, GPTZero, and Originality.ai in seconds
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl glass text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mode Switcher Inside Modal */}
              <div className="mt-6 flex justify-center">
                <div className="flex w-fit rounded-2xl glass-inset p-1.5 border border-white/10">
                  <button
                    onClick={() => setInputMode("text")}
                    className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold transition-all cursor-pointer ${inputMode === "text"
                        ? "text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    {inputMode === "text" && (
                      <motion.div
                        layoutId="modal-input-mode"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-aurora-violet to-aurora-blue"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Type size={16} className="relative z-10" />
                    <span className="relative z-10">Paste Raw Text</span>
                  </button>

                  <button
                    onClick={() => setInputMode("document")}
                    className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold transition-all cursor-pointer ${inputMode === "document"
                        ? "text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200"
                      }`}
                  >
                    {inputMode === "document" && (
                      <motion.div
                        layoutId="modal-input-mode"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-aurora-violet to-aurora-blue"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <UploadCloud size={16} className="relative z-10" />
                    <span className="relative z-10">Upload DOCX / PDF</span>
                  </button>
                </div>
              </div>

              {/* Input Workspaces */}
              <div className="mt-6">
                <AnimatePresence mode="wait">
                  {inputMode === "text" ? (
                    <motion.div
                      key="modal-text"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Workspace
                        onProcessed={() => {
                          handleProcessed();
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="modal-doc"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FileDropzone
                        onProcessed={() => {
                          handleProcessed();
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

