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

  async function handleHumanize() {
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

      const contentType = res.headers.get("content-type") || "";

      // 1. Handle HTML redirects (e.g. auth middleware redirecting to /dashboard or /login)
      if (contentType.includes("text/html")) {
        throw new Error("Session expired or request redirected. Please sign in again.");
      }

      // 2. Handle JSON server error responses
      if (contentType.includes("application/json") || !res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Server returned error status ${res.status}`);
      }

      // 3. Receive binary Blob from API response
      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        throw new Error("Received empty document file payload from server.");
      }

      if (blob.type.includes("text/html")) {
        throw new Error("Received HTML content instead of document binary file.");
      }

      // Clean up previous blob URL if exists
      if (downloadUrl && downloadUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(downloadUrl);
      }

      // 4. Generate local in-memory Blob URL for download
      const url = window.URL.createObjectURL(blob);
      console.log("Download URL created successfully:", url);

      const outputName = file.name.startsWith("Humanized_")
        ? file.name
        : `Humanized_${file.name}`;

      setDownloadBlob(blob);
      setDownloadUrl(url);
      setDownloadFileName(outputName);

      setStatus("done");
      onProcessed?.();
    } catch (err: any) {
      console.error("[FileDropzone Error]:", err);
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  async function handleDownload(e?: React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      let targetUrl = downloadUrl;

      // Fallback 1: Re-create Object URL from stored Blob if downloadUrl was lost/revoked
      if ((!targetUrl || targetUrl.trim() === "") && downloadBlob) {
        console.warn("Re-creating Object URL from stored Blob state...");
        targetUrl = window.URL.createObjectURL(downloadBlob);
        setDownloadUrl(targetUrl);
      }

      // Fallback 2: Generate Signed URL if we have a Supabase Storage path
      if ((!targetUrl || targetUrl.trim() === "") && storagePath) {
        console.log("Fetching Signed URL from Supabase Storage for path:", storagePath);
        const { data, error: signErr } = await supabaseBrowser.storage
          .from("documents")
          .createSignedUrl(storagePath, 60 * 5);

        if (signErr || !data?.signedUrl) {
          throw new Error(signErr?.message || "Failed to create signed URL from Supabase.");
        }
        targetUrl = data.signedUrl;
      }

      if (!targetUrl || targetUrl.trim() === "") {
        console.error("API returned HTML instead of a file! Backend failed.");
        alert("Download failed: Server returned an HTML error page instead of a document.");
        return;
      }

      // STRICT VALIDATION CHECK BEFORE DOWNLOADING
      const response = await fetch(targetUrl);
      const contentType = response.headers.get("content-type");

      // If the backend returned HTML (an error page or redirect), STOP the download.
      if (!response.ok || (contentType && contentType.includes("text/html"))) {
        console.error("API returned HTML instead of a file! Backend failed.");
        alert("Download failed: Server returned an HTML error page instead of a document.");
        return;
      }

      // Otherwise, process the Blob safely
      const blob = await response.blob();

      // Double-check blob mime type
      if (blob.type && blob.type.includes("text/html")) {
        console.error("API returned HTML instead of a file! Backend failed.");
        alert("Download failed: Server returned an HTML error page instead of a document.");
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const targetFileName =
        downloadFileName || (file ? `Humanized_${file.name}` : "Humanized_Document.pdf");

      const a = document.createElement("a");
      a.href = url;
      a.download = targetFileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("API returned HTML instead of a file! Backend failed.", err);
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
    <div className="glass rounded-2xl p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Category
          </p>
          <CategoryChips value={category} onChange={setCategory} />
        </div>
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
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
            ? "border-aurora-violet bg-aurora-violet/[0.06]"
            : "border-white/10 hover:border-white/20"
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
                  "0 0 0 1px rgba(139,92,246,0.4), 0 0 40px 4px rgba(139,92,246,0.25)",
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
                animate={
                  isDragging ? { y: [-4, 2, -4] } : { y: 0 }
                }
                transition={{ repeat: isDragging ? Infinity : 0, duration: 1.2 }}
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl glass-inset"
              >
                <UploadCloud
                  size={24}
                  className={isDragging ? "text-aurora-violet" : "text-slate-400"}
                />
              </motion.div>
              <p className="font-display text-base font-medium text-slate-200">
                Drag & drop your document
              </p>
              <p className="mt-1 text-sm text-slate-500">
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
              <div className="mb-4 flex w-full items-center gap-3 rounded-xl glass-inset px-4 py-3">
                {file.name.endsWith(".pdf") ? (
                  <FileText size={20} className="shrink-0 text-rose-400" />
                ) : file.name.endsWith(".pptx") ? (
                  <FileIcon size={20} className="shrink-0 text-amber-400" />
                ) : (
                  <FileIcon size={20} className="shrink-0 text-aurora-blue" />
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm text-slate-200">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>

                {status !== "uploading" && (
                  <button
                    type="button"
                    onClick={(e) => reset(e)}
                    className="shrink-0 text-slate-500 hover:text-slate-300"
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
                    className="relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-2.5 text-sm font-semibold text-white"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose bg-[length:200%_100%] animate-gradient-flow" />
                    <span className="relative flex items-center gap-2">
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
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-aurora-mint/15">
                <Sparkles size={20} className="text-aurora-mint" />
              </div>
              <p className="mb-4 font-display text-sm font-medium text-slate-200">
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
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/15 cursor-pointer"
                >
                  <Download size={14} /> Download
                </button>
                <button
                  type="button"
                  onClick={(e) => reset(e)}
                  className="flex items-center gap-1.5 rounded-xl glass-inset px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] cursor-pointer"
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
            className="mt-3 text-center text-xs text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

