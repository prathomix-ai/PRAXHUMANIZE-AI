"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  GraduationCap,
  Mail,
  Hash,
  Clapperboard,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/llm";

const CATEGORIES: { id: Category; label: string; icon: LucideIcon }[] = [
  { id: "report", label: "Report", icon: FileText },
  { id: "website_copy", label: "Website Copy", icon: Globe },
  { id: "essay", label: "Essay", icon: GraduationCap },
  { id: "email", label: "Email", icon: Mail },
  { id: "social_media", label: "Social Media", icon: Hash },
  { id: "script", label: "Script", icon: Clapperboard },
];

export default function CategoryChips({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              active
                ? "text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-slate-900 dark:bg-gradient-to-r dark:from-aurora-violet dark:to-aurora-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {!active && (
              <span className="absolute inset-0 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10" />
            )}
            <Icon size={14} className="relative z-10" strokeWidth={2.2} />
            <span className="relative z-10 whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
