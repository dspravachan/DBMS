/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0F1115', card: '#1A1D24', secondary: '#22252E' },
        accent: { DEFAULT: '#FF8C42', hover: '#FF7A2B', light: '#FF8C4220' },
        gray: { soft: '#9CA3AF', muted: '#6B7280' },
      },
      fontFamily: { inter: ['Inter', 'sans-serif'] },
      backdropBlur: { xs: '2px' },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        pulseOrange: { '0%,100%': { boxShadow: '0 0 0 0 rgba(255,140,66,0.4)' }, '50%': { boxShadow: '0 0 0 10px rgba(255,140,66,0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'orange': '0 4px 20px rgba(255,140,66,0.3)',
        'orange-lg': '0 8px 40px rgba(255,140,66,0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
