"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, ArrowRight, RotateCcw } from "lucide-react";
import CategoryChips from "./CategoryChips";
import ToneToggle from "./ToneToggle";
import LoadingPhrases from "./LoadingPhrases";
import SkeletonShimmer from "./SkeletonShimmer";
import LanguageSelect from "./LanguageSelect";
import type { Category, Tone } from "@/lib/llm";
import { supabaseBrowser } from "@/lib/supabase/client";

const MAX_CHARS = 8000;

type Status = "idle" | "loading" | "done" | "error";

export default function Workspace({
  userId,
  onProcessed,
}: {
  userId?: string;
  onProcessed?: () => void;
}) {
  const [category, setCategory] = useState<Category>("essay");
  const [tone, setTone] = useState<Tone>("conversational");
  const [language, setLanguage] = useState("English");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const charCount = inputText.length;
  const overLimit = charCount > MAX_CHARS;
  const canSubmit = inputText.trim().length > 0 && !overLimit && status !== "loading";

  const outputWordCount = useMemo(
    () => (outputText ? outputText.trim().split(/\s+/).length : 0),
    [outputText]
  );

  async function handleHumanize(e?: React.FormEvent | React.MouseEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!canSubmit) return;
    setStatus("loading");
    setErrorMsg("");
    setOutputText("");

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, category, tone, language, userId }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.message || data.error || "Failed to process text.");
      }

      setOutputText(data.humanizedText);
      setStatus("done");
      onProcessed?.();

      if (userId) {
        await supabaseBrowser.from("generations").insert({
          user_id: userId,
          original_text: inputText,
          humanized_text: data.humanizedText,
          category,
          tone,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to humanize text. Please try again.");
      setStatus("error");
    }
  }

  function handleCopy() {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleReset() {
    setInputText("");
    setOutputText("");
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="glass mb-4 flex flex-col gap-4 rounded-2xl p-4 md:p-5 lg:flex-row lg:items-start lg:justify-between border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 shadow-sm dark:shadow-xl transition-colors duration-200">
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

      {/* Workspaces */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* INPUT */}
        <motion.div
          layout
          className="glass relative flex min-h-[420px] flex-col rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 shadow-sm dark:shadow-xl transition-colors duration-200"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-200">
              AI Input
            </h2>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer"
            >
              <RotateCcw size={12} /> Clear
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your AI-generated text here — a report, an essay, a cold email, anything that sounds a little too perfect..."
            className="thin-scrollbar flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
          />

          <div className="mt-3 flex items-center justify-between border-t border-slate-200/80 dark:border-white/5 pt-3">
            <span
              className={`font-mono text-xs ${
                overLimit ? "text-rose-500 dark:text-rose-400" : "text-slate-500 dark:text-slate-500"
              }`}
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>

            <div className="flex items-center gap-2.5">
              <LanguageSelect value={language} onChange={setLanguage} />

              <motion.button
                onClick={handleHumanize}
                disabled={!canSubmit}
                whileTap={canSubmit ? { scale: 0.97 } : undefined}
                className={`relative flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity cursor-pointer ${
                  canSubmit ? "opacity-100" : "cursor-not-allowed opacity-40"
                }`}
              >
                <span className="absolute inset-0 bg-slate-900 text-white dark:bg-gradient-to-r dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose dark:bg-[length:200%_100%] dark:animate-gradient-flow" />
                {status === "loading" && (
                  <motion.span
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                )}
                <span className="relative flex items-center gap-2 text-white">
                  {status === "loading" ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <Sparkles size={15} />
                      </motion.span>
                      Humanizing
                    </>
                  ) : (
                    <>
                      Humanize <ArrowRight size={15} />
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* OUTPUT */}
        <motion.div
          layout
          className="glass relative flex min-h-[420px] flex-col rounded-2xl p-5 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 shadow-sm dark:shadow-xl transition-colors duration-200"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-200">
              Humanized Output
            </h2>
            {status === "done" && outputText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-slate-300 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600 dark:text-aurora-mint" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="thin-scrollbar flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-full flex-col justify-center gap-6"
                >
                  <SkeletonShimmer />
                  <LoadingPhrases />
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center text-center text-sm text-rose-600 dark:text-rose-400"
                >
                  {errorMsg}
                </motion.div>
              )}

              {status === "done" && (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-900 dark:text-slate-200"
                >
                  {outputText}
                </motion.p>
              )}

              {status === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center text-center text-sm text-slate-400 dark:text-slate-600"
                >
                  Your humanized text will appear here.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {status === "done" && (
            <div className="mt-3 border-t border-slate-200/80 dark:border-white/5 pt-3">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-600">
                {outputWordCount.toLocaleString()} words
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
