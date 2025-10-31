# Diepgaande Audit: ZZP vs Uitzenden Vergelijker

**Datum:** 2026  
**Doel:** Uitsluiten van calculatie fouten en misleidende informatie

---

## Executive Summary

Deze audit heeft de volledige berekening en UI doorgenomen op:
- ✅ **Calculatie correctheid**: Alle berekeningen zijn wiskundig correct
- ⚠️ **Vergelijkbaarheid**: Er zijn enkele aspecten die de vergelijking minder eerlijk maken
- ⚠️ **Transparantie**: Sommige labels en weergaves kunnen duidelijker

---

## AUDIT 1: TARIEVEN EN MARGES

### Huidige situatie:
- **ZZP klanttarief**: €111/uur
- **ZZP marge**: 10% → Effectief: €99.90/uur
- **Uitzenden klanttarief**: €118/uur  
- **Uitzenden marge**: 15% → Effectief: €100.30/uur
- **Verschil**: €0.40/uur (0.4%)

### Probleem:
⚠️ **Marges zijn niet gelijk** (10% vs 15%)
- Dit kan misleidend zijn voor gebruikers
- Effectieve tarieven zijn bijna gelijk, maar dat is niet duidelijk
- Gebruiker kan denken dat tarieven gelijk zijn omdat verschil klein is

### Aanbeveling:
1. Duidelijke label: "Marge die wordt ingehouden door tussenpartij"
2. Waarschuwing: "Let op: Marges zijn niet gelijk - dit beïnvloedt de vergelijking"
3. Optie: Gelijk maken van marges voor eerlijke vergelijking

---

## AUDIT 2: PENSIONEN VERGELIJKING

### Huidige situatie:
- **ZZP**: 20% totaal pensioen (max 30% jaarruimte)
- **Uitzenden**: 7.5% werknemer + 14.31% werkgever = **21.81% totaal**

### Probleem:
⚠️ **Pensioen percentages zijn NIET gelijk**
- ZZP betaalt 20% van winst
- Uitzenden krijgt 21.81% totaal (waarvan werknemer 7.5% betaalt)
- Dit is **niet een eerlijke vergelijking**

### Aanbeveling:
1. Optie A: ZZP pensioen verhogen naar 21.81% voor gelijke vergelijking
2. Optie B: Duidelijk label: "Pensioen ZZP: 20% (eigen keuze) vs Uitzenden: 21.81% (waarvan 7.5% werknemer)"
3. Waarschuwing toevoegen dat percentages verschillen

---

## AUDIT 3: VAKANTIEGELD BEREKENING

### ZZP:
- **Berekening**: 8.33% × (1 - effectieve belastingdruk) van (omzet - bedrijfskosten)
- **Tijdstip**: Afgetrokken **na belasting** (post-tax)
- **Fiscaal**: Niet aftrekbaar

### Uitzenden:
- **Berekening**: 8% van basis bruto jaarloon
- **Tijdstip**: Toegevoegd aan **bruto jaarloon** (pre-tax, maar belastbaar)
- **Fiscaal**: Onderdeel van belastbaar loon

### Probleem:
⚠️ **Verschillende behandeling kan verwarrend zijn**
- ZZP vakantiegeld wordt berekend met effectieve belastingdruk
- Uitzenden vakantiegeld is simpel 8% van basis loon
- ZZP vakantiegeld wordt gezien als "reserve" (post-tax)
- Uitzenden vakantiegeld wordt gezien als "loon" (pre-tax)

### Aanbeveling:
1. Duidelijke uitleg waarom deze verschillen bestaan
2. Label toevoegen: "Vakantiegeld ZZP: reserve (na belasting) vs Uitzenden: loon (voor belasting)"

---

## AUDIT 4: BELASTINGBEREKENINGEN

### Belastingschijven 2026:
- **Schijf 1**: €0 - €37.000 → 36.93% ✅
- **Schijf 2**: €37.000 - €73.031 → 36.93% ✅ (zelfde tarief als schijf 1)
- **Schijf 3**: > €73.031 → 49.5% ✅

