module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
  colors: {
    navy: "#0F172A",
    gold: "#C6A23A",
    lightgold: "#D4AF37",
    softgray: "#F8FAFC"
  },
  boxShadow: {
    executive: "0 25px 60px rgba(15, 23, 42, 0.08)"
  }
    } },
  plugins: [],
};
