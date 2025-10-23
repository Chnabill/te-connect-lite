/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#f28d00',      // corrected capitalization
        secondary: '#2e4957',    // corrected value to match your request
        accent: '#167a87',       // corrected value to match your request
      },
    },
  },
  plugins: [],
};
