/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          emerald: "#16a34a",
          sky: "#0284c7",
        },
      },
      boxShadow: {
        smooth: "0 18px 35px rgba(2,6,23,.08)",
      },
      borderRadius: {
        xl2: "1rem",
      },
    },
  },
  plugins: [],
};
