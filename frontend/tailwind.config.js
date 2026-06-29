/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          beige: "#FDFBF7",
          green: "#1E3F20",
          ochre: "#D4AF37",
          charcoal: "#2C2520",
          obsidian: "#121415",
          pine: "#1A5C38",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-outfit)", "serif"],
      }
    },
  },
  plugins: [],
}
