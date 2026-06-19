import type { Config } from "tailwindcss";

// MSK design system (concept §22) — tokens as CSS variables, fonts via next/font.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-panel": "var(--bg-panel)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-input": "var(--bg-input)",
        border: "var(--border)",
        "border-accent": "var(--border-accent)",
        accent: "var(--accent)",
        "accent-dim": "var(--accent-dim)",
        "accent-ink": "var(--accent-ink)",
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
        heading: ["var(--font-syne)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-space-mono)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      maxWidth: {
        content: "1180px",
      },
    },
  },
  plugins: [],
};

export default config;
