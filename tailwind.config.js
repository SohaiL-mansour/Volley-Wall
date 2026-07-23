/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0e0616",
        phone: "#130924",
        crimson: "#8b0000",
        "crimson-light": "#a80000",
        "phone-light": "#1a0d2e",
      },
      fontFamily: {
        sans: ["system-ui", "Tahoma", "sans-serif"],
        brand: ["Orbitron", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

