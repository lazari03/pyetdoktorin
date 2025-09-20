module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1d4ed8', // Tailwind's blue-600
        secondary: '#9333ea', // Tailwind's purple-600
        turquoise: '#58becc', // Centralized turquoise
      },
      fontFamily: {
        sans: ['Mulish', 'sans-serif'], // Set Mulish as the global font
      },
      // Other extensions can be added here if needed
    },
  },
  plugins: [require('tailwindcss'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#58becc', // Orange-500
          turquoise: '#58becc', // Centralized turquoise
          'primary-content': '#ffffff',
          secondary: '#9333ea',
          'secondary-content': '#ffffff',
          neutral: '#3d4451',
          'neutral-content': '#ffffff',
          'base-100': '#ffffff',
          'base-content': '#1f2937',
        },
      },
    ],
  },
};
