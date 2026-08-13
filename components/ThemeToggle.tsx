"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeToggleProps {
  variant?: "pill" | "buttons" | "dropdown";
  className?: string;
}

export default function ThemeToggle({ variant = "pill", className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-16 rounded-full bg-slate-200/60 dark:bg-white/10 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === "dark";

  if (variant === "buttons") {
    return (
      <div className={`inline-flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800/80 border border-slate-300/60 dark:border-white/10 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            !isDark
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Sun size={14} className={!isDark ? "text-amber-500" : ""} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            isDark
              ? "bg-slate-900 text-white shadow-sm border border-slate-700 dark:bg-aurora-violet dark:text-white dark:border-aurora-violet/50"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <Moon size={14} className={isDark ? "text-indigo-300" : ""} />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  // Default "pill" toggle switch
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={`group relative flex h-8 w-14 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 border ${
        isDark
          ? "bg-slate-800 border-white/15 text-indigo-300"
          : "bg-slate-200/90 border-slate-300/80 text-amber-600 hover:bg-slate-300/90"
      } ${className}`}
    >
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md transition-transform duration-300 ${
          isDark ? "translate-x-6 bg-slate-950 text-indigo-400" : "translate-x-0 text-amber-500"
        }`}
      >
        {isDark ? <Moon size={13} /> : <Sun size={13} />}
      </div>
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
