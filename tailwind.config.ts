import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F5",
        "paper-wash": "#EDF7EF",
        "paper-card": "#FFFFFF",
        ink: "#1C241E",
        "ink-soft": "#525E55",
        "ink-faint": "#8E9B91",
        accent: "#2E7D4E",
        "accent-sage": "#3B8A5A",
        "accent-light": "#8CD49E",
        "accent-wash": "#EAF5ED",
        "btn-mint": "#8CD49E",
        "btn-mint-hover": "#79C68C",
        border: {
          subtle: "rgba(28, 36, 30, 0.08)",
          sketch: "rgba(28, 36, 30, 0.75)",
          strong: "rgba(28, 36, 30, 0.16)",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        handwriting: ["var(--font-caveat)", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        content: "1160px",
        wide: "1280px",
      },
      boxShadow: {
        "sketch-card": "0 10px 30px -8px rgba(46, 125, 78, 0.06), 0 2px 6px -1px rgba(28, 36, 30, 0.04)",
        "sketch-btn": "0 6px 16px -4px rgba(140, 212, 158, 0.45), 0 2px 6px -1px rgba(140, 212, 158, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
