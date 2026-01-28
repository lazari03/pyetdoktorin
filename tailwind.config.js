module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5a58d8', // blue
        secondary: '#dbf544', // yellow-green accent
        accent: '#0f0e0e', // black
        neutral: '#eeeeee', // light gray
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
          sans: ['Mulish', 'sans-serif'], // Set Mulish as the global font
      },
        // Other extensions can be added here if needed
    },
  },
  plugins: [require('tailwindcss')],
};
