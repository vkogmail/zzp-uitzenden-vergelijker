# CNDS Stapsgewijze Implementatie Plan

## Status: Klaar om te starten

### ✅ Fase 1: Setup (Voltooid)
- [x] Package geïnstalleerd
- [x] CNDS tokens CSS geïmporteerd
- [x] Text styles geïmplementeerd
- [x] Build werkt

### 📋 Fase 2: Inventarisatie (Huidige stap)
- [ ] Inventariseren waar `ty-*` utilities worden gebruikt
- [ ] Inventariseren waar hardcoded Tailwind classes worden gebruikt
- [ ] Prioriteren welke componenten eerst aanpakken

### 🎯 Fase 3: Component Migratie (Stapsgewijs)

#### Stap 3.1: Eenvoudige componenten (Start hier)
- [ ] `app/page.tsx` - Nav label
- [ ] `components/Disclaimer.tsx` - Body text
- [ ] `components/MarkdownPage.tsx` - Headings en body

#### Stap 3.2: Calculator component
- [ ] Labels en headings
- [ ] Body text
- [ ] Button labels

#### Stap 3.3: ValueBlock component
- [ ] Headings
- [ ] Labels
- [ ] Body text

#### Stap 3.4: Overige componenten
- [ ] ConfigInput
- [ ] BreakdownRow
- [ ] InfoTooltip

### 🎨 Fase 4: Tokens Gebruik
- [ ] Colors: vervang hardcoded colors met CNDS tokens
- [ ] Spacing: vervang hardcoded spacing met CNDS tokens
- [ ] Typography: gebruik CNDS fontSize/lineHeight tokens

### 🧹 Fase 5: Cleanup
- [ ] Oude `ty-*` utilities verwijderen (als alles gemigreerd is)
- [ ] Documentatie updaten

## Strategie per Component

### 1. Identificeer gebruik
- Zoek naar `ty-*` classes
- Zoek naar hardcoded Tailwind typography classes
- Zoek naar hardcoded colors/spacing

### 2. Vervang stapsgewijs
- Eerst: Text styles (`ty-h1` → `cnds-heading-1`)
- Dan: Colors (hardcoded → CNDS tokens)
- Dan: Spacing (hardcoded → CNDS tokens)

### 3. Test na elke stap
- Build check
- Visual check
- Functionaliteit check

## Mapping: Oud → Nieuw

### Text Styles
- `ty-h1` → `cnds-heading-1`
- `ty-h2` → `cnds-heading-2`
- `ty-h3` → `cnds-heading-3`
- `ty-h4` → `cnds-heading-4`
- `ty-body` → `cnds-body`
- `ty-body-lg` → `cnds-body-large`
- `ty-body-sm` → `cnds-body-small`
- `ty-nav` → `cnds-nav-label`
- `ty-label` → `cnds-label-small` of `cnds-label-medium`
- `ty-link` → `cnds-link`

### Colors
- `text-gray-900` → `text-[var(--color-gray-900)]` of CNDS token
- `bg-blue-500` → `bg-[var(--color-blue-500)]` of CNDS token

### Spacing
- `p-4` → `p-[var(--spacing-m)]` (als 4 = 16px = spacing.m)
- `gap-2` → `gap-[var(--spacing-xs)]` (als 2 = 8px = spacing.s)

## Volgende Stap

**Start met Stap 3.1**: Begin met de eenvoudigste componenten zoals `app/page.tsx` en `components/Disclaimer.tsx`.

Wil je dat ik begin met een specifieke component?
