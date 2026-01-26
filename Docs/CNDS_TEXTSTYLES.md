# CNDS Text Styles - Analyse

**Datum**: 2026-01-26
**Bron**: `packages/tokens/tokens/text-styles.json` in CNDS repository

## ✅ Ja, CNDS heeft Text Styles!

CNDS heeft een `text-styles.json` bestand met de volgende text styles:

### Beschikbare Text Styles

1. **`text.body`**
   - fontSize: `{fontSize.base}` (16px)
   - lineHeight: `{lineHeight.normal}` (1.5)
   - fontWeight: `{fontWeight.normal}` (400)
   - fontFamily: `{fontFamily.sans}` (Geist)

2. **`text.body-strong`**
   - fontSize: `{fontSize.base}` (16px)
   - lineHeight: `{lineHeight.normal}` (1.5)
   - fontWeight: `{fontWeight.medium}` (500)
   - fontFamily: `{fontFamily.sans}` (Geist)

3. **`text.caption`**
   - fontSize: `{fontSize.sm}` (14px)
   - lineHeight: `{lineHeight.normal}` (1.5)
   - fontWeight: `{fontWeight.normal}` (400)
   - fontFamily: `{fontFamily.sans}` (Geist)

4. **`text.label`**
   - fontSize: `{fontSize.sm}` (14px)
   - lineHeight: `20px` (fixed)
   - fontWeight: `{fontWeight.medium}` (500)
   - fontFamily: `{fontFamily.sans}` (Geist)

5. **`text.title`**
   - fontSize: `{fontSize.xl}` (20px)
   - lineHeight: `{lineHeight.tight}` (1.25)
   - fontWeight: `{fontWeight.semibold}` (600)
   - fontFamily: `{fontFamily.heading}` (Rebond Grotesque)

6. **`text.display`**
   - fontSize: `{fontSize.3xl}` (30px)
   - lineHeight: `{lineHeight.tight}` (1.25)
   - fontWeight: `{fontWeight.semibold}` (600)
   - fontFamily: `{fontFamily.heading}` (Rebond Grotesque)

## Token Referenties

De text styles gebruiken tokens uit `core.json`:
- `{fontSize.*}` - fontSize tokens (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
- `{lineHeight.*}` - lineHeight tokens (tight: 1.25, normal: 1.5, relaxed: 1.75)
- `{fontWeight.*}` - fontWeight tokens (normal: 400, medium: 500, semibold: 600, bold: 700)
- `{fontFamily.*}` - fontFamily tokens (heading: Rebond Grotesque, sans: Geist, mono)

## Vergelijking met Lokale Implementatie

### Lokale Custom Utilities (`app/globals.css`)
- `ty-h1`, `ty-h2`, `ty-h3`, `ty-h4` - Custom heading styles
- `ty-body`, `ty-body-lg`, `ty-body-sm` - Custom body styles
- `ty-nav`, `ty-label`, `ty-label-special-sm` - Custom navigation/label styles
- `ty-link` - Custom link style

### CNDS Text Styles
- `text.body`, `text.body-strong` - Body text
- `text.caption` - Caption text
- `text.label` - Label text
- `text.title` - Title text
- `text.display` - Display text

## Conclusie

✅ **CNDS heeft text styles**, maar ze zijn **anders** dan de lokale implementatie:
- CNDS heeft 6 text styles (body, body-strong, caption, label, title, display)
- Lokale implementatie heeft custom utilities voor headings (h1-h4), body variants, nav, labels, links

## Gebruik

Als je CNDS text styles wilt gebruiken:
1. Importeer `@createnew/tokens` package
2. Gebruik de text style tokens via CSS variables (als ze beschikbaar zijn in de CSS output)
3. Of gebruik ze via de tokens package API

## Volgende Stappen

Wil je:
1. De lokale custom utilities vervangen door CNDS text styles?
2. Of de CNDS text styles aanvullen met de lokale custom styles?
3. Of beide naast elkaar gebruiken?
