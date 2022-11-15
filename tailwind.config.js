module.exports = {
  content: ["./src/*", "./src/**/*"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui"), require('@tailwindcss/line-clamp')],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#336ff2",
          "secondary": "#336ff2",
          "accent": "#336ff2",
          "neutral": "#3D4451",
          "base-100": "#FFFFFF",
          "info": "#336ff2",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
      {
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: "#336ff2",
          secondary: "#336ff2",
          accent: "#336ff2",
          info: "#336ff2",
        },
      }
    ],
  },
};
