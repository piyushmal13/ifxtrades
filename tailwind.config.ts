import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ifx: {
          bg: "#080C14",
          surface: "#0D1421",
          elevated: "#111927",
          gold: "#C9A84C",
          "gold-muted": "#8B6914",
          text: "#F0EDE8",
          "text-muted": "#8A95A3",
          "text-faint": "#4A5568",
          success: "#22C55E",
          error: "#EF4444",
          warning: "#F59E0B",
          info: "#3B82F6",
        },
        jpm: {
          navy: "#080C14",
          "navy-light": "#0D1421",
          gold: "#C9A84C",
          "gold-light": "#E6C97A",
          "gold-dark": "#8B6914",
          cream: "#080C14",
          ivory: "#F0EDE8",
          border: "rgba(201,168,76,0.25)",
          muted: "#8A95A3",
          ink: "#F0EDE8",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "ifx-gold-gradient":
          "linear-gradient(135deg, #8B6914 0%, #C9A84C 55%, #E6C97A 100%)",
        "ifx-dark-radial":
          "radial-gradient(circle at 50% 0%, #111927 0%, #080C14 70%)",
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
        gold: "0 0 40px rgba(201,168,76,0.2), 0 0 80px rgba(201,168,76,0.08)",
        modal: "0 32px 96px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "gold-shimmer": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "grid-scroll": {
          "0%": {
            transform: "perspective(800px) rotateX(45deg) translateY(-20%)",
          },
          "100%": {
            transform: "perspective(800px) rotateX(45deg) translateY(0%)",
          },
        },
      },
      animation: {
        "gold-shimmer": "gold-shimmer 4s linear infinite",
        "grid-scroll": "grid-scroll 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
