# CNDS Setup Instructions

## Stap 1: Installeer de CNDS tokens package

```bash
npm install
```

Dit zal `@createnew/tokens` installeren vanuit GitHub (zoals geconfigureerd in `package.json`).

## Stap 2: Activeer de CNDS tokens import

Na installatie, uncomment de import in `app/globals.css`:

```css
@import "@createnew/tokens/tokens.css";
```

Verwijder de commentaar regel:
```css
/* TODO: Uncomment after running: npm install */
/* @import "@createnew/tokens/tokens.css"; */
```

## Stap 3: Test de build

```bash
npm run build
```

Als alles goed gaat, zou de build moeten slagen en zijn CNDS tokens beschikbaar via CSS variables.

## Beschikbare CNDS Text Styles

Na installatie zijn de volgende text styles beschikbaar als utilities:

- `cnds-heading-1` - Responsive heading (64px → 48px → 40px)
- `cnds-heading-2` - Responsive heading (56px → 48px → 36px)
- `cnds-heading-3` - Responsive heading (32px → 24px → 22px)
- `cnds-heading-4` - Responsive heading (20px → 18px → 18px)
- `cnds-body` - Body text (16px)
- `cnds-body-large` - Large body (18px → 16px)
- `cnds-body-medium` - Medium body (16px → 15px)
- `cnds-body-small` - Small body (12px)
- `cnds-label-small` - Small label (14px)
- `cnds-label-medium` - Medium label (16px → 14px)
- `cnds-label-large` - Large label (18px → 14px)
- `cnds-nav-label` - Navigation label (15px)
- `cnds-link` - Link text (18px → 16px)
- `cnds-link-small` - Small link (13px)
- `cnds-button-label` - Button label (16px → 15px → 14px)

## Gebruik

Gebruik de text styles in je componenten:

```tsx
<h1 className="cnds-heading-1">Heading 1</h1>
<p className="cnds-body">Body text</p>
<button className="cnds-button-label">Button</button>
```

## CNDS Tokens

CNDS tokens zijn beschikbaar via CSS variables. Gebruik ze in Tailwind classes:

```tsx
<div className="text-[var(--cnds-fontSize-base)]">
<div className="p-[var(--cnds-spacing-m)]">
<div className="bg-[var(--cnds-color-blue-100)]">
```

## Troubleshooting

Als de build faalt met "Can't resolve '@createnew/tokens/tokens.css'":
1. Zorg dat je `npm install` hebt uitgevoerd
2. Check of `node_modules/@createnew/tokens` bestaat
3. Check of `node_modules/@createnew/tokens/dist/tokens.css` bestaat
4. Als het pad anders is, pas de import aan naar het juiste pad
