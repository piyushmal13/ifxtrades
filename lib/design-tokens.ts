export const designTokens = {
  colors: {
    bgVoid: "#05080F",
    bgPrimary: "#080C14",
    bgSecondary: "#0D1421",
    bgTertiary: "#111927",
    bgElevated: "#162032",
    goldBright: "#D4A843",
    goldPure: "#C9A84C",
    goldMuted: "#8B6914",
    goldDim: "#5C4510",
    textPrimary: "#F0EDE8",
    textSecondary: "#8A95A3",
    textTertiary: "#4A5568",
    green: "#22C55E",
    red: "#EF4444",
    blue: "#3B82F6",
    amber: "#F59E0B",
  },
  easing: {
    outExpo: [0.16, 1, 0.3, 1] as const,
    inOutQuart: [0.76, 0, 0.24, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
  shadows: {
    card: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
    gold: "0 0 40px rgba(201,168,76,0.2), 0 0 80px rgba(201,168,76,0.08)",
    modal: "0 32px 96px rgba(0,0,0,0.7), 0 8px 32px rgba(0,0,0,0.5)",
  },
} as const;

export const primaryNavLinks = [
  { label: "Home", href: "/" },
  { label: "Webinars", href: "/webinars" },
  { label: "Algos", href: "/algos" },
  { label: "University", href: "/university" },
  { label: "Blog", href: "/blog" },
  { label: "Reviews", href: "/reviews" },
] as const;

export const marketStatus = {
  label: "MARKETS OPEN",
  color: designTokens.colors.green,
  live: true,
} as const;
