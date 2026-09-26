/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        eoc: {
          bg:         "var(--color-eoc-bg)",
          panel:      "var(--color-eoc-panel)",
          panel2:     "var(--color-eoc-panel2)",
          panel3:     "var(--color-eoc-panel3)",
          surface:    "var(--color-eoc-surface)",
          border:     "var(--color-eoc-border)",
          border2:    "var(--color-eoc-border2)",
          text:       "var(--color-eoc-text)",
          muted:      "var(--color-eoc-muted)",
          subtle:     "var(--color-eoc-subtle)",
          accent:     "var(--color-eoc-accent)",
          accentDim:  "var(--color-eoc-accentDim)",
          accent2:    "var(--color-eoc-accent2)",
          critical:   "var(--color-eoc-critical)",
          criticalBg: "var(--color-eoc-critical-bg)",
          warning:    "var(--color-eoc-warning)",
          warningBg:  "var(--color-eoc-warning-bg)",
          moderate:   "var(--color-eoc-moderate)",
          moderateBg: "var(--color-eoc-moderate-bg)",
          normal:     "var(--color-eoc-normal)",
          normalBg:   "var(--color-eoc-normal-bg)",
          info:       "var(--color-eoc-info)",
          infoBg:     "var(--color-eoc-info-bg)",
          success:    "var(--color-eoc-normal)",
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', '"Inter"', "system-ui", "sans-serif"],
        sans: ['"Inter"', '"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Geist Mono"', "monospace"],
      },
      letterSpacing: {
        tighter: "-0.03em",
        tight: "-0.015em",
        tactical: "0.08em",
      },
      boxShadow: {
        'tactical': '0 0 0 1px rgba(148, 163, 184, 0.14), 0 4px 16px -2px rgba(0, 0, 0, 0.45)',
        'tactical-accent': '0 0 0 1px rgba(6, 182, 212, 0.35), 0 0 14px rgba(6, 182, 212, 0.15)',
        'tactical-crit': '0 0 0 1px rgba(239, 68, 68, 0.4), 0 0 16px rgba(239, 68, 68, 0.2)',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      animation: {
        "fade-in-up": "fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 0.15s ease both",
        "radar-sweep": "radarSweep 4s linear infinite",
        "pulse-radar": "pulseRadar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "defcon-pulse": "defconPulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        radarSweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseRadar: {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        defconPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};
