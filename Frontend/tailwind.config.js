// tailwind.config.js
export default {
  darkMode: "class",   // 👈 enables dark: utilities via a "dark" class
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      //stacey added this for the font to display all over the app
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'Verdana', 'Trebuchet MS', 'Sans-serif'],
        serif: ['Times New Roman', 'Georgia', 'Palatino', 'Garamond'],
        mono: ['Courier New', 'Lucida Console', 'monospace'],
        cursive: ['Brush Script MT', 'Comic Sans MS', 'Impact'],
      },
    },
    
  },
  plugins: [],
}
