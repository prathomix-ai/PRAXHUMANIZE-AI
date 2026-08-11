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
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="category-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-aurora-violet to-aurora-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {!active && (
              <span className="absolute inset-0 rounded-full glass-inset" />
            )}
            <Icon size={14} className="relative" strokeWidth={2.2} />
            <span className="relative whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
