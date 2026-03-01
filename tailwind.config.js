module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed', // purple (brand primary)
        secondary: '#dbf544', // yellow-green accent
        accent: '#0f0e0e', // black
        neutral: '#f8fafc', // slate-50 (surface)
        purple: {
          DEFAULT: '#7c3aed', // main purple
          light: '#a78bfa',
          dark: '#4c1d95',
        },
        teal: {
          DEFAULT: '#7eddd3',
          dark: '#5ccfc0',
        },
        ocean: {
          DEFAULT: '#033133',
        },
        cloud: {
          DEFAULT: '#b6d6d6',
        },
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
      },
    },
  },
  plugins: [],
};
