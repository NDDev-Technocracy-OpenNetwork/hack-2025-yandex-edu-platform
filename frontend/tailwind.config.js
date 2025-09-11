/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Yandex brand colors
        'brand-primary': '#FC3F1D',
        'brand-secondary': '#000000',
        'brand-accent': '#FFCC00',
        'ai-blue': '#0D44A0',
        'energy-yellow': '#FFE066',
        'success-green': '#2D8659',
        'warning-orange': '#FF7700',
        'danger-red': '#D1293D',
        
        // Interactive states
        'interactive-default': '#FC3F1D',
        'interactive-hover': '#E5381A',
        'interactive-active': '#CC3017',
        'interactive-disabled': 'rgba(0, 0, 0, 0.3)',
        
        // Background colors
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F5F5F5',
        'bg-card': '#FFFFFF',
        'bg-hover': 'rgba(252, 63, 29, 0.05)',
      },
      fontFamily: {
        'primary': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        '4xl': '40px',
        '5xl': '48px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
        '5xl': '128px',
      },
      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'dark': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'brand': '0 8px 24px rgba(252, 63, 29, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'smooth': '400ms',
      },
    },
  },
  plugins: [],
}