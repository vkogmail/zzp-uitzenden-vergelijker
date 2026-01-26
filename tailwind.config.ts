import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
      colors: {
        // Value Breakdown Colors - use CSS variables for dark mode support
        'marge': {
          100: 'var(--color-marge-100)',
          200: 'var(--color-marge-200)',
          300: 'var(--color-marge-300)',
          400: 'var(--color-marge-400)',
          500: 'var(--color-marge-500)',
          text: 'var(--color-marge-text)',
        },
        'kosten': {
          100: 'var(--color-kosten-100)',
          200: 'var(--color-kosten-200)',
          300: 'var(--color-kosten-300)',
          400: 'var(--color-kosten-400)',
          500: 'var(--color-kosten-500)',
          text: 'var(--color-kosten-text)',
        },
        'pensioen': {
          100: 'var(--color-pensioen-100)',
          200: 'var(--color-pensioen-200)',
          300: 'var(--color-pensioen-300)',
          400: 'var(--color-pensioen-400)',
          500: 'var(--color-pensioen-500)',
          text: 'var(--color-pensioen-text)',
        },
        'belasting': {
          100: 'var(--color-belasting-100)',
          200: 'var(--color-belasting-200)',
          300: 'var(--color-belasting-300)',
          400: 'var(--color-belasting-400)',
          500: 'var(--color-belasting-500)',
          text: 'var(--color-belasting-text)',
        },
        'netto': {
          100: 'var(--color-netto-100)',
          200: 'var(--color-netto-200)',
          300: 'var(--color-netto-300)',
          400: 'var(--color-netto-400)',
          500: 'var(--color-netto-500)',
          text: 'var(--color-netto-text)',
        },
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
