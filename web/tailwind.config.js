/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
    "./merchant_components/**/*.vue"
  ],
  theme: {
    extend: {
      colors: {
        body: 'var(--body)',
        content: 'var(--content)',
        'content-light': 'var(--content-light)',
        'content-light-2': 'var(--content-light-2)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'primary-outline': 'var(--primary-outline)',
        'primary-light': 'var(--primary-light)',
        'text-base': 'var(--text-base)',
        'text-light': 'var(--text-light)',
        line: 'var(--line)'
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
