import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#050510", // near-black base, cooler than pure slate
          900: "#0a0a18",
          800: "#111124",
        },
        aurora: {
          violet: "#8b5cf6",
          blue: "#38bdf8",
          rose: "#f472b6",
          mint: "#34d399",
        },
        glass: {
          border: "rgba(255,255,255,0.08)",
          surface: "rgba(255,255,255,0.04)",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        "aurora-drift": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "33%": { transform: "translate(6%, -8%) scale(1.08)" },
          "66%": { transform: "translate(-5%, 5%) scale(0.96)" },
        },
        "aurora-drift-slow": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1)" },
          "50%": { transform: "translate(-8%, 6%) scale(1.1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "gradient-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", filter: "blur(20px)" },
          "50%": { opacity: "1", filter: "blur(28px)" },
        },
      },
      animation: {
        "aurora-1": "aurora-drift 22s ease-in-out infinite",
        "aurora-2": "aurora-drift-slow 28s ease-in-out infinite",
        "aurora-3": "aurora-drift 34s ease-in-out infinite reverse",
        shimmer: "shimmer 1.6s linear infinite",
        "gradient-flow": "gradient-flow 6s ease infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
export default config;
