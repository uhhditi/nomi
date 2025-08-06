// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        black: "#000000",
        lavender: "#7C60A2",
        lightGreen: "#D8F793",
        orange: "#FFB563",
        white: "#FFFFFF",
        dygestPurple: "#7D60A3",
      },
      fontSize: {
        loginSignup: "26px",
        smallText: "15px",
        dygestTitle: "40px",
      },
      fontWeight: {
        normal: "400",
        extrabold: "800",
      },
    },
  },
  plugins: [],
};
