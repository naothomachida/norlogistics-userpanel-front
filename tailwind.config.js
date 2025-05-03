/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: '#1E1E1E',
        'dark-secondary': '#2C2C2C',
        'dark-text': '#E0E0E0',
      },
    },
  },
  plugins: [],
} 