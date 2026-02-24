/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      /* ── Color System ──────────────────────────────────────────── */
      colors: {
        jpm: {
          navy: "#0a0a0a",
          "navy-light": "#141414",
          gold: "#d4af37",
          "gold-light": "#f3e5ab",
          "gold-dark": "#aa8c2c",
          cream: "#020617",
          ivory: "#f1f5f9",
          border: "rgba(212, 175, 55, 0.15)",
          muted: "#94a3b8",
          ink: "#f1f5f9",
        },
        // Semantic aliases — use these in new components
        surface: "#0d1117",
        elevated: "#141414",
        gold: "#d4af37",
        "gold-muted": "rgba(212, 175, 55, 0.08)",
        border: "rgba(212, 175, 55, 0.15)",
        success: "#34d399",
        warning: "#fbbf24",
        error: "#f87171",
        info: "#60a5fa",
      },

      /* ── Background Images ─────────────────────────────────────── */
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #aa8c2c 0%, #d4af37 50%, #f3e5ab 100%)",
        "gold-subtle": "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.02) 100%)",
        "dark-radial": "radial-gradient(circle at 50% 0%, #1a1a1a 0%, #020617 70%)",
        "glass-gradient": "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.12), transparent)",
      },

      /* ── Box Shadows ───────────────────────────────────────────── */
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.40)",
        sm: "0 2px 8px rgba(0,0,0,0.40)",
        card: "0 8px 24px rgba(0,0,0,0.50)",
        gold: "0 0 20px rgba(212,175,55,0.15)",
        "gold-lg": "0 0 35px rgba(212,175,55,0.30)",
        glass: "0 8px 32px 0 rgba(0,0,0,0.50)",
        modal: "0 24px 64px rgba(0,0,0,0.70)",
        focus: "0 0 0 3px rgba(212,175,55,0.50)",
      },

      /* ── Typography ────────────────────────────────────────────── */
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "Cambria", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
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

      /* ── Spacing (8px baseline grid) ──────────────────────────── */
      spacing: {
        "0.5": "2px",
        "1": "4px",
        "1.5": "6px",
        "2": "8px",
        "2.5": "10px",
        "3": "12px",
        "3.5": "14px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "11": "44px",
        "12": "48px",
        "14": "56px",
        "16": "64px",
        "18": "72px",
        "20": "80px",
        "24": "96px",
        "28": "112px",
        "32": "128px",
        "36": "144px",
        "40": "160px",
        "48": "192px",
        "56": "224px",
        "64": "256px",
      },

      /* ── Border Radius ─────────────────────────────────────────── */
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },

      /* ── Animations ────────────────────────────────────────────── */
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite linear",
        "fade-in": "fadeIn 0.35s ease-out both",
        "slide-up": "slideUp 0.35s ease-out both",
        "toast-in": "toastIn 0.3s ease-out both",
        "gold-pulse": "goldPulse 3s ease-in-out infinite",
      },

      /* ── Keyframes ─────────────────────────────────────────────── */
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
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        toastIn: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,175,55,0.15)" },
          "50%": { boxShadow: "0 0 35px rgba(212,175,55,0.30)" },
        },
      },

      /* ── Transition Timing ─────────────────────────────────────── */
      transitionDuration: {
        "120": "120ms",
        "200": "200ms",
        "350": "350ms",
        "500": "500ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        decelerate: "cubic-bezier(0, 0, 0.2, 1)",
        accelerate: "cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [],
};
