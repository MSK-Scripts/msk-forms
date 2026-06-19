import type { Config } from "tailwindcss";

// MSK Design-System (Konzept.md §22) — Tokens als CSS-Variablen
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-panel": "var(--bg-panel)",
        "bg-input": "var(--bg-input)",
        border: "var(--border)",
        "border-accent": "var(--border-accent)",
        accent: "var(--accent)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
