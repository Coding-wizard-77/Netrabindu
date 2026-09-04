/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030712',
          900: '#070d1e',
          850: '#0c152e',
          800: '#111e3f',
          750: '#172750',
          700: '#1e3366',
          600: '#2b478b',
          500: '#3b67c2',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#8b5cf6',
          crimson: '#ef4444',
        },
        command: {
          bg: '#030712',
          panel: '#070d1e',
          card: '#0c152e',
          border: '#1e3366',
          hover: '#172750',
          active: '#3b82f6',
        },
        tactical: {
          emerald: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          crimson: '#ef4444',
          violet: '#8b5cf6',
          blue: '#3b82f6',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.45)',
        'glow-blue': '0 0 25px -4px rgba(59, 130, 246, 0.45)',
        'glow-red': '0 0 25px -4px rgba(239, 68, 68, 0.55)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.45)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-elevated': '0 12px 40px 0 rgba(0, 0, 0, 0.65)',
        'neon-border': 'inset 0 0 0 1px rgba(6, 182, 212, 0.3)',
      },
      animation: {
        'radar-sweep': 'radarSweep 3s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.02)' },
        },
        glowPulse: {
          '0%': { boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
