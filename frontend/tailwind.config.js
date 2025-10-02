import flowbite from "flowbite/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite-react/lib/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#f0fffe",
          100: "#ccfffe",
          200: "#99fffc",
          300: "#5cfffb",
          400: "#1de9d6",
          500: "#14958e",
          600: "#10766e",
          700: "#0f5e5a",
          800: "#104a48",
          900: "#123d3c",
          950: "#052524",
        },
        brand: "#14958e",
      },
    },
  },
  plugins: [flowbite],
};
