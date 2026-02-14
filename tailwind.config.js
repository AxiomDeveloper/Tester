/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tac-green': '#0f0', // NVG Phosphor Green
        'tac-black': '#050505',
        'tac-dark': '#0a0a0a',
        'tac-alert': '#ff3333',
        'tac-cyan': '#00ffff',
      },
      fontFamily: {
        mono:, // Tactical monospaced font
      }
    },
  },
  plugins:,
}
