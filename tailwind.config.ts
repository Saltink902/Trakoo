import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        trakoo: {
          bg: "#faf8f5",
          gradient: {
            top: "#e8f0f8",
            bottom: "#f5e8ef",
          },
          pill: "rgba(255,255,255,0.95)",
          text: "#1a1614",
          muted: "#6b6560",
          mood: {
            1: "#e8a0a0",
            2: "#c9a0d4",
            3: "#a8d4c8",
            4: "#a0c4e8",
            5: "#f5e079",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
