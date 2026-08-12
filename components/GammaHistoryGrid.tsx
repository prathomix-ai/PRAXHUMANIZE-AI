"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  File as FileIcon,
  Loader2,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Tag,
  Clock,
  Layers,
  Plus,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export interface DocumentHistoryRow {
  id: string;
  user_id: string;
  original_filename: string;
  category: string | null;
  tone: string | null;
  language?: string | null;
  created_at: string;
}

interface GammaHistoryGridProps {
  refreshKey?: number;
  searchQuery: string;
  filterTab: string;
  onSelectDocument?: (doc: DocumentHistoryRow) => void;
}

export default function GammaHistoryGrid({
  refreshKey,
  searchQuery,
  filterTab,
  onSelectDocument,
}: GammaHistoryGridProps) {
  const [rows, setRows] = useState<DocumentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabaseBrowser
        .from("document_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) throw fetchErr;

      setRows((data as DocumentHistoryRow[]) || []);
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

  // Filter rows based on search and selected filter tab
  const filteredRows = rows.filter((row) => {
    const filename = row.original_filename?.toLowerCase() || "";
    const category = row.category?.toLowerCase() || "";
    const tone = row.tone?.toLowerCase() || "";
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !q || filename.includes(q) || category.includes(q) || tone.includes(q);

    if (!matchesSearch) return false;

    const isPdf = filename.endsWith(".pdf");
    const isDocx = filename.endsWith(".docx");
    const isText = !isPdf && !isDocx || filename.includes("pasted") || filename.includes("text");

    if (filterTab === "documents") return isPdf || isDocx;
    if (filterTab === "text") return isText;
    if (filterTab === "recent") {
      const diffMs = Date.now() - new Date(row.created_at).getTime();
      return diffMs < 7 * 24 * 60 * 60 * 1000; // Last 7 days
    }
    return true; // "all"
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 size={28} className="animate-spin text-aurora-violet mb-3" />
        <p className="text-sm font-medium">Loading your Gamma workspace cards...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl glass-inset p-8 text-center text-rose-400 border border-rose-500/20">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (filteredRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 glass rounded-3xl p-10 border border-white/10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-violet/10 border border-aurora-violet/20 text-aurora-violet mb-4">
          <Sparkles size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No matching humanizations found</h3>
        <p className="mt-1 text-sm text-slate-400 max-w-sm">
          {searchQuery
            ? `No records found matching "${searchQuery}". Try clearing your search.`
            : "Click '+ New Humanization' above to process your first document or raw text."}
        </p>
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
        {filteredRows.map((row, i) => {
          const lowerName = row.original_filename?.toLowerCase() || "";
          const isPdf = lowerName.endsWith(".pdf");
          const isDocx = lowerName.endsWith(".docx");

          // Determine card banner styling
          let bannerGradient = "from-aurora-violet/30 via-aurora-blue/20 to-slate-900";
          let iconColor = "text-aurora-violet";
          let badgeText = "DOCX";

          if (isPdf) {
            bannerGradient = "from-rose-500/30 via-aurora-rose/20 to-slate-900";
            iconColor = "text-rose-400";
            badgeText = "PDF";
          } else if (!isDocx) {
            bannerGradient = "from-aurora-mint/30 via-emerald-500/20 to-slate-900";
            iconColor = "text-aurora-mint";
            badgeText = "RAW TEXT";
          }

          const relativeTime = getRelativeTime(row.created_at);

          return (
            <motion.div
              key={row.id}
              variants={cardVariants}
              whileHover={{ y: -6 }}
              onClick={() => onSelectDocument?.(row)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl glass border border-white/10 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_70%)] bg-slate-950/80 transition-all duration-300 hover:-translate-y-1.5 hover:border-aurora-violet/50 hover:shadow-2xl hover:shadow-aurora-violet/20 cursor-pointer"
            >
              {/* Top Accent Gradient Line */}
              <div className="h-0.5 w-full bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose" />

              {/* Top Banner (Gamma Card Header) */}
              <div
                className={`relative h-28 w-full bg-gradient-to-br ${bannerGradient} p-4 flex flex-col justify-between overflow-hidden border-b border-white/10`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)] pointer-events-none" />

                <div className="flex items-center justify-between z-10">
                  <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white border border-white/20 uppercase tracking-widest shadow-sm">
                    {badgeText}
                  </span>

                  <button
                    onClick={(e) => handleCopyTitle(row.id, row.original_filename, e)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg glass text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 hover:text-white"
                    title="Copy filename"
                  >
                    {copiedId === row.id ? (
                      <Check size={13} className="text-aurora-mint" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>

                {/* Banner Icon */}
                <div className="flex items-center gap-2 z-10">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/15 ${iconColor}`}>
                    {isPdf ? <FileText size={18} /> : <FileIcon size={18} />}
                  </div>
                  <span className="text-xs font-semibold text-white capitalize bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/15 shadow-sm">
                    {row.category ? row.category.replace("_", " ") : "Document"}
                  </span>
                </div>
              </div>

              {/* Bottom Details (Gamma Card Body) */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h4
                    className="font-display text-sm font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-2 leading-snug"
                    title={row.original_filename}
                  >
                    {row.original_filename}
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-aurora-violet/20 backdrop-blur-md px-2.5 py-1 font-semibold text-aurora-violet border border-aurora-violet/40 capitalize shadow-sm">
                      <Sparkles size={11} /> {row.tone || "Professional"}
                    </span>

                    {row.language && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 backdrop-blur-md px-2.5 py-1 font-medium text-slate-200 border border-white/15 shadow-sm">
                        <Globe size={11} /> {row.language}
                      </span>
                    )}
                  </div>

                  {/* Timestamp Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={12} /> {relativeTime}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-aurora-violet font-semibold flex items-center gap-0.5">
                      Open <ExternalLink size={11} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Placeholder card if fewer than 3 user documents exist */}
        {filteredRows.length < 3 && (
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6 }}
            onClick={() => onSelectDocument?.(null as any)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-dashed border-white/20 bg-slate-950/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-aurora-violet/50 hover:bg-slate-950/70 hover:shadow-xl hover:shadow-aurora-violet/10 cursor-pointer min-h-[220px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/30 group-hover:scale-110 transition-transform">
                <Plus size={20} />
              </div>
              <span className="rounded-full bg-aurora-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-aurora-violet border border-aurora-violet/30">
                NEW PROJECT
              </span>
            </div>

            <div className="space-y-1.5 my-4">
              <h4 className="font-display text-base font-bold text-slate-100 group-hover:text-white transition-colors">
                Humanize New Text or File
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click to launch the humanizer workspace and bypass Turnitin, Originality & GPTZero.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-semibold text-aurora-violet">
              <span>Start Humanization</span>
              <ExternalLink size={14} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Relative time helper (e.g., "Just now", "2 hours ago", "Yesterday")
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
