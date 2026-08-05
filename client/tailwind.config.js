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
          border: '#E5E7EB',
          'border-strong': '#D1D5DB',
        },
        // Text hierarchy
        ink: {
          DEFAULT: '#111827',
          muted: '#6B7280',
          faint: '#9CA3AF',
          inverse: '#FFFFFF',
        },
        // Brand — Charcoal
        brand: {
          DEFAULT: '#1F2937',
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
          // Legacy aliases
          indigo: '#1F2937',
          purple: '#374151',
          cyan: '#EA580C',
        },
        // Accent — Orange
        accent: {
          DEFAULT: '#EA580C',
          light: '#FB923C',
          dark: '#C2410C',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Orange (convenience alias)
        orange: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Charcoal (convenience alias)
        charcoal: {
          50:  '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Status
        success: { DEFAULT: '#22C55E', light: '#DCFCE7', text: '#15803D' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', text: '#92400E' },
        danger:  { DEFAULT: '#EF4444', light: '#FEE2E2', text: '#991B1B' },
        info:    { DEFAULT: '#3B82F6', light: '#DBEAFE', text: '#1E40AF' },

        // Dark mode (legacy, kept for compat)
        dark: {
          bg: '#0F172A',
          surface: '#1E293B',
          border: 'rgba(255,255,255,0.08)',
        },
      },

      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #1F2937 0%, #374151 100%)',
        'gradient-accent': 'linear-gradient(135deg, #EA580C, #FB923C)',
        'gradient-warm': 'linear-gradient(135deg, #EA580C, #F59E0B)',
        'gradient-hero': 'linear-gradient(160deg, #FFF7ED 0%, #F8FAFC 50%, #FFEDD5 100%)',
        'gradient-card': 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        'gradient-cta': 'linear-gradient(135deg, #1F2937 0%, #374151 50%, #111827 100%)',
        'gradient-orange': 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 30px rgba(234,88,12,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'card-3d': '0 20px 60px rgba(234,88,12,0.12), 0 8px 20px rgba(0,0,0,0.08)',
        'brand-glow': '0 0 30px rgba(31,41,55,0.25), 0 4px 15px rgba(31,41,55,0.15)',
        'brand-glow-lg': '0 0 60px rgba(31,41,55,0.3), 0 10px 30px rgba(31,41,55,0.2)',
        'accent-glow': '0 0 30px rgba(234,88,12,0.3), 0 4px 15px rgba(234,88,12,0.2)',
        'accent-glow-lg': '0 0 60px rgba(234,88,12,0.35), 0 10px 30px rgba(234,88,12,0.25)',
        'input-focus': '0 0 0 3px rgba(234,88,12,0.15)',
        'btn': '0 4px 14px rgba(234,88,12,0.35)',
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
        'modal-in': 'modalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
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
        modalIn: {
          '0%':   { opacity: '0', transform: 'scale(0.93) translateY(16px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
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
