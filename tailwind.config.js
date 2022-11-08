module.exports = {
  content: ["./src/*", "./src/**/*"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require('@tailwindcss/line-clamp')],
  daisyui: {
    themes: ['light', 'dark'],
  },
};
