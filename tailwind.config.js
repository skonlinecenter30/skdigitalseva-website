/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        kannada: ['Noto Sans Kannada', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        // Primary - Dark Green
        gov: {
          dark:   '#0a3d26',   // deepest
          main:   '#0F5132',   // primary dark green
          mid:    '#157347',   // mid green
          light:  '#1e8a56',   // lighter green
          pale:   '#e8f5ed',   // very light green bg
        },
        // Accent - Gold
        gold: {
          DEFAULT: '#D4AF37', // primary gold
          dark:    '#b8942e', // darker gold
          light:   '#e5c55c', // lighter gold
          pale:    '#fef7e5', // very light gold bg
        },
        // Brand-specific shortcuts
        brand: {
          dark:   '#0a3d26',
          main:   '#0F5132',
          mid:    '#157347',
          light:  '#1e8a56',
          pale:   '#e8f5ed',
          gold:   '#D4AF37',
          cream:  '#FFFDF5',
        },
        // Backgrounds
        cream:  '#FFFDF5',
        white:  '#FFFFFF',
        // Neutral
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: { 50:'#e8f5ed', 100:'#c6e7d1', 500:'#198754', 600:'#157347', 700:'#0F5132' },
        warning: { 50:'#fef7e5', 100:'#f5e6b8', 500:'#D4AF37', 600:'#b8942e' },
        error:   { 50:'#fef2f2', 100:'#fee2e2', 500:'#ef4444', 600:'#dc2626' },
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'bounce-slow':'bounce 2.5s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'shimmer':    'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn:   { '0%': {opacity:'0'}, '100%': {opacity:'1'} },
        slideUp:  { '0%': {transform:'translateY(20px)',opacity:'0'}, '100%': {transform:'translateY(0)',opacity:'1'} },
        slideDown:{ '0%': {transform:'translateY(-10px)',opacity:'0'}, '100%': {transform:'translateY(0)',opacity:'1'} },
        shimmer:  { '0%': {backgroundPosition:'-200% 0'}, '100%': {backgroundPosition:'200% 0'} },
      },
      backgroundImage: {
        'gov-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.08)',
        'gold': '0 4px 14px rgba(212, 175, 55, 0.25)',
      },
    },
  },
  plugins: [],
};
