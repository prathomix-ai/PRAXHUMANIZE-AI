"use client";

/**
 * Ambient, ever-drifting aurora mesh. Three large blurred blobs on
 * independent animation loops so the pattern never quite repeats.
 * Supports both Premium Light Mode and Dark Mode seamlessly.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-void-950 transition-colors duration-300"
    >
      {/* Base vignette for readable content edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#F8FAFC_75%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,#050510_75%)]" />

      {/* Daytime / Nighttime Aurora Glows */}
      <div className="absolute -top-1/4 left-1/4 h-[42rem] w-[42rem] rounded-full bg-indigo-300/30 dark:bg-aurora-violet/25 blur-[110px] animate-aurora-1" />
      <div className="absolute top-1/3 -right-1/4 h-[38rem] w-[38rem] rounded-full bg-sky-300/25 dark:bg-aurora-blue/20 blur-[110px] animate-aurora-2" />
      <div className="absolute -bottom-1/4 left-1/3 h-[36rem] w-[36rem] rounded-full bg-purple-300/25 dark:bg-aurora-rose/20 blur-[110px] animate-aurora-3" />

      {/* Subtle film grain texture */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30 dark:opacity-40" />
    </div>
  );
}
