"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  File as FileIcon,
  Loader2,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Clock,
  Plus,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export interface DocumentHistoryRow {
  id: string;
  user_id: string;
  input_type?: string | null;
  file_name?: string | null;
  original_filename?: string | null;
  file_url?: string | null;
  original_text?: string | null;
  humanized_text?: string | null;
  category: string | null;
  tone: string | null;
  language?: string | null;
  status?: string | null;
  created_at: string;
  updated_at?: string | null;
}

interface GammaHistoryGridProps {
  refreshKey?: number;
  searchQuery: string;
  filterTab: string;
  onSelectDocument?: (doc: DocumentHistoryRow | null) => void;
  onNewProject?: () => void;
}

export default function GammaHistoryGrid({
  refreshKey,
  searchQuery,
  filterTab,
  onSelectDocument,
  onNewProject,
}: GammaHistoryGridProps) {
  const [rows, setRows] = useState<DocumentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        setRows([]);
        setLoading(false);
        return;
      }

      const { data: history, error: fetchErr } = await supabaseBrowser
        .from("document_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setRows((history as DocumentHistoryRow[]) || []);
    } catch (err: any) {
      console.error("Error fetching document history:", err);
      setError(err?.message || "Failed to load document history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshKey]);

  const handleCopyTitle = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewProjectClick = () => {
    if (onNewProject) onNewProject();
  };

  // Filter rows based on search query and filter tabs
  const filteredRows = rows.filter((row) => {
    const rawTitle = row.file_name || row.original_filename || row.original_text || "";
    const matchesSearch =
      searchQuery.trim() === "" ||
      rawTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.category && row.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (row.tone && row.tone.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "all") return true;
    if (filterTab === "recent") {
      const createdAt = new Date(row.created_at).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return createdAt >= sevenDaysAgo;
    }
    if (filterTab === "documents") {
      const title = rawTitle.toLowerCase();
      return title.endsWith(".pdf") || title.endsWith(".docx") || row.input_type === "document";
    }
    if (filterTab === "text") {
      const title = rawTitle.toLowerCase();
      return !title.endsWith(".pdf") && !title.endsWith(".docx") && row.input_type !== "document";
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-aurora-violet" />
        <p className="text-xs">Loading project history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/10 p-6 text-center text-xs text-rose-600 dark:text-rose-400">
        <p>{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-3 text-xs underline hover:text-rose-800 dark:hover:text-rose-300 font-semibold cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {/* "+ NEW PROJECT" Card */}
        <motion.div
          key="new-project-card"
          variants={cardVariants}
          whileHover={{ y: -6 }}
          onClick={handleNewProjectClick}
          className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-indigo-300 dark:border-aurora-violet/40 bg-white/60 dark:bg-slate-950/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-indigo-600 dark:hover:border-aurora-violet hover:bg-white dark:hover:bg-slate-950/70 hover:shadow-xl dark:hover:shadow-aurora-violet/20 cursor-pointer min-h-[220px]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-aurora-violet/15 text-indigo-600 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/30 group-hover:scale-110 transition-transform">
              <Plus size={20} />
            </div>
            <span className="rounded-full bg-indigo-50 dark:bg-aurora-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/30 uppercase tracking-wider">
              NEW PROJECT
            </span>
          </div>

          <div className="space-y-1.5 my-4">
            <h4 className="font-display text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
              Humanize New Text or File
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Click to launch the humanizer workspace and bypass Turnitin, Originality & GPTZero.
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-white/5 text-xs font-semibold text-indigo-600 dark:text-aurora-violet">
            <span>Start Humanization</span>
            <ExternalLink size={14} />
          </div>
        </motion.div>

        {/* Dynamic Cards */}
        {filteredRows.map((row) => {
          const rawTitle = row.file_name || row.original_filename || row.original_text || "Untitled Document";
          const displayTitle = rawTitle.length > 30 ? `${rawTitle.slice(0, 27)}...` : rawTitle;

          const lowerName = rawTitle.toLowerCase();
          const isPdf = lowerName.endsWith(".pdf");
          const isDocx = lowerName.endsWith(".docx");

          let bannerGradient = "from-indigo-100/70 via-sky-50 to-white dark:from-aurora-violet/30 dark:via-aurora-blue/20 dark:to-slate-900";
          let iconColor = "text-indigo-600 dark:text-aurora-violet";
          let badgeText = "DOCX";

          if (isPdf) {
            bannerGradient = "from-rose-100/70 via-purple-50 to-white dark:from-rose-500/30 dark:via-aurora-rose/20 dark:to-slate-900";
            iconColor = "text-rose-600 dark:text-rose-400";
            badgeText = "PDF";
          } else if (!isDocx) {
            bannerGradient = "from-emerald-100/70 via-teal-50 to-white dark:from-aurora-mint/30 dark:via-emerald-500/20 dark:to-slate-900";
            iconColor = "text-emerald-600 dark:text-aurora-mint";
            badgeText = "RAW TEXT";
          }

          const relativeTime = getRelativeTime(row.created_at);

          return (
            <motion.div
              key={row.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              onClick={() => onSelectDocument?.(row)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl glass border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-300 dark:hover:border-aurora-violet/50 shadow-sm dark:shadow-2xl cursor-pointer"
            >
              {/* Top Accent Gradient Line */}
              <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 via-sky-500 to-purple-600 dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose" />

              {/* Banner Header */}
              <div
                className={`relative h-28 w-full bg-gradient-to-br ${bannerGradient} p-4 flex flex-col justify-between overflow-hidden border-b border-slate-200/60 dark:border-white/10`}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="rounded-full bg-slate-900/10 dark:bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-slate-800 dark:text-white border border-slate-300/60 dark:border-white/20 uppercase tracking-widest shadow-sm">
                    {badgeText}
                  </span>

                  <button
                    onClick={(e) => handleCopyTitle(row.id, rawTitle, e)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg glass text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    title="Copy title"
                  >
                    {copiedId === row.id ? (
                      <Check size={13} className="text-emerald-600 dark:text-aurora-mint" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                {/* Banner Icon */}
                <div className="flex items-center gap-2 z-10">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/80 dark:bg-white/10 backdrop-blur-md border border-slate-200/80 dark:border-white/15 ${iconColor}`}>
                    {isPdf ? <FileText size={18} /> : <FileIcon size={18} />}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white capitalize bg-white/80 dark:bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-white/15 shadow-sm">
                    {row.category ? row.category.replace("_", " ") : "Document"}
                  </span>
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4
                    className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug"
                    title={rawTitle}
                  >
                    {displayTitle}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-aurora-violet/20 backdrop-blur-md px-2.5 py-1 font-semibold text-indigo-700 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/40 capitalize shadow-sm">
                      <Sparkles size={11} /> {row.tone || "Standard"}
                    </span>

                    {row.language && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/10 backdrop-blur-md px-2.5 py-1 font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 shadow-sm">
                        <Globe size={11} /> {row.language}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {relativeTime}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-aurora-violet font-semibold flex items-center gap-0.5">
                      Open <ExternalLink size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

function getRelativeTime(dateString: string): string {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(seconds) || seconds < 30) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
