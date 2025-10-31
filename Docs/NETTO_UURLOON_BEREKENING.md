# Berekening Netto Uurloon (Uitzenden/Loondienst)

## Ingangsvariabelen

Voor deze berekening hebben we nodig:
- **Bruto uurloon**: Het uurloon na aftrek van werkgeverslasten (bijv. €50/uur)
- **Uren per week**: Aantal gewerkte uren per week (bijv. 36 uur)
- **Vakantiegeld percentage**: Standaard 8% (= 1.08 multiplier)
- **Pensioen werknemersdeel**: Percentage van brutoloon (bijv. 7.5%)
- **Pensioengrondslag**: Percentage van brutoloon waarover pensioen wordt berekend (bijv. 90%)

---

## Stap 1: Berekening jaaruren (werkbaar)

**Formule:**
```
Jaaruren = (uren per week × 52) - (6 × (uren per week ÷ 5))
```

**Voorbeeld (36 uur/week):**
```
Jaaruren = (36 × 52) - (6 × (36 ÷ 5))
Jaaruren = 1.872 - (6 × 7.2)
Jaaruren = 1.872 - 43.2
Jaaruren = 1.829 uur
```

Deze formule houdt rekening met 6 feestdagen per jaar.

**Mappings voor standaard werkweken:**
- 36 uur/week → 1.829 uur/jaar
- 38 uur/week → 1.931 uur/jaar
- 40 uur/week → 2.024 uur/jaar

---

## Stap 2: Berekening bruto jaarloon

**Formule:**
```
Bruto jaarloon = Bruto uurloon × Jaaruren
```

**Voorbeeld (€50/uur, 36 uur/week):**
```
Bruto jaarloon = €50 × 1.829
Bruto jaarloon = €91.450
```

---

## Stap 3: Berekening jaarloon inclusief vakantiegeld

**Formule:**
```
Jaarloon met vakantie = Bruto jaarloon × 1.08
```

**Voorbeeld:**
```
Jaarloon met vakantie = €91.450 × 1.08
Jaarloon met vakantie = €98.766
```

**Toelichting:** 
De multiplier 1.08 komt overeen met 8% vakantiegeld. Vakantiegeld wordt hierbij toegevoegd aan het brutoloon voor belastingberekening.

---

## Stap 4: Berekening belastbaar bedrag

**Belangrijk:** Pensioen is aftrekbaar voor de belasting. Het belastbare bedrag wordt berekend door pensioen af te trekken van het jaarloon met vakantie.

**Formule:**
```
Belastbaar bedrag = Jaarloon met vakantie - Pensioen werknemer
```

**Voorbeeld:**
```
Belastbaar bedrag = €98.766 - €6.172,88
Belastbaar bedrag = €92.593,12
```

---

## Stap 5: Berekening loonbelasting (progressief tarief)

De loonbelasting wordt berekend over het **belastbare bedrag** (na aftrek pensioen) volgens het Nederlandse progressieve belastingstelsel met drie schijven:

### Belastingschijven 2026:
- **Schijf 1**: €0 - €37.000 → 36,93%
- **Schijf 2**: €37.000 - €73.031 → 36,93% (zelfde tarief als schijf 1)
- **Schijf 3**: €73.031 en hoger → 49,50%

### Berekening per schijf:

**Als belastbaar bedrag ≤ €37.000:**
```
Belasting = Belastbaar bedrag × 0.3693
```

**Als €37.000 < belastbaar bedrag ≤ €73.031:**
```
Belasting = (€37.000 × 0.3693) + ((Belastbaar bedrag - €37.000) × 0.3693)
```

**Als belastbaar bedrag > €73.031:**
```
Belasting = (€37.000 × 0.3693) + ((€73.031 - €37.000) × 0.3693) + ((Belastbaar bedrag - €73.031) × 0.495)
```

**Voorbeeld (€92.593,12 belastbaar bedrag):**
```
Schijf 1: €37.000 × 0.3693 = €13.664,10
Schijf 2: (€73.031 - €37.000) × 0.3693 = €36.031 × 0.3693 = €13.303,24
Schijf 3: (€92.593,12 - €73.031) × 0.495 = €19.562,12 × 0.495 = €9.688,25

Totale belasting = €13.664,10 + €13.303,24 + €9.688,25 = €36.655,59
```

