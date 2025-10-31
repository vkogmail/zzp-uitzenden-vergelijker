# ZZP vs Uitzenden Berekeningen - Documentatie

Dit document beschrijft de volledige logica en formules voor het berekenen van netto inkomen voor ZZP en Uitzenden.

## Input Variabelen

### Gemeenschappelijke inputs
- `rate`: Basis uurtarief (€/uur) - wordt gebruikt als fallback
- `clientRateZzp`: Klanttarief voor ZZP (€/uur)
- `clientRateEmp`: Klanttarief voor Uitzenden (€/uur)
- `marginZzp`: Marge percentage voor ZZP (%)
- `marginEmp`: Marge percentage voor Uitzenden (%)
- `hoursPerWeek`: Gewerkte uren per week (default: 36)
- `vacation`: Vakantiegeld percentage (% van omzet/salaris)
- `pensionBase`: Percentage van loon dat meetelt voor pensioenbasis (%)
- `pensionTotal`: Totale pensioeninleg percentage voor ZZP (%)
- `pensionEmployee`: Werknemer pensioenbijdrage percentage (%)
- `costs`: Bedrijfskosten percentage voor ZZP (% van omzet)
- `taxZzp`: Effectieve belastingdruk ZZP (%) - gebruikt alleen als label, niet in berekening

### Vaste constanten
- Werkgeverslasten percentage: 41.6%
- Zelfstandigenaftrek 2026: €3.750
- MKB-vrijstelling: 14%
- Belastingschijven:
  - Tot €73.031: 36.93%
  - Boven €73.031: 49.5%
- Arbeidskorting:
  - Tot €40.000: €4.000
  - €40.000 - €130.000: Lineair aflopend van €4.000 naar €0
  - Boven €130.000: €0
- AOV percentage: 6.5% van omzet
- WW buffer/sparen: 3% van omzet

## Jaaruren Berekening

### Functie: `getWorkableAnnualHours(hoursPerWeek)`

**Formule:**
```
jaaruren = (hoursPerWeek × 52) - (6 × (hoursPerWeek / 5))
```

**Uitleg:**
- 52 weken per jaar
- Minus 6 vakantiedagen
- Vakantiedagen omgerekend naar uren: 6 × (uren per week / 5 werkdagen)

**Voorbeeld (36 uur/week):**
- Jaaruren = (36 × 52) - (6 × (36/5))
- Jaaruren = 1872 - 43.2
- Jaaruren = 1829 (afgerond)

---

## ZZP Berekening

### Functie: `calculateZzp(inputs)`

### Stap 1: Basisberekening (tarief, omzet, kosten)

**Effectief tarief ZZP:**
```
effectieveRateZzp = clientRateZzp × (1 - marginZzp / 100)
```
Als `clientRateZzp` of `marginZzp` niet beschikbaar: gebruik `rate`

**Jaaruren:**
```
annualHours = getWorkableAnnualHours(hoursPerWeek)
```

**Omzet:**
```
omzet = effectieveRateZzp × annualHours
```

**Bedrijfskosten:**
```
bedrijfskosten = omzet × (costs / 100)
```

**Winst voor belasting:**
```
winstVoorBelasting = omzet - bedrijfskosten
```

### Stap 2: Verzekeringen en buffers (vóór belasting, berekend op omzet)

**AOV:**
```
aov = omzet × 0.065
```

**WW buffer/sparen:**
```
wwBuffer = omzet × 0.03
```

### Stap 3: Pensioeninleg (aftrekbaar vóór belasting)

**Pensioenbasis:**
```
pensioenBasis = winstVoorBelasting × (pensionBase / 100)
```

**Pensioeninleg:**
```
pensioen = pensioenBasis × (pensionTotal / 100)
```

### Stap 4: Fiscale winstberekening

**Winst na pensioen:**
```
winstNaPensioen = max(0, winstVoorBelasting - pensioen)
```

