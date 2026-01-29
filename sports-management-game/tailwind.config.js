/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'basketball-orange': '#FF6B35',
        'court-wood': '#8B4513',
        'court-light': '#D2A76A',
        'arena-dark': '#1A1A2E',
        'arena-mid': '#16213E',
        'arena-light': '#0F3460',
        'success': '#22C55E',
        'warning': '#EAB308',
        'danger': '#EF4444',
      },
      fontFamily: {
        'heading': ['Poppins', 'Inter', 'sans-serif'],
        'body': ['Roboto', 'sans-serif'],
        'stats': ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
