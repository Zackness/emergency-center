/** @type {import('tailwindcss').Config} */
const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  darkMode: "class",
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: withAlpha("--surface"),
          elevated: withAlpha("--surface-elevated"),
          muted: withAlpha("--surface-muted"),
        },
        ink: {
          DEFAULT: withAlpha("--ink"),
          secondary: withAlpha("--ink-secondary"),
          muted: withAlpha("--ink-muted"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          hover: withAlpha("--accent-hover"),
          muted: withAlpha("--accent-muted"),
        },
        emergency: {
          DEFAULT: withAlpha("--emergency"),
          muted: withAlpha("--emergency-muted"),
        },
        success: {
          DEFAULT: withAlpha("--success"),
          muted: withAlpha("--success-muted"),
        },
        warning: {
          DEFAULT: withAlpha("--warning"),
          muted: withAlpha("--warning-muted"),
        },
        border: withAlpha("--border"),
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        card: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        elevated:
          "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