**Winst na verzekeringen:**
```
winstNaVerzekeringen = max(0, winstVoorBelasting - aov - wwBuffer)
```

**Winst na pensioen (gecorrigeerd):**
```
winstNaPensioen = max(0, winstNaVerzekeringen - pensioen)
```

**Zelfstandigenaftrek:**
```
zelfstandigenaftrek = 3750
```

**Winst na zelfstandigenaftrek:**
```
winstNaZelfstandig = max(0, winstNaPensioen - zelfstandigenaftrek)
```

**MKB-vrijstelling:**
```
mkbVrijstelling = winstNaZelfstandig × 0.14
```

**Belastbaar inkomen:**
```
belastbaarInkomen = max(0, winstNaZelfstandig - mkbVrijstelling)
```

### Stap 5: Box 1 belasting

**Bruto belasting:**
```
ALS belastbaarInkomen <= 73031:
    brutoBelasting = belastbaarInkomen × 0.3693
ANDERS:
    brutoBelasting = (73031 × 0.3693) + ((belastbaarInkomen - 73031) × 0.495)
```

### Stap 6: Arbeidskorting (benadering)

**Arbeidskorting:**
```
ALS belastbaarInkomen <= 40000:
    arbeidskorting = 4000
ANDERS ALS belastbaarInkomen < 130000:
    arbeidskorting = 4000 × (1 - (belastbaarInkomen - 40000) / 90000)
ANDERS:
    arbeidskorting = 0
```

**Inkomstenbelasting:**
```
inkomstenbelasting = max(0, brutoBelasting - arbeidskorting)
```

### Stap 7: Netto resultaat

**Vakantiegeld:**
```
vakantiegeld = omzet × (vacation / 100)
```

**Netto per jaar:**
```
nettoJaar = (winstVoorBelasting - inkomstenbelasting) - aov - wwBuffer - pensioen - vakantiegeld
```

**Netto per maand:**
```
nettoMaand = nettoJaar / 12
```

---

## Uitzenden Berekening

### Functie: `calculateEmployee(inputs)`

### Stap 1: Effectief tarief en bruto uurloon

**Effectief tarief Uitzenden:**
```
effectiveClientToAgency = clientRateEmp × (1 - marginEmp / 100)
```
Als `clientRateEmp` of `marginEmp` niet beschikbaar: gebruik `rate`

**Werkgeverslasten percentage:**
```
wgPct = employerTotalPct ?? 41.6
```

**Werkgeverslasten per uur:**
```
employerCostsPerHour = effectiveClientToAgency × (wgPct / 100)
```

**Bruto uurloon:**
```
brutoUurloon = effectiveClientToAgency - employerCostsPerHour
```

### Stap 2: Jaarloon berekening

**Jaaruren:**
```
annualHours = getWorkableAnnualHours(hoursPerWeek)
```

**Bruto jaarloon:**
```
brutoJaarloon = brutoUurloon × annualHours
```

**Jaarloon inclusief vakantiegeld:**
```
jaarLoonMetVakantie = brutoJaarloon × 1.08
```

### Stap 3: Vakantiegeld en pensioen

**Vakantiegeld:**
```
vakantiegeldEmp = brutoJaarloon × (vacation / 100)
```

**Pensioenbasis:**
```
pensionBaseActual = pensionBase ?? 90
```

**Pensioen werknemer:**
```
pensioenWerknemer = brutoJaarloon × (pensionBaseActual / 100) × ((pensionEmployee ?? 7.5) / 100)
```

### Stap 4: Belastingberekening

**Belastbaar bedrag:**
```
belastbaarBedrag = jaarLoonMetVakantie - pensioenWerknemer
```

**Loonbelasting:**
```
loonbelasting = calculateIncomeTax(belastbaarBedrag)
```

Zie functie `calculateIncomeTax` hieronder voor de belastingschijven.

### Stap 5: Netto resultaat

**Netto per jaar:**
```
nettoJaar = jaarLoonMetVakantie - loonbelasting - pensioenWerknemer
```

