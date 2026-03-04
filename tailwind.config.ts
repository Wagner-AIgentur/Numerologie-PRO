import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          light: '#F4D06F',
          dark: '#B8962E',
        },
        teal: {
          dark: '#051a24',
          card: '#0d2d42',
          hover: '#154058',
        },
        body: {
          DEFAULT: '#0a2533',
          light: '#0e3040',
          mid: '#0c2a3a',
          deep: '#082030',
          darkest: '#051a24',
        },
        // Light theme (calculator page)
        'calc-bg': '#F0F4F8',
        'calc-card': '#FFFFFF',
        'calc-hover': '#F7F9FC',
        'blue-deep': '#1B3A5C',
        'blue-medium': '#2E5A88',
        'blue-light': '#E8EFF6',
        'gold-bg': '#FDF8EC',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
      },
      borderRadius: {
        pill: '9999px',
      },
      boxShadow: {
        gold: '0 4px 15px rgba(212, 175, 55, 0.3)',
        'gold-hover': '0 6px 25px rgba(212, 175, 55, 0.5)',
        card: '0 10px 40px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 15px 50px rgba(0, 0, 0, 0.6)',
        glow: '0 0 30px rgba(212, 175, 55, 0.15)',
        'card-light': '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        'card-light-hover': '0 2px 8px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #ECC558, #D4AF37)',
        'body-gradient':
          'linear-gradient(180deg, #0a2533 0%, #0e3040 15%, #0c2a3a 40%, #082030 70%, #051a24 100%)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        float: 'float 6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        'gold-reveal': 'goldReveal 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.4)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' },
          '50%': {
            boxShadow:
              '0 0 50px rgba(212, 175, 55, 0.5), 0 0 80px rgba(212, 175, 55, 0.2)',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        goldReveal: {
          '0%': { transform: 'translateX(-100%)', opacity: '0.6' },
          '100%': { transform: 'translateX(200%)', opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      zIndex: {
        background: '0',
        content: '10',
        widget: '50',
        'mobile-nav': '90',
        header: '100',
        modal: '200',
        cookie: '300',
      },
    },
  },
  plugins: [],
};

export default config;
