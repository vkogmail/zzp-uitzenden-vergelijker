# CNDS Integration Plan

## Status: In Progress

### Stap 1: Package Installatie ✅
- [x] `@createnew/tokens` toegevoegd aan `package.json`
- [ ] **NEXT**: Run `npm install` om de package te installeren

### Stap 2: CSS Import ✅
- [x] CNDS tokens CSS geïmporteerd in `app/globals.css`

### Stap 3: Tailwind Config ✅
- [x] Tailwind config voorbereid voor CNDS tokens gebruik

### Stap 4: Text Styles Implementatie (TODO)
- [ ] Heading 1 (responsive: 64px → 48px → 40px)
- [ ] Heading 2 (responsive: 56px → 48px → 36px)
- [ ] Heading 3 (responsive: 32px → 24px → 22px)
- [ ] Heading 4 (responsive: 20px → 18px → 18px)
- [ ] Body (16px, geen breakpoints)
- [ ] Body Large (responsive: 18px → 16px → 16px)
- [ ] Body Medium (responsive: 16px → 15px → 15px)
- [ ] Body Small (responsive: 12px → 12px → 12px)
- [ ] Label Small (14px)
- [ ] Label Medium (responsive: 16px → 14px → 14px)
- [ ] Label Large (responsive: 18px → 14px → 14px)
- [ ] Nav Label (responsive: 15px → 15px → 15px)
- [ ] Link (responsive: 18px → 16px → 16px)
- [ ] Link Small (13px)
- [ ] ButtonLabel (responsive: 16px → 15px → 14px)
- [ ] Tag Small (responsive: 14px → 14px → 12px)
- [ ] Tag Medium (responsive: 15px → 13px → 14px)
- [ ] Tag Large (16px)
- [ ] Eyebrow (responsive: 12px → 12px → 11px)

## Breakpoints
- `minWidth: 0` = Mobile (default, kleinste)
- `minWidth: 810` = Tablet/Mobile (CNDS mobile breakpoint)
- `minWidth: 1200` = Desktop (CNDS desktop breakpoint)

## Implementatie Strategie
1. Bestaande `ty-*` utilities behouden voor backward compatibility
2. Nieuwe CNDS text styles toevoegen als `cnds-*` utilities
3. Responsive breakpoints implementeren via `@media` queries
4. CNDS tokens gebruiken waar mogelijk (fontSize, spacing, colors)

## Volgende Stappen
1. Run `npm install` om `@createnew/tokens` te installeren
2. Test of CNDS tokens CSS correct wordt geladen
3. Implementeer text styles uit `styles.json`
4. Update componenten om CNDS text styles te gebruiken waar mogelijk
