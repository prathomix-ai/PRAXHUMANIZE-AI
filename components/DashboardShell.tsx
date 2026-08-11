"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, UploadCloud } from "lucide-react";
import Header from "./Header";
import Workspace from "./Workspace";
import FileDropzone from "./FileDropzone";
import HistoryTable from "./HistoryTable";

type InputMode = "text" | "document";

export default function DashboardShell({
  initialCredits,
  email,
}: {
  initialCredits: number;
  email?: string;
}) {
  const [mode, setMode] = useState<InputMode>("text");
  const [credits, setCredits] = useState(initialCredits);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProcessed = () => {
    setRefreshKey((k) => k + 1);
    setCredits((c) => Math.max(c - 1, 0));
  };

  return (
    <>
      <Header credits={credits} email={email} />

      <div className="relative z-10 mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 pb-16 pt-4 md:px-8">
        {/* Header & Animated Segmented Toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white md:text-3xl">
              Humanize AI Content
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Paste raw text or upload a document to bypass AI detectors naturally.
            </p>
          </div>

          {/* Animated Tab Switcher */}
          <div className="flex w-fit rounded-xl glass-inset p-1.5">
            <button
              onClick={() => setMode("text")}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "text" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "text" && (
                <motion.div
                  layoutId="dashboard-mode-tab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-aurora-violet/80 to-aurora-blue/80 shadow-lg shadow-aurora-violet/20"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Type size={16} className="relative z-10" />
              <span className="relative z-10">Paste Text</span>
            </button>

            <button
              onClick={() => setMode("document")}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                mode === "document" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode === "document" && (
                <motion.div
                  layoutId="dashboard-mode-tab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-aurora-violet/80 to-aurora-blue/80 shadow-lg shadow-aurora-violet/20"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <UploadCloud size={16} className="relative z-10" />
              <span className="relative z-10">Upload Document</span>
            </button>
          </div>
        </div>

        {/* Input Workspaces */}
        <AnimatePresence mode="wait">
          {mode === "text" ? (
            <motion.div
              key="paste-text"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Workspace onProcessed={handleProcessed} />
            </motion.div>
          ) : (
            <motion.div
              key="upload-document"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FileDropzone onProcessed={handleProcessed} />
            </motion.div>
          )}
        </AnimatePresence>

        <HistoryTable refreshKey={refreshKey} />
      </div>
    </>
  );
}

