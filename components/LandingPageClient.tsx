"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  FileText,
  Globe,
  Lock,
  Cpu,
  CheckCircle2,
  ChevronRight,
  Layers,
  BarChart3,
  Bot,
  UserCheck,
  FileSpreadsheet,
  ArrowUpRight,
} from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPageClient() {
  const [activeDemoTab, setActiveDemoTab] = useState<"ai" | "human">("human");

  return (
    <div className="relative min-h-screen bg-white text-slate-900 dark:bg-[#050510] dark:text-slate-100 font-body antialiased overflow-x-hidden transition-colors duration-200">
      {/* Dynamic Ambient Background */}
      <AuroraBackground />

      {/* --- Header Navigation --- */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#050510]/70 backdrop-blur-2xl transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-gradient-to-br dark:from-indigo-500 dark:via-purple-500 dark:to-pink-500 p-0.5 shadow-md group-hover:scale-105 transition-transform duration-300">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-900 dark:bg-[#050510]">
                <Wand2 size={19} className="text-blue-400 dark:text-purple-400" strokeWidth={2.4} />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Prathomix
                </span>
                <span className="rounded-full bg-blue-50 dark:bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-purple-300 border border-blue-200 dark:border-purple-500/30 tracking-wider uppercase">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Interactive Demo
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#stats" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Performance
            </a>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle variant="pill" />
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="relative group overflow-hidden rounded-full p-px font-semibold text-xs md:text-sm text-white shadow-md"
            >
              <span className="absolute inset-0 bg-slate-900 dark:bg-gradient-to-r dark:from-blue-500 dark:to-emerald-400" />
              <span className="relative block rounded-full bg-slate-900 text-white dark:bg-slate-950 px-5 py-2 transition-colors group-hover:bg-slate-800 dark:group-hover:bg-transparent">
                Get Started Free
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- Radical Asymmetric Split-Screen Hero Section --- */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Microscopic dot grid background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-50 dark:opacity-30" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Side (60% on desktop: lg:col-span-7) - Strictly Left-Aligned */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
              </span>
              <span>Live • V2.0 AI Bypass Engine</span>
            </div>

            {/* Massive Bold Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-white leading-[1.05]">
              Don't just rewrite. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 dark:from-blue-400 dark:via-indigo-400 dark:to-emerald-400 text-transparent bg-clip-text">
                Become Undetectable.
              </span>
            </h1>

            {/* Crisp Subheadline */}
            <p className="mt-6 max-w-xl text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 font-normal leading-relaxed text-left">
              Turn robotic AI drafts into natural, human writing that effortlessly passes Turnitin, Originality.ai, and GPTZero while preserving 100% of your original document layout.
            </p>

            {/* Primary Action Button & Credit Card Micro Trust */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
              <Link
                href="/login"
                className="group relative flex items-center justify-center gap-3 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 px-8 py-4 text-base font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-xl shadow-slate-900/10 dark:shadow-white/10 cursor-pointer"
              >
                <span>Start Humanizing Free</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-2">
                <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>No credit card required</span>
              </div>
            </div>

            {/* Trust Detector Badges Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-white/10 w-full flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[11px] font-bold">
                Verified Pass On:
              </span>
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" /> Turnitin
              </span>
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" /> GPTZero
              </span>
              <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                <CheckCircle2 size={14} className="text-blue-600 dark:text-blue-400" /> Originality.ai
              </span>
            </div>
          </motion.div>

          {/* Right Side (40% on desktop: lg:col-span-5) - The Floating 3D Before/After Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 relative flex justify-center items-center perspective-[1000px] mt-8 lg:mt-0"
          >
            {/* Soft Glow Behind Floating Visual */}
            <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-500/20 via-indigo-500/20 to-emerald-500/20 blur-3xl opacity-60 dark:opacity-40" />

            <div className="relative w-full max-w-lg">
              {/* Back Card (Robotic Input - Slightly Faded & Red Tinted) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-3xl border border-rose-200/90 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 p-6 shadow-lg backdrop-blur-xl -rotate-2 transform transition-transform"
              >
                <div className="flex items-center justify-between mb-3 border-b border-rose-200/60 dark:border-rose-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">ai_draft_input.txt</span>
                  </div>
                  <span className="rounded-full bg-rose-100 dark:bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 shadow-sm">
                    <Bot size={12} /> 98% AI Detected
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans opacity-80">
                  <span className="bg-rose-200/80 text-rose-950 dark:bg-rose-500/25 dark:text-rose-200 px-1 rounded font-mono">
                    In today's fast-paced digital era, it is important to note that
                  </span>{" "}
                  artificial intelligence serves as a paramount catalyst for workflow optimization...
                </p>
              </motion.div>

              {/* Front Card (Human Output - Crisp White / Dark Slate Overlapping) */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="relative -mt-12 ml-6 rounded-3xl border border-emerald-300/80 dark:border-emerald-500/40 bg-white/95 dark:bg-slate-900/95 p-6 md:p-7 shadow-2xl backdrop-blur-2xl rotate-1 transform transition-transform z-10"
              >
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">prathomix_humanized.docx</span>
                  </div>
                  <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck size={14} /> 100% Human Score
                  </span>
                </div>

                <p className="text-xs md:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-sans font-normal">
                  <span className="bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-300 px-1 rounded font-semibold">
                    Modern technology moves quickly,
                  </span>{" "}
                  and AI has become a core driver behind daily productivity. Rather than relying on rigid templates, smart teams now focus on organic flow...
                </p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <UserCheck size={13} /> Natural Rhythm & Flow
                  </span>
                  <span className="font-mono text-slate-400">0% Formatting Loss</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Interactive Before & After Demo Section --- */}
      <section id="demo" className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
            Live Comparison
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            See the Human Transformation in Action
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-sm md:text-base">
            Toggle between AI-generated draft and Prathomix humanized output to inspect how sentence rhythm, vocabulary, and flow change seamlessly.
          </p>
        </div>

        <div className="mx-auto max-w-4xl glass rounded-3xl border border-slate-200/80 dark:border-white/15 p-6 md:p-8 shadow-sm dark:shadow-2xl">
          {/* Toggle Switch */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-2xl glass-inset p-1.5 border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setActiveDemoTab("ai")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  activeDemoTab === "ai"
                    ? "bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Bot size={16} /> Robotic AI Input (98% Flagged)
              </button>
              <button
                onClick={() => setActiveDemoTab("human")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                  activeDemoTab === "human"
                    ? "bg-slate-900 text-white shadow-sm dark:bg-gradient-to-r dark:from-blue-500 dark:to-emerald-400 dark:shadow-emerald-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <UserCheck size={16} /> Prathomix Humanized (100% Human)
              </button>
            </div>
          </div>

          {/* Demo Content Box */}
          <AnimatePresence mode="wait">
            {activeDemoTab === "ai" ? (
              <motion.div
                key="ai-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl glass-inset p-6 border border-rose-200 dark:border-rose-500/20 text-left space-y-4 bg-rose-50/30 dark:bg-transparent"
              >
                <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-mono">
                  <span>STATUS: Flagged by AI Detectors</span>
                  <span>CONFIDENCE: 98.4% AI</span>
                </div>
                <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  In today's rapidly evolving technological ecosystem, it is crucial to recognize that artificial intelligence serves as a paramount catalyst for organizational efficiency. Furthermore, it is important to note that adopting state-of-the-art computational frameworks enables seamless optimization of operational workflows. Consequently, organizations can achieve superior productivity.
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Repetitive transitions ("Furthermore", "In today's") & rigid sentence structures detected.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="human-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl glass-inset p-6 border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-500/[0.02] text-left space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                  <span>STATUS: 100% Passed All Detectors</span>
                  <span>HUMAN SCORE: 99.8%</span>
                </div>
                <p className="text-sm md:text-base text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
                  Technology is shifting faster than ever, and AI has quickly become a driving force behind modern business growth. Rather than relying on outdated manual routines, forward-thinking teams are integrating flexible digital systems to streamline their daily tasks and keep projects moving effortlessly.
                </p>
                <div className="flex items-center gap-2 pt-2 text-xs text-emerald-600 dark:text-aurora-mint font-medium">
                  <CheckCircle2 size={14} />
                  Varied sentence length, natural vocabulary, and organic flow applied.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- Features Section (Bento Grid) --- */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-20 border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
            Powerful Architecture
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built for Uncompromising Quality & Stealth
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
            Every feature is engineered to give you flawless document outputs without losing a single paragraph or bullet point.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4 }}
            className="group md:col-span-2 rounded-3xl glass border border-slate-200/80 dark:border-white/10 p-8 text-left transition-all hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-lg dark:hover:shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Layers size={140} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 mb-6">
              <FileText size={24} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Exact Layout & Format Preserved Engine
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg mb-6 leading-relaxed">
              Unlike primitive tools that strip formatting, Prathomix parses DOCX, PDF, and HTML structures. Headings, bullet lists, tables, and bold styles remain 100% intact.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-lg glass-inset px-3 py-1 text-slate-700 dark:text-slate-300 font-mono">.DOCX Preserved</span>
              <span className="rounded-lg glass-inset px-3 py-1 text-slate-700 dark:text-slate-300 font-mono">.PDF Preserved</span>
              <span className="rounded-lg glass-inset px-3 py-1 text-slate-700 dark:text-slate-300 font-mono">HTML Preserved</span>
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group rounded-3xl glass border border-slate-200/80 dark:border-white/10 p-8 text-left transition-all hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              100% Undetectable AI Bypass
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Defeats Turnitin, Originality.ai, CopyLeaks, and GPTZero by eliminating synthetic ngram patterns and robotic rhythm.
            </p>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="group rounded-3xl glass border border-slate-200/80 dark:border-white/10 p-8 text-left transition-all hover:border-sky-300 dark:hover:border-sky-500/50 hover:shadow-lg dark:hover:shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-600 dark:text-sky-400 mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              Multi-Tier Waterfall Architecture
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Zero downtime guaranteed. Automatically falls back across Local Ollama, 10 Gemini API keys, and 10 Groq API keys seamlessly.
            </p>
          </motion.div>

          {/* Bento Item 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="group rounded-3xl glass border border-slate-200/80 dark:border-white/10 p-8 text-left transition-all hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-lg dark:hover:shadow-2xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 mb-6">
              <Globe size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              30+ Languages Supported
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Humanizes English, Spanish, French, German, Hindi, and more while honoring native grammar rules and cultural nuances.
            </p>
          </motion.div>

          {/* Bento Item 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="group md:col-span-2 rounded-3xl glass border border-slate-200/80 dark:border-white/10 p-8 text-left transition-all hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-lg dark:hover:shadow-2xl relative overflow-hidden"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 mb-6">
              <Lock size={24} />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Enterprise Privacy & Row-Level Security
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
              Your confidential research and documents are protected with Supabase Row Level Security (RLS). Your data is never sold or used for public AI training.
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="relative z-10 mx-auto max-w-6xl px-6 py-20 border-t border-slate-200/80 dark:border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-aurora-mint bg-emerald-50 dark:bg-aurora-mint/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-aurora-mint/20">
            3-Step Workflow
          </span>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            Humanize Any Document in Seconds
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 text-left relative shadow-sm dark:shadow-xl">
            <div className="text-4xl font-extrabold text-blue-500/30 dark:text-blue-400/30 mb-4">01</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload or Paste</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Drop your `.docx`, `.pdf`, `.txt` file or paste raw text straight into the workspace.
            </p>
          </div>

          <div className="glass rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 text-left relative shadow-sm dark:shadow-xl">
            <div className="text-4xl font-extrabold text-purple-500/30 dark:text-purple-400/30 mb-4">02</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Choose Tone & Category</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Select your desired tone (Academic, Professional, Conversational) and document context.
            </p>
          </div>

          <div className="glass rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 text-left relative shadow-sm dark:shadow-xl">
            <div className="text-4xl font-extrabold text-emerald-500/30 dark:text-emerald-400/30 mb-4">03</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Download 100% Human</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Get back your pristine document with every layout, heading, and bullet point perfectly preserved.
            </p>
          </div>
        </div>
      </section>

      {/* --- Performance Stats Section --- */}
      <section id="stats" className="relative z-10 mx-auto max-w-6xl px-6 py-16 border-t border-slate-200/80 dark:border-white/5">
        <div className="glass rounded-3xl border border-slate-200/80 dark:border-white/15 p-8 md:p-12 shadow-sm dark:shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-display text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">10M+</p>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Words Processed</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-5xl font-extrabold text-emerald-600 dark:text-emerald-400">99.8%</p>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Human Bypass Rate</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400">0%</p>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Layout Loss</p>
            </div>
            <div>
              <p className="font-display text-3xl md:text-5xl font-extrabold text-purple-600 dark:text-purple-400">&lt; 2s</p>
              <p className="mt-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Response Latency</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Bottom CTA Banner --- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="relative rounded-3xl glass border border-slate-200/80 dark:border-white/20 p-10 md:p-16 overflow-hidden shadow-xl dark:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 via-indigo-100/50 to-emerald-100/50 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-emerald-500/20 blur-3xl opacity-60 dark:opacity-50 pointer-events-none animate-pulse-glow" />
          <h2 className="relative z-10 font-display text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
            Ready to Humanize Your Writing?
          </h2>
          <p className="relative z-10 mt-4 text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-sm md:text-base">
            Join thousands of writers, students, and professionals bypassing AI detectors effortlessly.
          </p>
          <div className="relative z-10 mt-8 flex justify-center">
            <Link
              href="/login"
              className="relative group flex items-center gap-2.5 rounded-full px-8 py-4 text-base font-bold text-white shadow-xl shadow-slate-900/10 dark:shadow-blue-500/20 transition-all duration-200 hover:scale-[1.03]"
            >
              <span className="absolute inset-0 rounded-full bg-slate-900 dark:bg-gradient-to-r dark:from-blue-500 dark:to-emerald-400" />
              <span className="relative flex items-center gap-2">
                Start For Free Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
}
