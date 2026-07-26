import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          bg: "#000000",
          surface: "#111111",
          border: "#222222",
        },
        violeta: {
          DEFAULT: "#39ff14",
          soft: "#d63384",
        },
        neon: "#39ff14",
        texto: {
          DEFAULT: "#e0e0e0",
          muted: "#666666",
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
