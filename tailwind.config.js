const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#00aaff', // Brighter blue
          light: '#66ccff',
        },
        secondary: {
          DEFAULT: '#ff6b6b', // Coral red
          light: '#ff9e9e',
        },
        accent: {
          DEFAULT: '#6cffaf', // Bright mint green
          light: '#a3ffd1',
        },
        black: '#000000', // Pure black
        white: '#ffffff', // Pure white
      },
      animation: {
        gradient: 'gradient 15s ease infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.6s 0.3s ease-out forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.6s 0.6s ease-out forwards',
        'fade-in-up-delay-3': 'fadeInUp 0.6s 0.9s ease-out forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'float-slow-reverse': 'float 6s ease-in-out infinite reverse',
        'float-medium': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce': 'bounce 1s infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
} 