**Netto per maand:**
```
nettoMaand = nettoJaar / 12
```

---

## Belastingberekening (Box 1)

### Functie: `calculateIncomeTax(jaarLoon)`

**Belastingschijven 2026:**
- Schijf 1: Tot €37.000 → 36.93%
- Schijf 2: €37.000 - €73.031 → 36.93%
- Schijf 3: Boven €73.031 → 49.5%

**Formule:**
```
ALS jaarLoon <= 37000:
    belasting = jaarLoon × 0.3693
ANDERS ALS jaarLoon <= 73031:
    belasting = (37000 × 0.3693) + ((jaarLoon - 37000) × 0.3693)
ANDERS:
    belasting = (37000 × 0.3693) + ((73031 - 37000) × 0.3693) + ((jaarLoon - 73031) × 0.495)
```

---

## Output Types

### ZzpResult
```typescript
{
  omzet: number;
  winstVoorBelasting: number;
  belasting: number; // inkomstenbelasting
  winstNaBelasting: number;
  vakantiegeld: number;
  pensioen: number;
  nettoJaar: number;
  nettoMaand: number;
}
```

### EmployeeResult
```typescript
{
  brutoUurloon: number;
  brutoJaarloon: number;
  vakantiegeldEmp: number;
  pensioenWerknemer: number;
  loonbelasting: number;
  nettoJaar: number;
  nettoMaand: number;
}
```

---

## Belangrijke Opmerkingen

### ZZP
1. **AOV en WW buffer** worden berekend op de **omzet**, niet op winst
2. **Pensioen** wordt berekend op **winst voor belasting** (niet op omzet)
3. **Pensioen is aftrekbaar vóór belasting** (lijfrente)
4. **Vakantiegeld** wordt berekend op **omzet** en afgetrokken van netto resultaat
5. **Zelfstandigenaftrek** en **MKB-vrijstelling** worden toegepast op winst na pensioen

### Uitzenden
1. **Vakantiegeld** wordt automatisch meegenomen in `jaarLoonMetVakantie = brutoJaarloon × 1.08`
2. **Pensioen** wordt berekend op **bruto jaarloon** (niet op jaarloon met vakantie)
3. **Pensioen is aftrekbaar voor belasting** (belastbaar bedrag = jaarloon met vakantie - pensioen)
4. **Werkgeverslasten** worden afgetrokken van effectief tarief om bruto uurloon te krijgen

---

## Berekening Flow Diagram

### ZZP Flow:
```
Effectief tarief → Omzet → Bedrijfskosten → Winst voor belasting
                                                ↓
                                    ┌───────────┴───────────┐
                                    ↓                       ↓
                                AOV (6.5%)              WW buffer (3%)
                                    ↓                       ↓
                            Winst na verzekeringen
                                    ↓
                                Pensioen
                                    ↓
                            Winst na pensioen
                                    ↓
                        Zelfstandigenaftrek (€3.750)
                                    ↓
                        Winst na zelfstandigenaftrek
                                    ↓
                        MKB-vrijstelling (14%)
                                    ↓
                            Belastbaar inkomen
                                    ↓
                            Box 1 belasting
                                    ↓
                            Arbeidskorting
                                    ↓
                        Inkomstenbelasting
                                    ↓
                    Winst na belasting - AOV - WW buffer - Pensioen - Vakantiegeld
                                    ↓
                                Netto jaar
                                    ↓
                                Netto maand
```

### Uitzenden Flow:
```
Effectief tarief → Bruto uurloon (na werkgeverslasten)
                        ↓
                    Bruto jaarloon
                        ↓
                Jaarloon × 1.08 (met vakantiegeld)
                        ↓
                Pensioen (op bruto jaarloon)
                        ↓
            Belastbaar bedrag (jaarloon met vakantie - pensioen)
                        ↓
                    Loonbelasting
                        ↓
        Jaarloon met vakantie - Loonbelasting - Pensioen
                        ↓
                    Netto jaar
                        ↓
                    Netto maand
```

