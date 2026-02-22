module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        jpm: {
          navy: "#0E1A2B",
          "navy-light": "#1A2D4A",
          gold: "#C6A23A",
          "gold-light": "#D0B459",
          cream: "#F9F7F2",
          ivory: "#FFFFFF",
          border: "#E8E6E1",
          muted: "#6B7280",
          ink: "#1F2937",
        },
      },
      boxShadow: {
        jpm: "0 1px 3px rgba(14, 26, 43, 0.08)",
        "jpm-md": "0 8px 24px rgba(14, 26, 43, 0.1)",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
