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
        primary: {
          DEFAULT: "#0070f3",
          dark: "#0050b3",
          light: "#3291ff",
          50: "#f5f9ff",
          100: "#e9f3ff",
          200: "#d3e6ff",
          300: "#b0d1ff",
          400: "#84b3ff",
          500: "#5a8eff",
          600: "#3a6df9",
          700: "#2c53e3",
          800: "#2241b7",
          900: "#1f3991",
          950: "#172254",
        },
        secondary: {
          50: "#f3f6fe",
          100: "#e9eeff",
          200: "#d5deff",
          300: "#b4c5ff",
          400: "#89a0ff",
          500: "#6179ff",
          600: "#4354f6",
          700: "#3641de",
          800: "#2d37b4",
          900: "#29348f",
          950: "#1b1f53",
        },
        accent: {
          50: "#fffde7",
          100: "#fffac0",
          200: "#fff485",
          300: "#ffe84a",
          400: "#ffd81f",
          500: "#ffc107",
          600: "#e29400",
          700: "#bb6902",
          800: "#985108",
          900: "#7c430c",
          950: "#482100",
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
