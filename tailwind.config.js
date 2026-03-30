/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tilim: {
          blue: "#102B45",
          yellow: "#EAB308",
        }
      }
    },
  },
  plugins: [],
}