"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  File as FileIcon,
  X,
  Sparkles,
  Download,
  ArrowRight,
} from "lucide-react";
import CategoryChips from "./CategoryChips";
import ToneToggle from "./ToneToggle";
import LoadingPhrases from "./LoadingPhrases";
import LanguageSelect from "./LanguageSelect";
import type { Category, Tone } from "@/lib/llm";
import { supabaseBrowser } from "@/lib/supabase/client";

type Status = "idle" | "uploading" | "done" | "error";

const ACCEPTED_EXT = [".pdf", ".docx", ".pptx"];

export default function FileDropzone({
  onProcessed,
}: {
  onProcessed?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<Category>("report");
  const [tone, setTone] = useState<Tone>("professional");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Processed document state
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>("");
  const [storagePath, setStoragePath] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Automatically revoke Object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (downloadUrl && downloadUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const validateAndSetFile = useCallback((f: File) => {
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXT.includes(ext)) {
      setError("Only .pdf, .docx, and .pptx files are supported.");
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      setError("File is too large. Max size is 10MB.");
      return;
    }
    setError("");
    setFile(f);
    setStatus("idle");

    if (downloadUrl && downloadUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(downloadUrl);
    }
    setDownloadBlob(null);
    setDownloadUrl(null);
    setDownloadFileName("");
    setStoragePath(null);
  }, [downloadUrl]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSetFile(dropped);
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) validateAndSetFile(picked);
  }

  async function handleHumanize(e?: React.FormEvent | React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!file) return;
    setStatus("uploading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      formData.append("tone", tone);
      formData.append("language", language);

      const res = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");

      if (!res.ok || (contentType && contentType.includes("application/json"))) {
        const errorJson = await res.json();
        throw new Error(errorJson.message || errorJson.error || "Failed to process file.");
      }

      // Successful file stream back from API
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const outputName = `Humanized_${file.name}`;

      setDownloadBlob(blob);
      setDownloadUrl(url);
      setDownloadFileName(outputName);
      setStatus("done");
      onProcessed?.();
    } catch (err: any) {
      setError(err.message || "Failed to process file. Please try again.");
      setStatus("error");
    }
  }

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = downloadFileName || `Humanized_${file?.name || "document.pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    if (!storagePath) {
      alert("No processed file available for download.");
      return;
    }

    try {
      const response = await fetch(`/api/download-file?path=${encodeURIComponent(storagePath)}`);
      const contentType = response.headers.get("content-type");

      if (!response.ok || (contentType && contentType.includes("text/html"))) {
        alert("Download failed: Server returned an error page.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const targetFileName = downloadFileName || (file ? `Humanized_${file.name}` : "Humanized_Document.pdf");

      const a = document.createElement("a");
      a.href = url;
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Download failed: " + (err?.message || "Server returned an error."));
    }
  }

  function reset(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (downloadUrl && downloadUrl.startsWith("blob:")) {
      window.URL.revokeObjectURL(downloadUrl);
    }
    setFile(null);
    setStatus("idle");
    setDownloadBlob(null);
    setDownloadUrl(null);
    setDownloadFileName("");
    setStoragePath(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 shadow-sm dark:shadow-xl transition-colors duration-200">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            Category
          </p>
          <CategoryChips value={category} onChange={setCategory} />
        </div>
        <div className="flex-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
            Tone
          </p>
          <ToneToggle value={tone} onChange={setTone} />
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/50 dark:border-aurora-violet dark:bg-aurora-violet/[0.06]"
            : "border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 bg-slate-50/50 dark:bg-transparent"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.pptx"
          className="hidden"
          onChange={handleBrowse}
        />

        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(99,102,241,0.4), 0 0 40px 4px rgba(99,102,241,0.25)",
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!file && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={isDragging ? { y: [-4, 2, -4] } : { y: 0 }}
                transition={{ repeat: isDragging ? Infinity : 0, duration: 1.2 }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl glass-inset border border-slate-200 dark:border-white/10"
              >
                <UploadCloud
                  size={24}
                  className={isDragging ? "text-indigo-600 dark:text-aurora-violet" : "text-slate-400"}
                />
              </motion.div>
              <p className="font-display text-base font-medium text-slate-900 dark:text-slate-200">
                Drag & drop your document
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                or click to browse — .PDF, .DOCX, or .PPTX, up to 10MB
              </p>
            </motion.div>
          )}

          {file && status !== "done" && (
            <motion.div
              key="picked"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full max-w-sm flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex w-full items-center gap-3 rounded-xl glass-inset px-4 py-3 border border-slate-200 dark:border-white/10">
                {file.name.endsWith(".pdf") ? (
                  <FileText size={20} className="shrink-0 text-rose-500 dark:text-rose-400" />
                ) : file.name.endsWith(".pptx") ? (
                  <FileIcon size={20} className="shrink-0 text-amber-500 dark:text-amber-400" />
                ) : (
                  <FileIcon size={20} className="shrink-0 text-sky-500 dark:text-aurora-blue" />
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {status !== "uploading" && (
                  <button
                    type="button"
                    onClick={(e) => reset(e)}
                    className="shrink-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {status === "uploading" ? (
                <LoadingPhrases />
              ) : (
                <div className="flex items-center gap-2.5">
                  <LanguageSelect value={language} onChange={setLanguage} />
                  <motion.button
                    type="button"
                    onClick={handleHumanize}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-slate-900 text-white dark:bg-gradient-to-r dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose dark:bg-[length:200%_100%] dark:animate-gradient-flow" />
                    <span className="relative flex items-center gap-2 text-white">
                      <Sparkles size={15} /> Humanize Document
                    </span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {status === "done" && file && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex w-full max-w-sm flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-aurora-mint/15">
                <Sparkles size={20} className="text-emerald-600 dark:text-aurora-mint" />
              </div>
              <p className="mb-4 font-display text-sm font-medium text-slate-900 dark:text-slate-200">
                Your document has been humanized
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(e);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-white/10 px-4 py-2 text-sm font-medium dark:text-white transition-colors hover:bg-slate-800 dark:hover:bg-white/15 cursor-pointer shadow-sm"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  type="button"
                  onClick={(e) => reset(e)}
                  className="flex items-center gap-1.5 rounded-xl glass-inset border border-slate-200 dark:border-white/10 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06] cursor-pointer"
                >
                  New file <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 text-center text-xs text-rose-600 dark:text-rose-400 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
