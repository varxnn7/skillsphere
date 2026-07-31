/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
          muted: '#F1F5F9',
          border: '#E2E8F0',
          'border-strong': '#CBD5E1',
        },
        // Text hierarchy
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          faint: '#94A3B8',
          inverse: '#FFFFFF',
        },
        // Brand — vibrant blue-violet
        brand: {
          DEFAULT: '#6366F1',
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          // Legacy aliases kept for backward compat
          indigo: '#6366F1',
          purple: '#8B5CF6',
          cyan: '#06B6D4',
        },
        // Accent — fresh violet
        accent: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        // Status
        success: { DEFAULT: '#10B981', light: '#D1FAE5', text: '#065F46' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', text: '#92400E' },
        danger:  { DEFAULT: '#EF4444', light: '#FEE2E2', text: '#991B1B' },
        info:    { DEFAULT: '#3B82F6', light: '#DBEAFE', text: '#1E40AF' },

        // Dark mode (legacy, unused in new design but kept for compat)
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: 'rgba(255,255,255,0.08)',
        },
      },

      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        'gradient-warm': 'linear-gradient(135deg, #F59E0B, #EF4444)',
        'gradient-hero': 'linear-gradient(160deg, #EEF2FF 0%, #F8FAFC 50%, #E0E7FF 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-cta': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'card-3d': '0 20px 60px rgba(99,102,241,0.15), 0 8px 20px rgba(0,0,0,0.08)',
        'brand-glow': '0 0 30px rgba(99,102,241,0.25), 0 4px 15px rgba(99,102,241,0.15)',
        'brand-glow-lg': '0 0 60px rgba(99,102,241,0.3), 0 10px 30px rgba(99,102,241,0.2)',
        'input-focus': '0 0 0 3px rgba(99,102,241,0.15)',
        'btn': '0 4px 14px rgba(99,102,241,0.35)',
        'navbar': '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      animation: {
        // Continuous
        'float': 'float 7s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s infinite',

        // Entry
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-down': 'fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'scale-in': 'scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-left': 'slideLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-right': 'slideRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'blur-in': 'blurIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':       { transform: 'translateY(-18px) rotate(1deg)' },
          '66%':       { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%':      { opacity: '0.7', transform: 'scale(1.05)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(32px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blurIn: {
          '0%':   { opacity: '0', filter: 'blur(8px)', transform: 'scale(0.97)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'scale(1)' },
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },

      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
