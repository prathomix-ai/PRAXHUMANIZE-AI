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
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getURL(`/auth/callback?next=${encodeURIComponent(next)}`),
      },
    });
    if (error) {
      setError(error.message);
      setLoading("idle");
    }
    // On success, the browser is redirected to Google — nothing else to do here.
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
      const { error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getURL(`/auth/callback?next=${encodeURIComponent(next)}`),
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
    <div className="glass w-full max-w-sm rounded-2xl p-7">
      <div className="mb-6 flex rounded-xl glass-inset p-1">
        {(["sign_in", "sign_up"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
              setMessage("");
            }}
            className={`relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              mode === m ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {mode === m && (
              <motion.span
                layoutId="auth-tab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-aurora-violet to-aurora-blue"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">
              {m === "sign_in" ? "Sign In" : "Sign Up"}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading !== "idle"}
        className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl glass-inset py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06] disabled:opacity-50"
      >
        {loading === "google" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      <div className="mb-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-600">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div className="relative">
          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-xl glass-inset py-2.5 pl-10 pr-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-aurora-violet/50"
          />
        </div>
        <div className="relative">
          <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl glass-inset py-2.5 pl-10 pr-3.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-aurora-violet/50"
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-1.5 text-xs text-rose-400"
            >
              <AlertCircle size={13} className="mt-0.5 shrink-0" /> {error}
            </motion.div>
          )}
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-1.5 text-xs text-aurora-mint"
            >
              <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> {message}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading !== "idle"}
          whileTap={{ scale: 0.98 }}
          className="relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-aurora-violet via-aurora-blue to-aurora-rose bg-[length:200%_100%] animate-gradient-flow" />
          <span className="relative flex items-center gap-1.5">
            {loading === "email" ? (
              <Loader2 size={15} className="animate-spin" />
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
