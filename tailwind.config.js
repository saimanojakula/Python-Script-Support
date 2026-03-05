/** @type {import('tailwindcss').Config} */
module.exports = {
  importants: "#bannerslider-wp",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#002C6D",
        secondary: "#F5BF00",
        accent: "#EF4444",
        neutral: "#374151",
        "base-100": "#FFFFFF",
      },
    },
  },
  plugins: [],
}
