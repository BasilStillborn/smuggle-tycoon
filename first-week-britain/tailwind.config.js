/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        britain: {
          ink: '#102033',
          navy: '#163b6b',
          red: '#c8252c',
          cream: '#f6f1e8',
          paper: '#fffaf0',
          mist: '#dce9f7',
          blue: '#2563eb',
          gold: '#d69e2e',
          green: '#16735b',
        },
      },
      boxShadow: {
        card: '0 24px 70px rgba(16, 32, 51, 0.14)',
        soft: '0 12px 35px rgba(16, 32, 51, 0.10)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
