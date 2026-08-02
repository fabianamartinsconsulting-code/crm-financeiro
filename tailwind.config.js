/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#FFFFFF",
        soft: "#F4F5F3",
        ink: "#1A1D1B",
        muted: "#6B7280",
        line: "#E3E5E1",
        verde: {
          DEFAULT: "#1B4332",
          soft: "#E7EFE9",
        },
        petroleo: {
          DEFAULT: "#145263",
          soft: "#E5EDEF",
        },
        alerta: "#B3261E",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
