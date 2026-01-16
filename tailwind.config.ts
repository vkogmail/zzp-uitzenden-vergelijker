import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      screens: {
        // CNDS breakpoints (primary)
        'sm-mobile': '390px',   // smallMobile - very small phones
        'mobile': '810px',      // mobile - phones and small tablets
        'tablet': '1199px',     // tablet - tablets and small laptops
        'desktop': '1200px',    // desktop - laptops and desktops
        // Keep Tailwind defaults for compatibility with existing code
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      maxWidth: {
        // CNDS container max-width
        'container-max': '1440px',  // CNDS containerMax
        // Keep existing Tailwind defaults
        'container': '1280px',
      },
    },
  },
};

export default config;
