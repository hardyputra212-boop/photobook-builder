/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A1A2E',
        secondary: '#16213E',
        accent: '#E94560',
        background: '#0F0F1A',
        surface: '#1F1F35',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0B0',
        border: '#2A2A45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
