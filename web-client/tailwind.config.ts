import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: "#0A0A0F",
          surface: "#15131F",
          border: "#2A2640",
        },
        violeta: {
          DEFAULT: "#6C4CE0",
          soft: "#9B84F0",
        },
        neon: "#39FF88",
        texto: {
          DEFAULT: "#F5F3FF",
          muted: "#8B85A8",
        },
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
