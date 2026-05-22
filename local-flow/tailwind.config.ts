import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6f9",
          100: "#d5e9f0",
          200: "#aed2e1",
          300: "#7cb6cf",
          400: "#4e97b9",
          500: "#0A4E6B",
          600: "#09445d",
          700: "#073a50",
          800: "#062f42",
          900: "#042435",
          950: "#021a26",
        },
        accent: {
          50: "#fff8e0",
          100: "#ffedb3",
          200: "#ffe180",
          300: "#ffd64d",
          400: "#ffcb26",
          500: "#FFC300",
          600: "#e6b000",
          700: "#cc9c00",
          800: "#b38900",
          900: "#997500",
        },
      },
      fontFamily: {
        body: ["Roboto", "system-ui", "sans-serif"],
        heading: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
