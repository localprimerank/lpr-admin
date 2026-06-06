/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f6ffd',
        secondary: '#6366f1',
        dark: '#0a0a0a',
        sidebar: '#1a1a2e',
      },
    },
  },
  plugins: [],
}
