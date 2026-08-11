"use client";

import { ExternalLink, Sparkles, Shield, Github, Twitter, Globe, ArrowUpRight, Lock } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-slate-950/70 backdrop-blur-2xl pt-14 pb-8 px-6 md:px-12 mt-20">
      <div className="mx-auto max-w-6xl">
        {/* Multi-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aurora-violet via-aurora-blue to-aurora-rose shadow-md shadow-aurora-violet/20 ring-1 ring-white/20">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-white text-base tracking-tight">
                Prathomix Humanize AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bypass AI detectors effortlessly with format-preserving document processing, multi-language support, and 100% layout retention.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-aurora-mint font-medium pt-1">
              <Shield size={13} />
              <span>100% Undetectable Guarantee</span>
            </div>
          </div>

          {/* Column 2: Capabilities */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-200">
              Capabilities
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-slate-200 transition-colors">Raw AI Text Humanizer</li>
              <li className="hover:text-slate-200 transition-colors">Format-Preserving DOCX Engine</li>
              <li className="hover:text-slate-200 transition-colors">PDF & PPTX Presentation Engine</li>
              <li className="hover:text-slate-200 transition-colors">Easy Words (5th Grade Mode)</li>
              <li className="hover:text-slate-200 transition-colors">Multi-Language Output Engine</li>
            </ul>
          </div>

          {/* Column 3: Security & Trust */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-200">
              Platform & Security
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="h-2 w-2 rounded-full bg-aurora-mint animate-pulse" />
                <span>System Status: Operational</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                <Lock size={12} className="text-slate-500" />
                <span>Row-Level Security (RLS)</span>
              </li>
              <li className="hover:text-slate-200 transition-colors">Privacy & Data Security</li>
              <li className="hover:text-slate-200 transition-colors">Terms of Service</li>
            </ul>
          </div>

          {/* Column 4: Powered by Prathomix Highlight Card */}
          <div className="space-y-3">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-slate-200">
              Technology Partner
            </h3>
            <a
              href="https://www.prathomix.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl bg-gradient-to-br from-aurora-violet/15 via-white/[0.03] to-aurora-blue/15 p-4 border border-white/15 backdrop-blur-md transition-all hover:border-aurora-mint/40 hover:shadow-lg hover:shadow-aurora-mint/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Official Technology
                </span>
                <ArrowUpRight size={15} className="text-aurora-mint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="mt-2.5 flex items-center gap-1.5">
                <span className="text-xs text-slate-300">Powered by</span>
                <span className="font-display text-sm font-bold text-aurora-mint group-hover:text-white transition-colors">
                  Prathomix
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                Explore custom AI solutions & enterprise tools <ExternalLink size={10} className="inline ml-0.5" />
              </p>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-slate-500">
          <p>© {currentYear} Prathomix Solution. All rights reserved.</p>

          <div className="flex items-center gap-5 text-slate-400">
            <a
              href="https://www.prathomix.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-aurora-mint transition-colors"
              title="Prathomix Official Website"
            >
              <Globe size={17} />
            </a>
            <a
              href="https://github.com/prathomix-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              title="GitHub"
            >
              <Github size={17} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-aurora-blue transition-colors"
              title="Twitter / X"
            >
              <Twitter size={17} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
