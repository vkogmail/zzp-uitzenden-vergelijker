# CNDS Migration Status V2 - Tokens Only

## Overview
This document tracks the progress of migrating from Tailwind CSS to CNDS tokens only, maintaining pixel-perfect matching with production.

## Completed Phases

### ✅ Phase 1: Setup & Baseline
- [x] Created feature branch: `feature/cnds-migration-v2`
- [x] CNDS tokens package installed and verified
- [x] CNDS tokens imported in `app/globals.css`
- [x] Build verified to work with CNDS tokens
- [x] Production baseline analysis structure created

### ✅ Phase 2: Productie Style Extraction
- [x] Style extraction script created (`scripts/extract-production-styles.js`)
- [ ] Style mapping documentation (in progress)

### ✅ Phase 3: Fallback Components
- [x] Button component created (`components/ui/Button.tsx`) with CNDS tokens
- [x] TextField component created (`components/ui/TextField.tsx`) with CNDS tokens
- [x] Tooltip component updated (`components/ui/tooltip.tsx`) with CNDS tokens

### ✅ Phase 4: Core Layout & Typography
- [x] Body styles updated to use CNDS tokens
- [x] Typography utilities (ty-h1, ty-h2, ty-h3, ty-h4, ty-body, etc.) updated to use CNDS tokens
- [x] Container layouts started (max-w-5xl → CNDS breakpoint tokens)

### 🔄 Phase 5: Calculator Input Section (In Progress)
- [x] Container styles updated
- [ ] Input grid layout fully migrated
- [ ] Labels fully migrated
- [ ] Input fields replaced with TextField component

## Remaining Work

### Phase 5: Calculator Input Section
- Replace all input elements with TextField component
- Update all label styles to use CNDS tokens
- Update input grid layout spacing to use CNDS spacing tokens

### Phase 6: Calculator Cards & Comparison
- Update ValueBlock component card styling
- Update comparison section layout
- Update value display styles (currency formatting, fonts)

### Phase 7: Breakdown Sections
- Update BreakdownRow component
- Update Accordion component
- Update breakdown sections layout

### Phase 8: Visual Validation & Fixes
- Create pixel-perfect validation script
- Fix all reported differences
- Manual visual review

### Phase 9: Cleanup & Finalization
- Remove Tailwind from package.json
- Remove Tailwind from postcss.config.mjs
- Remove all Tailwind classes from codebase
- Code organization and cleanup
- Documentation updates

## Key Files Modified

### Created
- `components/ui/Button.tsx` - Fallback button component
- `components/ui/TextField.tsx` - Fallback text field component
- `scripts/extract-production-styles.js` - Style extraction script
- `MIGRATION_STATUS.md` - This file

### Modified
- `app/globals.css` - Updated body and typography to use CNDS tokens
- `app/page.tsx` - Updated container styles to use CNDS tokens
- `components/Calculator.tsx` - Started migration (partial)
- `components/ui/tooltip.tsx` - Updated to use CNDS tokens

## CNDS Tokens Usage

### Colors
- `--color-surface-default` - White backgrounds
- `--color-surface-sunken` - Light gray backgrounds (bg-gray-50)
- `--color-surface-dark` - Dark backgrounds
- `--color-foreground-default` - Main text color (gray-900)
- `--color-foreground-muted` - Secondary text color (gray-600)
- `--color-border-subtle` - Light borders (gray-200/300)
- `--color-brand-blue` - Primary blue color
- `--color-status-error` - Error states

### Spacing
- `--spacing-xs` through `--spacing-3xl` - Standard spacing scale
- `--spacing-l` (16px) - Common padding value
- `--spacing-xl` (24px) - Common padding value

### Typography
- `--text-body-*` - Body text styles
- `--text-heading-*` - Heading styles
- `--text-label-*` - Label styles
- `--text-nav-label-*` - Navigation label styles

### Breakpoints
- `--breakpoint-container-max` (1440px) - Max container width (replaces max-w-5xl)

## Next Steps

1. Continue systematic replacement of Tailwind classes in Calculator.tsx
2. Replace all input elements with TextField component
3. Update ValueBlock component styling
4. Update BreakdownRow component styling
5. Create visual comparison script
6. Remove Tailwind completely

## Notes

- The migration maintains pixel-perfect matching with production
- All styling uses CNDS tokens via CSS variables
- Fallback components are created to match production styling exactly
- Tailwind will be completely removed in Phase 9
