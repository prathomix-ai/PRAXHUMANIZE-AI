"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Lightbulb, Laugh, Rocket, Cpu } from "lucide-react";

interface EntertainmentItem {
  type: "joke" | "slogan" | "fact";
  category: string;
  text: string;
  icon: typeof Sparkles;
}

const ITEMS: EntertainmentItem[] = [
  {
    type: "slogan",
    category: "REWRITING MAGIC",
    text: "Deleting robotic clichés: 'In today's fast-paced digital era' officially eliminated!",
    icon: Sparkles,
  },
  {
    type: "joke",
    category: "AI HUMOR",
    text: "Why did the AI go to therapy? Because it had too many artificial feelings!",
    icon: Laugh,
  },
  {
    type: "fact",
    category: "DID YOU KNOW?",
    text: "Human writers naturally vary sentence length by up to 300% across paragraphs!",
    icon: Lightbulb,
  },
  {
    type: "slogan",
    category: "BYPASS ENGINE",
    text: "Adding human warmth, subtle rhythm, and authentic phrasing to your text...",
    icon: Rocket,
  },
  {
    type: "joke",
    category: "DEV JOKE",
    text: "Why do programmers prefer dark mode? Because light attracts bugs!",
    icon: Laugh,
  },
  {
    type: "fact",
    category: "AI HISTORY",
    text: "The term 'Artificial Intelligence' was first coined back in 1956 at Dartmouth College!",
    icon: Cpu,
  },
  {
    type: "slogan",
    category: "FORMAT PRESERVATION",
    text: "Preserving 100% of your headers, tables, bullet points, and document styling...",
    icon: Sparkles,
  },
  {
    type: "joke",
    category: "TECH HUMOR",
    text: "There are 10 types of people in the world: those who understand binary, and those who don't!",
    icon: Laugh,
  },
  {
    type: "fact",
    category: "LANGUAGE FACT",
    text: "'Hinglish' and code-switching are used naturally by over 350 million people worldwide!",
    icon: Lightbulb,
  },
];

export default function LoadingPhrases() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Cycle text item every 3.5 seconds
    const textInterval = setInterval(() => {
      setIndex((i) => (i + 1) % ITEMS.length);
    }, 3500);

    // Smooth simulated progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + Math.floor(Math.random() * 8) + 3));
    }, 400);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const currentItem = ITEMS[index];
  const IconComponent = currentItem.icon;

  return (
    <div className="flex w-full flex-col items-center justify-center p-4 text-center">
      {/* Animated Pulse Ring Icon */}
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-2xl bg-aurora-violet/20 blur-md"
        />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl glass-inset border border-white/20 shadow-xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border border-dashed border-aurora-violet/40"
          />
          <IconComponent size={20} className="text-aurora-mint animate-pulse" />
        </div>
      </div>

      {/* Cycling Entertainment Box */}
      <div className="min-h-[85px] max-w-md w-full flex flex-col items-center justify-center rounded-xl bg-white/[0.03] p-3.5 border border-white/10 backdrop-blur-md shadow-inner">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="rounded-full bg-aurora-violet/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-aurora-violet uppercase border border-aurora-violet/30">
              {currentItem.category}
            </span>
            <p className="text-xs md:text-sm font-medium leading-relaxed text-slate-200">
              "{currentItem.text}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar & Pulse Indicator */}
      <div className="mt-4 w-full max-w-xs space-y-1.5">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-mint"
            initial={{ width: "10%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-mint opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-mint"></span>
            </span>
            Humanizing content...
          </span>
          <span className="font-mono text-slate-400">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

