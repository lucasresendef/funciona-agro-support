import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf7f2",
          100: "#d2ebde",
          500: "#2f8f55",
          700: "#1d6038",
          900: "#123a22",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
