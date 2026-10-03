/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc2c2",
          700: "#ee0000",
          800: "#ee0000",
          900: "#b30000",
        },
      },
    },
  },
  plugins: [],
};
