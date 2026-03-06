/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /* ── IFX Color System ─────────────────────────────────────────────── */
      colors: {
        // Background layers
        "ifx-bg": "#080C14",   // Primary background — deep navy-black
        "ifx-surface": "#0D1421",   // Card surfaces
        "ifx-elevated": "#111927",   // Elevated panels
        // Gold brand
        "ifx-gold": "#C9A84C",   // Primary gold
        "ifx-gold-muted": "#8B6914",   // Secondary states
        // Text
        "ifx-text": "#F0EDE8",   // Warm white
        "ifx-text-muted": "#8A95A3",   // Descriptions
        "ifx-text-faint": "#4A5568",   // Placeholders
        // Semantic
        "ifx-success": "#22C55E",
        "ifx-error": "#EF4444",
        "ifx-warning": "#F59E0B",
        "ifx-info": "#3B82F6",
        // Legacy jpm-* aliases kept for backward compat — map to new palette
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
        surface: "#0D1421",
        elevated: "#111927",
        gold: "#C9A84C",
        "gold-muted": "rgba(201,168,76,0.08)",
        border: "rgba(201,168,76,0.25)",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },

      /* ── Background Images ─────────────────────────────────────────── */
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #8B6914 0%, #C9A84C 50%, #E6C97A 100%)",
        "gold-subtle": "linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.02) 100%)",
        "dark-radial": "radial-gradient(circle at 50% 0%, #111927 0%, #080C14 70%)",
        "glass-gradient": "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.14), transparent)",
        "shimmer": "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.3) 50%, transparent 100%)",
      },

      /* ── Box Shadows ───────────────────────────────────────────────── */
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.50)",
        sm: "0 2px 8px rgba(0,0,0,0.50)",
        card: "0 8px 24px rgba(0,0,0,0.60)",
        gold: "0 0 20px rgba(201,168,76,0.15)",
        "gold-lg": "0 0 35px rgba(201,168,76,0.30)",
        glass: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        modal: "0 24px 64px rgba(0,0,0,0.70)",
        focus: "0 0 0 3px rgba(201,168,76,0.50)",
        "gold-glow": "0 0 40px rgba(201,168,76,0.20)",
      },

      /* ── Typography ────────────────────────────────────────────────── */
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.7" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
      },

      /* ── Spacing (8px baseline grid) ───────────────────────────────── */
      spacing: {
        "0.5": "2px", "1": "4px", "1.5": "6px", "2": "8px",
        "2.5": "10px", "3": "12px", "3.5": "14px", "4": "16px",
        "5": "20px", "6": "24px", "7": "28px", "8": "32px",
        "9": "36px", "10": "40px", "11": "44px", "12": "48px",
        "13": "52px", "14": "56px", "16": "64px", "18": "72px",
        "20": "80px", "24": "96px", "28": "112px", "32": "128px",
        "36": "144px", "40": "160px", "48": "192px", "56": "224px", "64": "256px",
      },

      /* ── Border Radius ─────────────────────────────────────────────── */
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
        full: "9999px",
      },

      /* ── Animations ────────────────────────────────────────────────── */
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-up": "slideUp 0.6s cubic-bezier(0.25,0.46,0.45,0.94) both",
        "toast-in": "toastIn 0.3s ease-out both",
        "gold-pulse": "goldPulse 3s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "counter-up": "slideUp 0.8s cubic-bezier(0.25,0.46,0.45,0.94) both",
      },

      /* ── Keyframes ─────────────────────────────────────────────────── */
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)", filter: "blur(4px)" },
          to: { opacity: "1", transform: "translateY(0)", filter: "blur(0px)" },
        },
        toastIn: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201,168,76,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(201,168,76,0.35)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-10px)" },
          "40%": { transform: "translateX(10px)" },
          "60%": { transform: "translateX(-6px)" },
          "80%": { transform: "translateX(6px)" },
        },
      },

      /* ── Transition ────────────────────────────────────────────────── */
      transitionDuration: {
        "120": "120ms", "200": "200ms", "300": "300ms",
        "400": "400ms", "500": "500ms", "600": "600ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)",
        gravity: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};
