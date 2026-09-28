/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,json}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdaff',
          300: '#8ec2ff',
          400: '#589fff',
          500: '#3179fb',
          600: '#1b56f1',
          700: '#1641e1',
          800: '#1839b6',
          900: '#1a358f',
          950: '#142257'
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae3',
          400: '#98a2b3',
          600: '#4b5563',
          800: '#1f2937',
          900: '#111827',
          950: '#0b1220'
        }
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Songti SC', 'serif']
      },
      maxWidth: {
        content: '1200px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)',
        lift: '0 18px 44px -22px rgba(16,24,40,.35)',
        glow: '0 24px 60px -28px rgba(27,86,241,.55)'
      },
      backgroundImage: {
        'brand-sheen': 'linear-gradient(135deg,#1b56f1 0%,#3179fb 45%,#14b8a6 100%)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        sheen: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' }
        }
      },
      animation: {
        'fade-up': 'fade-up .5s cubic-bezier(.22,.61,.36,1) both',
        float: 'float 7s ease-in-out infinite',
        sheen: 'sheen 12s ease-in-out infinite alternate'
      }
    }
  },
  plugins: []
}
