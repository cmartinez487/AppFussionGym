/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0A0A0C',
          dark: '#14151A',
          panel: '#1D2029',
          yellow: '#F9FE02',
          cyan: '#01FFFF',
          silver: '#D5D5D7',
          gray: '#818183',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