---

## Test Cases / Voorbeeld Berekening

### Input voorbeeld:
- `clientRateZzp`: €111/uur
- `clientRateEmp`: €118/uur
- `marginZzp`: 10%
- `marginEmp`: 15%
- `hoursPerWeek`: 36
- `vacation`: 8%
- `costs`: 10%
- `pensionTotal`: 20%
- `pensionEmployee`: 7.5%
- `pensionBase`: 90%

### ZZP Berekening voorbeeld:
1. Effectief tarief: €111 × (1 - 0.10) = €99.90/uur
2. Jaaruren: 1829 uur
3. Omzet: €99.90 × 1829 = €182.717,10
4. Bedrijfskosten (10%): €18.271,71
5. Winst voor belasting: €164.445,39
6. AOV (6.5%): €182.717,10 × 0.065 = €11.876,61
7. WW buffer (3%): €182.717,10 × 0.03 = €5.481,51
8. Pensioen: €164.445,39 × 0.90 × 0.20 = €29.600,17
9. Winst na verzekeringen: €164.445,39 - €11.876,61 - €5.481,51 = €147.087,27
10. Winst na pensioen: €147.087,27 - €29.600,17 = €117.487,10
11. Zelfstandigenaftrek: €3.750
12. Winst na zelfstandigenaftrek: €117.487,10 - €3.750 = €113.737,10
13. MKB-vrijstelling: €113.737,10 × 0.14 = €15.923,19
14. Belastbaar inkomen: €113.737,10 - €15.923,19 = €97.813,91
15. Bruto belasting: €97.813,91 × 0.3693 = €36.121,47
16. Arbeidskorting: €4.000
17. Inkomstenbelasting: €36.121,47 - €4.000 = €32.121,47
18. Vakantiegeld: €182.717,10 × 0.08 = €14.617,37
19. Netto jaar: €164.445,39 - €32.121,47 - €11.876,61 - €5.481,51 - €29.600,17 - €14.617,37 = €79.748,26
20. Netto maand: €79.748,26 / 12 = €6.645,69

### Uitzenden Berekening voorbeeld:
1. Effectief tarief: €118 × (1 - 0.15) = €100.30/uur
2. Werkgeverslasten (41.6%): €100.30 × 0.416 = €41.72/uur
3. Bruto uurloon: €100.30 - €41.72 = €58.58/uur
4. Jaaruren: 1829 uur
5. Bruto jaarloon: €58.58 × 1829 = €107.154,82
6. Jaarloon met vakantie (×1.08): €107.154,82 × 1.08 = €115.723,21
7. Vakantiegeld: €107.154,82 × 0.08 = €8.572,39
8. Pensioen (90% × 7.5%): €107.154,82 × 0.90 × 0.075 = €7.232,95
9. Belastbaar bedrag: €115.723,21 - €7.232,95 = €108.490,26
10. Loonbelasting: zie calculateIncomeTax functie
11. Netto jaar: €115.723,21 - loonbelasting - €7.232,95
12. Netto maand: netto jaar / 12

---

## Validatie Punten

Voor fact-checking, controleer:

1. **Jaaruren berekening**: Klopt de formule (52 weken - 6 dagen)?
2. **Belastingschijven**: Zijn de percentages en grenzen correct voor 2026?
3. **Zelfstandigenaftrek**: Is €3.750 correct voor 2026?
4. **MKB-vrijstelling**: Is 14% correct?
5. **Werkgeverslasten**: Is 41.6% correct voor Nederland?
6. **Arbeidskorting formule**: Klopt de lineaire afloop tussen €40.000 en €130.000?
7. **AOV percentage**: Is 6.5% correct voor zelfstandigen?
8. **WW buffer**: Is 3% een realistische aanname?
9. **Vakantiegeld berekening**: Wordt dit correct afgetrokken bij ZZP?
10. **Pensioen berekening**: Zijn de percentages en grondslagen correct?

