/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#0a0a0a',
          panel: '#1a1a1a',
          border: '#2a2a2a',
          text: '#c0c0c0',
          accent: '#d4a017',
          danger: '#8b0000',
          success: '#2e7d32',
          info: '#1565c0',
        },
      },
      fontFamily: {
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
};
