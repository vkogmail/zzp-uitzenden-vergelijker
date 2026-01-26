import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      // CNDS tokens are available via CSS variables from @createnew/tokens
      // They can be used directly in Tailwind classes like: text-[var(--cnds-fontSize-base)]
      // Or we can map them to Tailwind theme values here for easier usage
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
      // CNDS spacing tokens (if available as CSS variables)
      spacing: {
        // These will use CNDS tokens if available, otherwise fallback to Tailwind defaults
        // Usage: p-[var(--cnds-spacing-m)] or we can map them here
      },
      // CNDS fontSize tokens (if available as CSS variables)
      fontSize: {
        // These will use CNDS tokens if available
        // Usage: text-[var(--cnds-fontSize-base)]
      },
    },
  },
};

export default config;
