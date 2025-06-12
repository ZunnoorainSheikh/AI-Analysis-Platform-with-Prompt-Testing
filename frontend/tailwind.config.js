/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 5s linear infinite', // 5s me ek round
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
