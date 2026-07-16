/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        obsidian: "#0A0A0A",
        panel: "#121212",
        card: "#1E1E1E",
        volt: "#007AFF",
        laser: "#22C55E",
        blaze: "#FF3B30",
        amber: "#F59E0B",
      },
      fontFamily: {
        heading: ["Unbounded", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
