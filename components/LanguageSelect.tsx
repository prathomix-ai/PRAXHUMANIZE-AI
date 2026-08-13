"use client";

import { Globe } from "lucide-react";

export const SUPPORTED_LANGUAGES = [
  { id: "English", label: "English" },
  { id: "Hindi", label: "Hindi (हिंदी)" },
  { id: "Sanskrit", label: "Sanskrit (संस्कृतम्)" },
  { id: "Hinglish", label: "Hinglish" },
  { id: "Spanish", label: "Spanish (Español)" },
  { id: "French", label: "French (Français)" },
  { id: "German", label: "German (Deutsch)" },
];

export default function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (lang: string) => void;
}) {
  return (
    <div className="relative flex items-center">
      <Globe size={14} className="pointer-events-none absolute left-3 text-slate-400 z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl bg-slate-100 dark:bg-white/5 pl-8 pr-7 py-2.5 text-xs font-medium text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-aurora-violet focus:outline-none transition-colors cursor-pointer hover:bg-slate-200/70 dark:hover:bg-white/10"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-200">
            {lang.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px]">
        ▼
      </div>
    </div>
  );
}
