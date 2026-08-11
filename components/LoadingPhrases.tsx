"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const PHRASES = [
  "Analyzing robot text...",
  "Sprinkling human emotions...",
  "Removing AI buzzwords...",
  "Adding a soul...",
  "Untangling the em dashes...",
  "Teaching it to ramble a little...",
];

export default function LoadingPhrases() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PHRASES.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
      >
        <Sparkles size={14} className="text-aurora-violet" />
      </motion.span>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
        >
          {PHRASES[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
