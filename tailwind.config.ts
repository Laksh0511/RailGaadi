import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#003b72",
          container: "#00529b",
          fixed: "#d5e3ff",
          "fixed-dim": "#a6c8ff",
          "on-fixed": "#001c3b",
          "on-fixed-variant": "#004787",
        },
        "on-primary": {
          DEFAULT: "#ffffff",
          container: "#a5c7ff",
        },
        secondary: {
          DEFAULT: "#705d00",
          container: "#fcd400",
          fixed: "#ffe16d",
          "fixed-dim": "#e9c400",
          "on-fixed": "#221b00",
          "on-fixed-variant": "#544600",
        },
        "on-secondary": {
          DEFAULT: "#ffffff",
          container: "#6e5c00",
        },
        surface: {
          DEFAULT: "#f9f9fe",
          bright: "#f9f9fe",
          dim: "#d9dade",
          tint: "#1d5fa8",
          variant: "#e2e2e7",
          container: {
            DEFAULT: "#ededf2",
            lowest: "#ffffff",
            low: "#f3f3f8",
            high: "#e8e8ed",
            highest: "#e2e2e7",
          },
        },
        "on-surface": {
          DEFAULT: "#1a1c1f",
          variant: "#424751",
        },
        outline: {
          DEFAULT: "#727782",
          variant: "#c2c6d3",
        },
        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        "on-error": "#ffffff",
        tertiary: {
          DEFAULT: "#393b3b",
          container: "#505252",
          fixed: "#e2e2e2",
          "fixed-dim": "#c6c6c7",
          "on-fixed": "#1a1c1c",
          "on-fixed-variant": "#454747",
        },
        "on-tertiary": {
          DEFAULT: "#ffffff",
          container: "#c4c5c5",
        },
        background: "#f9f9fe",
        "on-background": "#1a1c1f",
      },
      spacing: {
        base: "8px",
        "stack-sm": "4px",
        "stack-md": "16px",
        "stack-lg": "24px",
        gutter: "12px",
        "container-margin": "16px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        "data-mono": ["JetBrains Mono", "monospace"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "display-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-sm": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
      },
      fontSize: {
        "data-mono": ["14px", { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "500" }],
        "body-lg": ["17px", { lineHeight: "22px", fontWeight: "400" }],
        "body-sm": ["15px", { lineHeight: "20px", fontWeight: "400" }],
        "display-lg": ["34px", { lineHeight: "41px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "30px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "25px", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ping: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