### Heffingskortingen:
- **Algemene heffingskorting**: 
  - ≤ €23.000: €3.100
  - €23.000 - €73.031: Lineair aflopend
  - > €73.031: €0
  - ✅ Correct geïmplementeerd

- **Arbeidskorting**:
  - ≤ €40.000: €4.000
  - €40.000 - €130.000: Lineair aflopend
  - > €130.000: €0
  - ✅ Correct geïmplementeerd

### Status: ✅ **Alle belastingberekeningen zijn correct**

---

## AUDIT 5: ZZP ONDERNEMERSAFTREKKEN

### Zelfstandigenaftrek:
- **Huidige waarde**: €3.360
- **Check**: Verifiëren of dit correct is voor 2026

### MKB-vrijstelling:
- **Huidige waarde**: 14%
- **Status**: ✅ Correct volgens Nederlandse belastingwetgeving

### Aanbeveling:
- Verifiëren exacte bedrag zelfstandigenaftrek 2026 (mogelijk €3.750?)

---

## AUDIT 6: POST-TAX KOSTEN ZZP

### Kostenposten:
1. **Zvw-premie**: 5.75% van belastbaar inkomen (max €75.860)
   - ✅ Correct berekend
   - ✅ Correct afgetrokken na belasting

2. **WW-buffer**: 3% van omzet
   - ✅ Correct als post-tax reserve
   - ⚠️ **Aandachtspunt**: Dit is een aanname, geen verplichting

3. **Vakantiegeld**: 8.33% × (1 - effectieve belastingdruk)
   - ✅ Correct als post-tax reserve
   - ⚠️ **Aandachtspunt**: Wordt met effectieve belastingdruk aangepast

### Probleem:
⚠️ **WW-buffer en vakantiegeld zijn niet verplicht**
- Deze worden automatisch afgetrokken alsof het verplicht is
- Gebruiker kan dit niet uitschakelen
- Dit geeft mogelijk een negatiever beeld van ZZP

### Aanbeveling:
1. Duidelijke label: "Reserves (niet verplicht, maar aanbevolen)"
2. Optie toevoegen om deze uit te schakelen
3. Tooltip uitleg: "Deze reserves worden aanbevolen maar zijn niet verplicht"

---

## AUDIT 7: UITZENDEN BEREKENING

### Bruto uurloon berekening:
- **Formule**: `effectief tarief ÷ (1 + 41.6%)`
- **Status**: ✅ **Correct** (fiscaal/HR gecorrigeerd)

### Vakantiegeld:
- **Formule**: Basis bruto jaarloon × 8%
- **Tijdstip**: Toegevoegd aan bruto jaarloon (belastbaar)
- **Status**: ✅ **Correct** (dubbele telling opgelost)

### Pensioen:
- **Formule**: Bruto uurloon × 90% × 7.5% × jaaruren
- **Status**: ✅ **Correct** (berekend op basis uurloon, niet op vakantiegeld)

### Belasting:
- ✅ Correct: Berekend op (bruto jaarloon met vakantie - pensioen)
- ✅ Correct: Heffingskortingen correct toegepast

### Status: ✅ **Alle Uitzenden berekeningen zijn correct**

---

## AUDIT 8: UI LABELS EN TRANSPARANTIE

### Gevonden problemen:

1. **Marge labels**:
   - Huidig: "Marge ZZP" / "Marge Uitzenden"
   - ⚠️ Onduidelijk wat dit betekent
   - **Aanbeveling**: "Marge die wordt ingehouden (%)"

2. **Pensioen labels**:
   - ZZP: "Pensioenpremie totaal ZZP"
   - Uitzenden: Geen expliciet totaal pensioenpercentage getoond
   - ⚠️ Gebruiker ziet niet dat totaal pensioen verschilt
   - **Aanbeveling**: Totaal pensioen percentage tonen voor beide

3. **Vakantiegeld labels**:
   - ZZP: "Vakantiegeld (8.33% × ...%)"
   - Uitzenden: "Inclusief 8% vakantiegeld"
   - ⚠️ Verschillende weergave kan verwarrend zijn
   - **Aanbeveling**: Duidelijke uitleg waarom behandeling verschilt

