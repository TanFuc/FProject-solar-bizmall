/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0D4EA6',
          dark: '#0D2E63',
          darker: '#071B3B',
          light: '#EBF3FC',
        },
        accent: {
          orange: '#FF6B19',
          hover: '#E65A0D',
          light: '#FFF4ED',
        },
        ink: {
          DEFAULT: '#12243D',
          muted: '#5A6B82',
          light: '#8EA2BE',
        },
        surface: {
          DEFAULT: '#F5F8FC',
          white: '#FFFFFF',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(13, 78, 166, 0.08)',
        'card-hover': '0 10px 30px -4px rgba(13, 78, 166, 0.16)',
        cta: '0 4px 14px 0 rgba(255, 107, 25, 0.39)',
      },
      borderRadius: {
        '2.5xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

