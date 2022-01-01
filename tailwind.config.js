const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  mode: "jit",
  purge: ["./src/**/*.{js,jsx,ts,tsx}", "index.html"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
    colors: {
      ...colors,
    },
    aspectRatio: {
      1: "1",
      2: "2",
      3: "3",
      4: "4",
    },
    flex: {
      ...defaultTheme.flex,
      2: "2 2 0%",
      1.5: "1.5 1.5 0%",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
