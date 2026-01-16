# CNDS Breakpoint Integration Guide

## Current State
Your project currently uses:
- **Tailwind v4** (via `@tailwindcss/postcss`)
- **Default Tailwind breakpoints**: `md:` (768px) is the primary breakpoint used
- **Container widths**: `max-w-4xl` (896px), `max-w-5xl` (1024px), `max-w-3xl` (768px), `max-w-[1440px]`

## Recommended Approach

### Step 1: Extract CNDS Breakpoints

Since CNDS doesn't use Tailwind, you'll need to:

1. **Check CNDS Container component** (`packages/ui-react/src/Container/Container.css`)
   - Look for `@media` queries
   - Note the breakpoint values (e.g., `768px`, `1024px`, `1280px`)

2. **Check CNDS PageTemplate** (`packages/ui-react/src/PageTemplate/PageTemplate.css`)
   - Look for responsive patterns
   - Note container max-widths

3. **Check CNDS tokens** (`packages/tokens/src/tokens.ts` or `packages/tokens/tokens/core.json`)
   - Look for breakpoint token definitions

### Step 2: Create Tailwind Config

Create `tailwind.config.ts` to match CNDS breakpoints:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      screens: {
        // Match CNDS breakpoints here
        // Example (adjust based on actual CNDS values):
        'sm': '640px',   // Small devices
        'md': '768px',   // Tablets (current default)
        'lg': '1024px',  // Small desktops
        'xl': '1280px',  // Desktops
        '2xl': '1536px', // Large desktops
      },
      maxWidth: {
        // Match CNDS container widths
        'container-sm': '640px',
        'container-md': '768px',
        'container-lg': '1024px',
        'container-xl': '1280px',
        'container-2xl': '1536px',
      },
    },
  },
};

export default config;
```

### Step 3: Section Patterns from CNDS

Based on CNDS structure, here are recommended section patterns:

#### Standard Section Pattern
```tsx
<section className="py-16 px-4">
  <div className="max-w-5xl mx-auto">
    {/* Content */}
  </div>
</section>
```

#### Full-width Section with Inner Container
```tsx
<section className="w-full bg-gray-50">
  <div className="max-w-5xl mx-auto px-4 py-16">
    {/* Content */}
  </div>
</section>
```

#### Responsive Grid Section
```tsx
<section className="py-16 px-4">
  <div className="max-w-5xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Grid items */}
    </div>
  </div>
</section>
```

### Step 4: Update Your Calculator Component

Replace hardcoded widths with consistent patterns:

**Current:**
```tsx
<section className="bg-white border-b border-gray-100 pt-16 pb-12 px-4 w-full h-fit max-w-[1440px] rounded-2xl mx-auto">
```

**Recommended (using CNDS pattern):**
```tsx
<section className="bg-white border-b border-gray-100 pt-16 pb-12 px-4 w-full h-fit max-w-container-xl rounded-2xl mx-auto">
```

Or if CNDS uses a different max-width:
```tsx
<section className="bg-white border-b border-gray-100 pt-16 pb-12 px-4 w-full h-fit max-w-7xl rounded-2xl mx-auto">
```

## Next Steps

1. **Extract actual breakpoint values from CNDS:**
   - Review `Container.css` and `PageTemplate.css` files
   - Note all `@media` query breakpoints
   - Note container max-width values

2. **Update `tailwind.config.ts`** with CNDS values

3. **Standardize section patterns** across your Calculator component

4. **Test responsive behavior** at each breakpoint

## CNDS Breakpoint Values (Extracted)

**Source:** `packages/tokens/tokens/core.json` (lines 147-153)

### Breakpoint Values:
- `smallMobile`: 390px
- `mobile`: 810px  
- `tablet`: 1199px
- `desktop`: 1200px
- `containerMax`: 1440px

### CSS Variables (after build):
- `--breakpoint-smallMobile: 390px`
- `--breakpoint-mobile: 810px`
- `--breakpoint-tablet: 1199px`
- `--breakpoint-desktop: 1200px`
- `--breakpoint-containerMax: 1440px`

## Implementation Complete ✅

### Completed Steps:

1. ✅ **Created `tailwind.config.ts`** with CNDS breakpoints
   - Added `sm-mobile`, `mobile`, `tablet`, `desktop` breakpoints
   - Added `max-w-container-max` (1440px) utility

2. ✅ **Added CSS variables to `app/globals.css`**
   - Added to `:root` for general CSS use
   - Added to `@theme inline` for Tailwind v4 utilities

3. ✅ **Updated Calculator component**
   - Changed main container from `max-w-[1440px]` to `max-w-container-max`
   - Updated responsive breakpoints:
     - `md:` → `mobile:` for grid layouts (810px vs 768px)
     - Added `tablet:` for larger breakpoints (1199px)
     - Kept `md:` where appropriate for backward compatibility

### Usage in Tailwind:

**Breakpoints:**
- `sm-mobile:` - 390px and up (very small phones)
- `mobile:` - 810px and up (phones and small tablets) 
- `tablet:` - 1199px and up (tablets and small laptops)
- `desktop:` - 1200px and up (laptops and desktops)

**Container Widths:**
- `max-w-container-max` - 1440px (CNDS container max-width)

### Migration Notes:

- ✅ Existing `md:` (768px) breakpoint still works for compatibility
- ✅ New CNDS breakpoints available: `mobile:`, `tablet:`, `desktop:`
- ✅ Container max-width: Use `max-w-container-max` instead of `max-w-[1440px]`
- ✅ Calculator component updated to use CNDS breakpoints where appropriate

### Updated Components:

**`components/Calculator.tsx`:**
- Main section: `max-w-container-max` (1440px)
- Heading: `mobile:text-5xl` (was `md:text-5xl`)
- Slider grid: `mobile:grid-cols-2` (was `md:grid-cols-2`)
- Visual flow: `mobile:grid-cols-2 tablet:grid-cols-4` (was `md:grid-cols-4`)
- Chevron arrows: `tablet:block` (was `md:block`)
- Netto section: `mobile:flex-row` and `mobile:text-right` (was `md:`)
- Comparison section: `mobile:grid-cols-2` (was `md:grid-cols-2`)

### Testing:

✅ Dev server running and responsive breakpoints verified
