"use client";

import { motion } from "framer-motion";
import type { Tone } from "@/lib/llm";

const TONES: { id: Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "conversational", label: "Conversational" },
  { id: "easy_words", label: "Easy Words" },
  { id: "empathetic", label: "Empathetic" },
  { id: "witty", label: "Witty" },
  { id: "academic", label: "Academic" },
];

export default function ToneToggle({
  value,
  onChange,
}: {
  value: Tone;
  onChange: (t: Tone) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TONES.map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
              active
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tone-pill"
                className="absolute inset-0 rounded-lg bg-slate-200/90 dark:bg-white/10 border border-slate-300/80 dark:border-white/20 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
