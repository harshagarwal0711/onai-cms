import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx,mdx}", "./components/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a0a14",
        muted: "#6b5862",
        brand: { DEFAULT: "#7a1c2e", soft: "#a8344a" },
        accent: "#ff6b9d",
        page: "#fafaf9",
      },
    },
  },
};

export default config;
