import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1280px",
      // => @media (min-width: 1280px) { ... }

      "2xl": "1536px",
      // => @media (min-width: 1536px) { ... }
      test: "1404px",
      test1: "936px",
    },
    extend: {
      colors: {
        bg_gray: "#50514F",
        accent_red: "#F25F5C",
        primary_blue: "#247BA0",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui:{
    themes:["light"]
  }
};
export default config;
