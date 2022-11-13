/** @type {import('tailwindcss').Config} */
const { withMaterialColors } = require("tailwind-material-colors");
module.exports = withMaterialColors(
  {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    darkMode: "class",
  },
  {
    primary: "#6750a4",
  }
);
