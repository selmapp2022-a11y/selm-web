/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#183048',
          50: '#F4F6F9',
          100: '#E7EBEF',
          200: '#C0C6CC',
          600: '#2D4866',
          700: '#1F3A55',
          800: '#183048',
          900: '#0B0F14',
        },
        teal: {
          DEFAULT: '#2EC4B6',
          50: '#E6FAF8',
          100: '#C1F1EC',
          400: '#5BD4C8',
          500: '#2EC4B6',
          600: '#26A89C',
        },
        ink: {
          primary: '#0B0F14',
          secondary: '#5B6670',
          disabled: '#9AA4AE',
        },
        surface: {
          app: '#F8F8F8',
          card: '#FFFFFF',
          muted: '#E7EBEF',
          divider: '#C0C6CC',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,15,20,0.04), 0 4px 12px rgba(11,15,20,0.06)',
        cardHover: '0 4px 8px rgba(11,15,20,0.06), 0 12px 24px rgba(11,15,20,0.08)',
      },
    },
  },
  plugins: [],
};
