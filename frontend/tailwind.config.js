/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#dce6fd",
          500: "#3b6ef5",
          600: "#2d5de0",
          700: "#1e46c8",
          900: "#0f2a7a",
        },
      },
    },
  },
  plugins: [],
};
