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
      fontSize: {
        'xs': '0.5rem',     /* TEXTO PEQUENO */
        'sm': '0.55rem',    /* TABELAS */
        'base': '0.65rem',  /* TEXTO PADRÃO */
        'lg': '0.75rem',    /* SUBTÍTULOS */
        'xl': '0.9rem',     /* TÍTULOS PRINCIPAIS */
        '2xl': '0.9rem',    /* TÍTULOS PRINCIPAIS */
        '3xl': '0.9rem',    /* TÍTULOS PRINCIPAIS */
        '4xl': '0.9rem',    /* TÍTULOS PRINCIPAIS */
      },
      spacing: {
        '0.5': '0.05rem',
        '1': '0.1rem',
        '2': '0.2rem',
        '3': '0.25rem',
        '4': '0.35rem',
        '5': '0.45rem',
        '6': '0.6rem',
        '8': '0.8rem',
      }
    },
  },
  plugins: [],
} 