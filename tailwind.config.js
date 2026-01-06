module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#5a58d8', // blue
        secondary: '#dbf544', // yellow-green accent
        accent: '#0f0e0e', // black
        neutral: '#eeeeee', // light gray
      },
        fontFamily: {
          sans: ['Mulish', 'sans-serif'], // Set Mulish as the global font
      },
        // Other extensions can be added here if needed
    },
  },
  plugins: [require('tailwindcss')],
};
