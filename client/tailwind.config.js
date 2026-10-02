/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Dark dashboard palette matching the UI reference
        navy: {
          950: '#070A0F',
          900: '#0D111A',
          850: '#111722',
          800: '#161F2E',
          700: '#1F2B3E',
          600: '#2A3A54',
        },
        brand: {
          emerald: '#10B981',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          purple: '#8B5CF6',
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04), 0 10px 30px rgba(0, 0, 0, 0.04)',
        'soft-dark': '0 4px 20px rgba(0, 0, 0, 0.35)',
        'podium': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        'podium-dark': '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
