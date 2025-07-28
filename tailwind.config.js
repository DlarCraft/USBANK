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
        'bank-blue': '#003366',
        'bank-light-blue': '#0066cc',
        'bank-gray': '#f5f5f5',
        'bank-dark-gray': '#333333',
      },
    },
  },
  plugins: [],
}
