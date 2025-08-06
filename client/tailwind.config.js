/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        black: '#000000',       // 000000
        lavender: '#7C60A2',    // 7C60A2
        lightGreen: '#D8F793',  // D8F793
        orange: '#FFB563',      // FFB563
        white: '#FFFFFF',       // FFFFFF
        dygestPurple: '#7D60A3'
      },
      fontSize: {
        loginSignup: '26px',  // for login & signup
        smallText: '15px',    // for "don't have an account yet?"
        dygestTitle: '40px',  // for "dygest"
      },
      fontWeight: {
        normal: '400',  // matches your font-weight 400
        extrabold: '800', // matches your font-weight 800
      }
    },
  },
  plugins: [],
}
