"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Sun,
  Moon,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import ThemeToggle from "./ThemeToggle";

interface ProfileSettingsProps {
  email?: string;
  initialFullName?: string | null;
  initialGender?: string | null;
  onProfileUpdated?: (updated: { fullName: string; gender: string }) => void;
}

export default function ProfileSettings({
  email,
  initialFullName = "",
  initialGender = "Prefer not to say",
  onProfileUpdated,
}: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(initialFullName || "");
  const [gender, setGender] = useState(initialGender || "Prefer not to say");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabaseBrowser.auth.getUser();

        if (!user) return;

        const { data, error } = await supabaseBrowser
          .from("users")
          .select("full_name, gender")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          if (data.full_name !== null && data.full_name !== undefined) {
            setFullName(data.full_name);
          }
          if (data.gender !== null && data.gender !== undefined) {
            setGender(data.gender);
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setFetching(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (!user) {
        setStatusMsg({
          type: "error",
          text: "You must be signed in to update your profile.",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabaseBrowser
        .from("users")
        .update({
          full_name: fullName.trim(),
          gender: gender,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setStatusMsg({
        type: "success",
        text: "Profile settings updated successfully!",
      });

      if (onProfileUpdated) {
        onProfileUpdated({ fullName: fullName.trim(), gender });
      }
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "Failed to save profile changes. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 p-6 md:p-8 backdrop-blur-xl shadow-sm dark:shadow-2xl transition-colors duration-200">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-200/40 dark:bg-aurora-violet/15 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-500 to-purple-500 dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose p-0.5 shadow-md shadow-indigo-500/20 dark:shadow-aurora-violet/20">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-[#050510]">
                <UserCheck size={26} className="text-indigo-600 dark:text-aurora-violet" />
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                Account & Settings
              </h2>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Manage your personal information, preferences, and theme appearance
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-aurora-violet/15 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-aurora-violet border border-indigo-200 dark:border-aurora-violet/30">
            <ShieldCheck size={14} /> Verified Member
          </div>
        </div>
      </div>

      {/* Theme Appearance Section */}
      <div className="rounded-3xl glass border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Sun size={16} className="text-amber-500" /> Interface Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Switch between Premium Light Mode (Default) and Dark Mode across the application.
            </p>
          </div>
          <ThemeToggle variant="buttons" className="self-start sm:self-center" />
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="rounded-3xl glass border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 backdrop-blur-xl shadow-sm dark:shadow-xl transition-colors duration-200">
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
            <Loader2 size={28} className="animate-spin text-indigo-600 dark:text-aurora-violet" />
            <p className="text-xs">Loading profile preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Status Messages */}
            <AnimatePresence>
              {statusMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-semibold border ${
                    statusMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300"
                      : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300"
                  }`}
                >
                  {statusMsg.type === "success" ? (
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                  )}
                  <span>{statusMsg.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <User size={14} className="text-indigo-600 dark:text-aurora-violet" /> Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-2xl glass-inset py-3 px-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-aurora-violet/50 border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  This will be displayed across your dashboard and generated documents.
                </p>
              </div>

              {/* Gender Select Dropdown */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Sparkles size={14} className="text-sky-600 dark:text-aurora-blue" /> Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-2xl glass-inset py-3 px-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-aurora-violet/50 border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0d21] cursor-pointer"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-slate-500">
                  Optional demographic preference for personalizing tone defaults.
                </p>
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-white/10">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <Mail size={14} className="text-purple-600 dark:text-aurora-rose" /> Email Address
              </label>
              <input
                type="email"
                disabled
                value={email || ""}
                className="w-full rounded-2xl glass-inset py-3 px-4 text-sm text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/5 bg-slate-100/50 dark:bg-white/[0.02] cursor-not-allowed opacity-75"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-500">
                Your email is managed by your authentication provider.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="relative group flex items-center justify-center gap-2 overflow-hidden rounded-2xl p-px font-semibold text-sm text-white shadow-lg shadow-slate-900/10 dark:shadow-aurora-violet/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-sky-500 to-purple-600 dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose bg-[length:200%_100%] animate-gradient-flow" />
                <span className="relative flex items-center gap-2 rounded-[15px] bg-slate-900 text-white dark:bg-slate-950 dark:text-white px-6 py-3 transition-colors group-hover:bg-transparent">
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-white" />
                  ) : (
                    <Save size={18} />
                  )}
                  <span>{loading ? "Saving Changes..." : "Save Changes"}</span>
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
