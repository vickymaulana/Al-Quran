/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#d4a843',
          600: '#b8860b',
          700: '#92400e',
        },
        surface: {
          light: '#f8fafc',
          dark: '#0f172a',
          card: '#ffffff',
          'card-dark': '#1e293b',
        },
      },
      backgroundImage: {
        'hero-light': 'linear-gradient(135deg, #0d9488 0%, #0e7490 40%, #7c3aed 100%)',
        'hero-dark': 'linear-gradient(135deg, #064e3b 0%, #0c4a6e 40%, #4c1d95 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a843 0%, #f59e0b 100%)',
        'teal-gradient': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glow-teal': '0 0 30px rgba(13, 148, 136, 0.15)',
        'glow-gold': '0 0 30px rgba(212, 168, 67, 0.15)',
        'glow-teal-lg': '0 0 60px rgba(13, 148, 136, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'glow': 'glow-pulse 2s ease-in-out infinite',
        'gradient': 'gradient-shift 6s ease infinite',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}