4. **Post-tax kosten labels**:
   - ZZP: "Na belasting:" sectie met WW-buffer, Zvw, Vakantiegeld
   - ⚠️ Niet duidelijk dat deze niet verplicht zijn (behalve Zvw)
   - **Aanbeveling**: Labels zoals "WW-buffer (reserve, niet verplicht)"

5. **Footer tekst**:
   - Huidig: "Bij gelijke voorwaarden (uurtarief €{rate})..."
   - ⚠️ Tarieven zijn NIET gelijk (€111 vs €118)
   - ⚠️ De "rate" variabele wordt gebruikt, maar dat is niet het klanttarief
   - **Aanbeveling**: Tekst aanpassen om te reflecteren dat tarieven kunnen verschillen

---

## AUDIT 9: BEREKENING CONSISTENTIE

### Check: Zijn alle berekeningen consistent?

✅ **Consistentie tussen `lib/calculations.ts` en `components/Calculator.tsx`**:
- `calculateZzp()` wordt gebruikt in Calculator ✅
- `calculateEmployee()` wordt gebruikt in Calculator ✅
- Lokale berekeningen in Calculator zijn alleen voor display ✅

⚠️ **Potentiële inconsistentie**:
- Calculator component berekent enkele waarden lokaal (voor display)
- Deze moeten altijd overeenkomen met de lib-berekeningen
- **Status**: ✅ Gecontroleerd - alle belangrijke waarden komen uit lib functies

---

## AUDIT 10: MISLEIDENDE INFORMATIE - RISICO'S

### Hoog risico:

1. **Ongelijke marges** (10% vs 15%)
   - Gebruiker kan denken dat vergelijking "eerlijk" is
   - Effect: ZZP lijkt minder aantrekkelijk dan het is
   - **Impact**: Hoog

2. **Ongelijke pensioen percentages** (20% vs 21.81%)
   - ZZP krijgt minder pensioen opbouw
   - Effect: ZZP lijkt minder aantrekkelijk
   - **Impact**: Hoog

3. **WW-buffer en vakantiegeld als "verplicht"**
   - Deze worden altijd afgetrokken
   - Realiteit: ZZP'er kan kiezen hoeveel te reserveren
   - Effect: ZZP lijkt minder aantrekkelijk
   - **Impact**: Medium

4. **Footer gebruikt verkeerde variabele**
   - Gebruikt `inputs.rate` in plaats van effectieve tarieven
   - Kan verwarrend zijn
   - **Impact**: Laag

---

## CONCLUSIES EN AANBEVELINGEN

### Kritieke issues (moeten worden opgelost):

1. **Pensioen percentages gelijk maken of duidelijk maken**
2. **Marges expliciet maken of gelijk stellen** marges bij uitzenden moeten hoger zijn omdat we voor financieren, je krijgt direct betaald aan het einde vd maand
3. **WW-buffer en vakantiegeld optioneel maken of duidelijke labels**

### Aanbevolen verbeteringen:

1. **Duidelijkere labels** voor alle kostenposten
2. **Waarschuwingen** bij ongelijke vergelijkingen
3. **Tooltips** met uitleg waarom berekeningen verschillen
4. **Footer tekst** corrigeren

### Wat is correct:

✅ Alle wiskundige berekeningen
✅ Belastingberekeningen en heffingskortingen
✅ Pensioenplafond (30% jaarruimte)
✅ Zvw-premie berekening
✅ Werkgeverslasten structuur

---

## ACTIE ITEMS

1. [ ] Verifiëren zelfstandigenaftrek 2026 (mogelijk €3.750?)
2. [ ] Pensioen percentages gelijk maken of duidelijk labelen
3. [ ] Marge labels duidelijker maken
4. [ ] WW-buffer optioneel maken of duidelijke label
5. [ ] Footer tekst corrigeren
6. [ ] Tooltips toevoegen voor belangrijke verschillen
7. [ ] Waarschuwing toevoegen bij ongelijke marges

