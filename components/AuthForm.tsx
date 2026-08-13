"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { getURL } from "@/lib/utils";

type Mode = "sign_in" | "sign_up";

export default function AuthForm({ next }: { next: string }) {
  const [mode, setMode] = useState<Mode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"idle" | "email" | "google">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleGoogle() {
    setError("");
    setLoading("google");
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : getURL();
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    if (error) {
      setError(error.message);
      setLoading("idle");
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading("email");

    if (mode === "sign_in") {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading("idle");
        return;
      }
      window.location.href = next;
    } else {
      const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : getURL();
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });
      if (error) {
        setError(error.message);
        setLoading("idle");
        return;
      }
      setMessage("Check your inbox to confirm your email, then sign in.");
      setLoading("idle");
    }
  }

  return (
    <div className="glass w-full max-w-sm rounded-2xl p-7 border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 shadow-lg dark:shadow-2xl transition-colors duration-200">
      <div className="mb-6 flex rounded-xl glass-inset p-1 border border-slate-200/80 dark:border-white/10">
        {(["sign_in", "sign_up"] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
              setMessage("");
            }}
            className={`relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors cursor-pointer ${
              mode === m
                ? "text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {mode === m && (
              <motion.span
                layoutId="auth-tab"
                className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-gradient-to-r dark:from-aurora-violet dark:to-aurora-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">
              {m === "sign_in" ? "Sign In" : "Sign Up"}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading !== "idle"}
        className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl glass-inset py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50 cursor-pointer"
      >
        {loading === "google" ? (
          <Loader2 size={16} className="animate-spin text-slate-600 dark:text-slate-300" />
        ) : (
          <GoogleIcon />
        )}
        <span>Continue with Google</span>
      </button>

      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="text-xs text-slate-400 dark:text-slate-600 font-medium">or</span>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl glass-inset py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-aurora-violet/50 border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]"
          />
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl glass-inset py-2.5 pl-10 pr-3.5 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-aurora-violet/50 border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.03]"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-1.5 text-xs text-emerald-600 dark:text-aurora-mint font-medium"
            >
              <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> {message}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading !== "idle"}
          whileTap={{ scale: 0.98 }}
          className="relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60 cursor-pointer shadow-md"
        >
          <span className="absolute inset-0 bg-slate-900 text-white dark:bg-gradient-to-r dark:from-aurora-violet dark:via-aurora-blue dark:to-aurora-rose dark:bg-[length:200%_100%] dark:animate-gradient-flow" />
          <span className="relative flex items-center gap-1.5 text-white">
            {loading === "email" ? (
              <Loader2 size={15} className="animate-spin text-white" />
            ) : (
              <>
                {mode === "sign_in" ? "Sign In" : "Create Account"}
                <ArrowRight size={15} />
              </>
            )}
          </span>
        </motion.button>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.2-1.8 13.9-5l-6.4-5.4C29.4 35.4 26.9 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.4C41.5 35.7 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