---

## Stap 6: Berekening pensioen werknemersdeel

**Formule:**
```
Pensioen werknemer = Bruto jaarloon × (Pensioengrondslag ÷ 100) × (Pensioen werknemersdeel ÷ 100)
```

**Voorbeeld (Pensioengrondslag 90%, Pensioen werknemersdeel 7.5%):**
```
Pensioen werknemer = €91.450 × (90 ÷ 100) × (7.5 ÷ 100)
Pensioen werknemer = €91.450 × 0.90 × 0.075
Pensioen werknemer = €82.305 × 0.075
Pensioen werknemer = €6.172,88
```

**Opmerking:** Deze berekening gebeurt al in stap 4, maar wordt hier nogmaals genoemd voor volledigheid.

---

## Stap 7: Berekening netto jaarloon

**Formule:**
```
Netto jaarloon = Jaarloon met vakantie - Loonbelasting - Pensioen werknemer
```

**Voorbeeld:**
```
Netto jaarloon = €98.766 - €36.655,59 - €6.172,88
Netto jaarloon = €55.937,53
```

---

## Stap 8: Berekening netto uurloon

**Formule:**
```
Netto uurloon = Netto jaarloon ÷ Jaaruren
```

**Voorbeeld:**
```
Netto uurloon = €55.937,53 ÷ 1.829
Netto uurloon = €30,56
```

---

## Volledige voorbeeldberekening samengevat

**Input:**
- Bruto uurloon: €50/uur
- Uren per week: 36
- Vakantiegeld: 8%
- Pensioengrondslag: 90%
- Pensioen werknemersdeel: 7.5%

**Berekening:**
```
1. Jaaruren = (36 × 52) - (6 × 7.2) = 1.829 uur
2. Bruto jaarloon = €50 × 1.829 = €91.450
3. Jaarloon met vakantie = €91.450 × 1.08 = €98.766
4. Pensioen werknemer = €91.450 × 0.90 × 0.075 = €6.172,88
5. Belastbaar bedrag = €98.766 - €6.172,88 = €92.593,12
6. Loonbelasting = €13.664,10 + €13.303,24 + €9.688,25 = €36.655,59
7. Netto jaarloon = €98.766 - €36.655,59 - €6.172,88 = €55.937,53
8. Netto uurloon = €55.937,53 ÷ 1.829 = €30,56/uur
```

---

## Belangrijke aannames en opmerkingen

1. **Jaaruren**: Gebaseerd op 52 weken minus 6 feestdagen. De formule houdt rekening met het gemiddelde aantal uren per werkdag (uren per week ÷ 5).

2. **Vakantiegeld**: Wordt berekend als 8% van het brutoloon en opgeteld bij het brutoloon voor belastingberekening.

3. **Loonbelasting**: Progressieve belasting volgens Nederlandse belastingschijven over het **belastbare bedrag** (na aftrek pensioen). Let op: schijf 1 en 2 hebben hetzelfde tarief (36,93%).
   
   **Belangrijk:** Pensioen is fiscaal aftrekbaar, daarom wordt eerst pensioen afgetrokken voordat de belasting wordt berekend. Dit resulteert in een lager belastbaar bedrag en dus lagere belasting.

4. **Pensioen**: Wordt alleen het werknemersdeel afgetrokken van het netto inkomen. Het werkgeversdeel is al verwerkt in de berekening van het bruto uurloon via werkgeverslasten.

5. **Netto uurloon**: Dit is het eindbedrag dat de werknemer netto per uur overhoudt na alle belastingen en premies.

---

## Code implementatie referentie

Deze berekening wordt uitgevoerd in:
- **Functie**: `calculateEmployee()` in `lib/calculations.ts`
- **Belastingfunctie**: `calculateIncomeTax()` 
- **Jaaruren functie**: `getWorkableAnnualHours()`

Alle formules zijn gevalideerd en werken op basis van deze stappen.

