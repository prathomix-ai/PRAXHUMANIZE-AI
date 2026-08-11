"use client";

import { motion } from "framer-motion";
import type { Tone } from "@/lib/llm";

const TONES: { id: Tone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "conversational", label: "Conversational" },
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
            className={`relative rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
              active ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tone-pill"
                className="absolute inset-0 rounded-lg bg-white/10 ring-1 ring-white/20"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
