"use client";

/**
 * Ambient, ever-drifting aurora mesh. Three large blurred blobs on
 * independent animation loops so the pattern never quite repeats.
 * Pure CSS/Tailwind animation (no per-frame JS) to keep it cheap.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void-950"
    >
      {/* base vignette so content stays readable at the edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050510_75%)]" />

      <div className="absolute -top-1/4 left-1/4 h-[42rem] w-[42rem] rounded-full bg-aurora-violet/25 blur-[110px] animate-aurora-1" />
      <div className="absolute top-1/3 -right-1/4 h-[38rem] w-[38rem] rounded-full bg-aurora-blue/20 blur-[110px] animate-aurora-2" />
      <div className="absolute -bottom-1/4 left-1/3 h-[36rem] w-[36rem] rounded-full bg-aurora-rose/20 blur-[110px] animate-aurora-3" />

      {/* subtle film-grain so the blur doesn't look flat/plastic */}
      <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-40" />
    </div>
  );
}
