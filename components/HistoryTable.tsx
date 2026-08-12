"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, File as FileIcon, Loader2, History, Sparkles } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

interface DocumentHistoryRow {
  id: string;
  user_id: string;
  original_filename: string;
  category: string | null;
  tone: string | null;
  created_at: string;
}

export default function HistoryTable({ refreshKey }: { refreshKey?: number }) {
  const [rows, setRows] = useState<DocumentHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const { data, error: fetchErr } = await supabaseBrowser
        .from("document_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

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

  return (
    <div className="glass rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md border border-white/10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora-violet/10 text-aurora-violet">
            <History size={18} />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-100">
              Document History
            </h2>
            <p className="text-xs text-slate-400">
              Your recent humanized document records
            </p>
          </div>
        </div>
        {rows.length > 0 && (
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-slate-400">
            {rows.length} {rows.length === 1 ? "document" : "documents"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 size={24} className="animate-spin text-aurora-violet" />
          <p className="mt-2 text-xs">Loading document history...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-rose-400">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Sparkles size={24} className="mb-2 text-slate-600 opacity-60" />
          <p className="text-sm font-medium text-slate-400">No document history found</p>
          <p className="mt-1 text-xs text-slate-500">
            Humanize your first file above to see your records here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 font-semibold">Filename</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Tone</th>
                <th className="py-3 px-4 text-right font-semibold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row, i) => {
                const isPdf = row.original_filename?.toLowerCase().endsWith(".pdf");
                const formattedDate = new Date(row.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      <div className="flex items-center gap-2.5">
                        {isPdf ? (
                          <FileText size={18} className="shrink-0 text-rose-400" />
                        ) : (
                          <FileIcon size={18} className="shrink-0 text-aurora-blue" />
                        )}
                        <span className="max-w-[240px] truncate text-slate-200 font-medium group-hover:text-white transition-colors" title={row.original_filename}>
                          {row.original_filename}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-slate-300">
                        {row.category ? row.category.replace("_", " ") : "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      <span className="inline-flex items-center rounded-md bg-aurora-violet/10 px-2 py-1 text-xs font-medium text-aurora-violet">
                        {row.tone || "N/A"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                      {formattedDate}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

