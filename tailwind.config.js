/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070a08',
        sidebar: '#0a0e0c',
        card: '#111714',
        'card-hover': '#161f1b',
        border: '#1b2621',
        primary: {
          DEFAULT: '#10b981',
          hover: '#34d399',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        accent: {
          DEFAULT: '#06b6d4',
          hover: '#22d3ee',
        },
        live: '#ef4444',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
