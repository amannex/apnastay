/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary, #E1224D)',
          hover: 'var(--color-primary-hover, #C71B42)',
          light: 'var(--color-primary-light, #FFE4EA)',
          50: 'var(--color-primary-50, #FFF0F3)',
          100: 'var(--color-primary-100, #FFE4EA)',
          200: 'var(--color-primary-200, #FFC3D1)',
          500: 'var(--color-primary-500, #E1224D)',
          600: 'var(--color-primary-600, #C71B42)',
          700: 'var(--color-primary-700, #9E1332)',
        },
        brand: {
          bg: 'var(--color-bg-white, #FFFFFF)',
          card: 'var(--color-bg-light, #FAFAFA)',
          border: 'var(--color-border, #EDEDED)',
          text: 'var(--color-text-primary, #1A1A1A)',
          secondary: 'var(--color-text-secondary, #6B7280)',
          accent: 'var(--color-primary-light, #FFE4EA)',
        },
        surface: {
          100: 'var(--color-bg-white, #FFFFFF)',
          200: 'var(--color-bg-light, #FAFAFA)',
          300: 'var(--color-bg-subtle, #F5F5F7)',
          400: 'var(--color-border, #EDEDED)',
        },
      },
      fontFamily: {
        sans: ['var(--font-next-inter)', 'var(--font-sans)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
        outfit: ['var(--font-next-outfit)', 'Outfit', 'sans-serif'],
        inter: ['var(--font-next-inter)', 'var(--font-sans)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 4px 24px -2px rgba(0, 0, 0, 0.06), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'apple-hover': '0 12px 36px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 24px 64px -8px rgba(0, 0, 0, 0.14), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
