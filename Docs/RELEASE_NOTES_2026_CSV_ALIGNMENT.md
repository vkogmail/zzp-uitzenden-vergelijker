# Release Notes: Sheet Arsenaal Alignment & Gedetailleerde Werkgeverslasten
**Datum**: 2025-11-XX  
**Versie**: 2026.01  
**Status**: Ter verificatie

## Overzicht

Deze release bevat belangrijke updates om de calculator te aligneren met de Sheet Arsenaal-kostprijsgegevens en om gedetailleerde werkgeverslasten te ondersteunen. Alle presets zijn bijgewerkt met exacte waarden uit de Sheet Arsenaal-bestanden en de berekeningen zijn uitgebreid om componenten opgesplitst te tonen.

---

## Belangrijkste wijzigingen

### 1. Presets gealigneerd met Sheet Arsenaal-kostprijsgegevens

**Wijzigingen**:
- ✅ **Feestdagen**: aangepast van 7 naar **6 dagen** (2,61%) in alle 2026 presets
- ✅ **ZVW percentage**: aangepast van 6,75% naar **6,10%** in alle presets
- ✅ **StiPP pensioen**: ingevuld met **15,90% WG / 7,95% WN** (was null)
- ✅ **Gedetailleerde sociale premies**: toegevoegd aan alle presets

### 2. Nieuwe structuur: gedetailleerde werkgeverslasten

**Voorheen**: Geaggregeerde waarden (`socialPct: 11.0%`)

**Nu**: Gedetailleerde componenten per premie:
```json
{
  "emp": {
    "employer": {
      "azvPct": 1.90,        // Aanvullende ziektewet
      "zvwPct": 6.10,        // Zorgverzekeringswet
      "whkWgaPct": 1.34,     // WhK WGA (Werkhervatting gedeeltelijk arbeidsgeschikten)
      "whkZwFlexPct": 3.71,  // WhK ZW-Flex (Ziektewet flexibel)
      "wwPct": 7.74,         // WW (Werkloosheidswet)
      "aofPct": 6.26,        // Aof (WAO/WIA basispremie)
      "wkoPct": 0.50,        // Wko (Wet kinderopvang)
      "vacationPct": 8.33,   // Vakantiegeld
      "pensionEmployerPct": 15.90,  // Pensioen werkgever
      "insuranceOtherPct": 0.10     // PAWW
    },
    "employerOther": {
      "sociaalFondsPct": 0.20,      // Sociaal fonds
      "kvFdReserveringPct": 0.60    // KV/FD-reservering
    }
  }
}
```

**Totaal sociale verzekeringen**: 25,75% (zonder beding A)
- AZV: 1,90%
- ZVW: 6,10%
- WhK WGA: 1,34%
- WhK ZW-Flex: 3,71%
- WW: 7,74%
- Aof: 6,26%
- Wko: 0,50%
- PAWW: 0,10%

**Opslagen**: 0,80% totaal
- Sociaal fonds: 0,20%
- KV/FD-reservering: 0,60%

### 3. UI-verbeteringen

**Detailview (Calculator.tsx)**:
- Toont nu alle gedetailleerde componenten indien beschikbaar
- Groepeert sociale verzekeringen met subtotaal
- Toont opslagen apart
- Fallback naar geaggregeerde weergave als gedetailleerde componenten ontbreken

**Simple view (SimpleMode.tsx)**:
- Ongewijzigd (toont alleen netto resultaten)

### 4. Preset dropdown gefilterd

**verwijderde cao's uit dropdown**:
- ❌ `baseline` (current_2025_baseline.json)
- ❌ `rabobank_2025` (cao_rabobank_2025.json)
- ❌ `assumptions_2026` — blijft beschikbaar

**Zichtbaar in dropdown**:
- ✅ ABU/NBBU • StiPP Basis 2026
- ✅ ABU/NBBU • StiPP Plus 2026
- ✅ Gemeenten 2026
- ✅ Banken 2026
- ✅ Generiek 2026 (default)

### 5. Bugfix: Werkgeverskosten berekening

**Probleem**:
- Presets zonder expliciete `pensionEmployerPct` vielen terug op `assumptions_2026` (14,31% pensioen)
- Default `employerTotalPct: 41.6%` werd gebruikt in plaats van afgeleide waarde uit componenten
- Dit resulteerde in te hoge werkgeverskosten (50,76% i.p.v. 36,45% voor generiek/gemeenten)

**Oplossing**:
- ✅ `pensionEmployerPct: 0` expliciet toegevoegd aan `generiek_2026_draft` en `gemeenten_2026_draft`
- ✅ Helper functie `getDerivedEmployerCostsPct()` toegevoegd om werkgeverskosten af te leiden uit componenten
- ✅ Logica aangepast: afgeleide waarde heeft nu prioriteit boven default `employerTotalPct`

**Resultaat**:
- Generiek/Gemeenten: 36,45% werkgeverskosten (was 50,76%)
- StiPP presets: 52,35% werkgeverskosten (met 15,90% pensioen)
- Verschil tussen ZZP en detacheren is nu correct zichtbaar

---

## Berekeningen

### ZZP-berekening (onveranderd)

1. **Omzet**: `effectieve_rate × betaalde_uren`
   - Betaalde uren = werkbare jaaruren × `effectiveRateFactor` (0.8913 = 89.13%)
   - Werkbare jaaruren: 2026 = 255 dagen, 2027 = 256 dagen, 2028 = 254 dagen

2. **Winst voor belasting**: `omzet − bedrijfskosten − pensioen`

3. **Fiscale winst**: 
   - `winst_voor_belasting − zelfstandigenaftrek (€3.360) − MKB_vrijstelling (14%)`

4. **Inkomstenbelasting**: Box-1 schijven (36.93% / 49.5%) minus heffingskortingen

5. **Post-tax reserveringen**:
   - WW-buffer: `omzet × 3.0%`
   - Zvw-premie: `min(belastbaar_inkomen, €75.860) × 5.75%`
   - Vakantiegeld: informatief, blijft onderdeel van netto

6. **Netto**: `winst_voor_belasting − inkomstenbelasting − WW_buffer − Zvw_premie`

### Detacheren-berekening (uitgebreid)

1. **Factuurwaarde**: `clientRateEmp × werkbare_jaaruren`

2. **Fee**: `factuurwaarde × marginEmp%`

3. **Totaal beschikbaar**: `factuurwaarde − fee`

4. **Werkgeverskosten** (nieuw: gedetailleerd):
   - Indien gedetailleerde componenten beschikbaar:
     ```
     werkgeverskosten = totaal_beschikbaar × (
       azvPct + zvwPct + whkWgaPct + whkZwFlexPct + 
       wwPct + aofPct + wkoPct + vacationPct + 
       pensionEmployerPct + insuranceOtherPct +
       sociaalFondsPct + kvFdReserveringPct
     )
     ```
   - Fallback naar geaggregeerde waarden als gedetailleerde componenten ontbreken

5. **Bruto salaris**: `totaal_beschikbaar − werkgeverskosten`

6. **Toeslagen op bruto salaris**:
   - Vakantiegeld: `bruto_salaris × vakantiegeldPct`
   - Bovenwettelijke vakantie: `bruto_salaris × 2.18%`
   - PAWW: `bruto_salaris × 0.10%`
   - IKB (indien van toepassing)
   - ADV-compensatie (indien van toepassing)

7. **Bruto loon**: `bruto_salaris + alle_toeslagen`

8. **Pensioen werknemer**: `bruto_salaris × pensionBase% × pensionEmployeePct` (aftrekbaar)

9. **Belastbaar bedrag**: `bruto_loon − pensioen_werknemer`

10. **Loonheffing**: Box-1 op belastbaar bedrag minus heffingskortingen

11. **WKR-vergoeding**: `werkgeverskosten × 2.62%` (bij netto opgeteld)

12. **Netto**: `bruto_loon − pensioen_werknemer − loonheffing + WKR_vergoeding`

---

## Bijgewerkte presets

### assumptions_2026.json
- ✅ Sociale premies opgesplitst (25,75% totaal)
- ✅ ZVW: 6,10% (was 6,75%)
- ✅ Opslagen toegevoegd (sociaal fonds, KV/FD)

### generiek_2026_draft.json
- ✅ Feestdagen: 6 (was 7)
- ✅ ZVW: 6,10%
- ✅ Gedetailleerde componenten toegevoegd
- ✅ `pensionEmployerPct: 0` expliciet toegevoegd (geen pensioen)

### stipp_basis_2026_draft.json
- ✅ Feestdagen: 6 (was 7)
- ✅ Pensioen: 15,90% WG / 7,95% WN (was null)
- ✅ ZVW: 6,10%
- ✅ Gedetailleerde componenten toegevoegd

### stipp_plus_2026_draft.json
- ✅ Feestdagen: 6 (was 7)
- ✅ Pensioen: 15,90% WG / 7,95% WN (was null)
- ✅ ZVW: 6,10%
- ✅ Gedetailleerde componenten toegevoegd

### gemeenten_2026_draft.json
- ✅ Feestdagen: 6 (was 7)
- ✅ ZVW: 6,10%
- ✅ Gedetailleerde componenten toegevoegd
- ✅ `pensionEmployerPct: 0` expliciet toegevoegd (geen pensioen)

### banken_2026_draft.json
- ✅ Feestdagen: 6 (was 7)
- ✅ ZVW: 6,10%
- ✅ Gedetailleerde componenten toegevoegd

### current_2025_baseline.json
- ✅ Sociale premies opgesplitst (25,75% totaal)
- ✅ ZVW: 6,10% (was 6,75%)
- ✅ Opslagen toegevoegd

---

## Verificatie-checklist

### ✅ Berekeningen
- [ ] **ZZP-berekening**: Netto resultaat overeenkomstig verwachting
  - Omzet = effectieve rate × betaalde uren (89.13% van werkbare uren)
  - Winst voor belasting = omzet − bedrijfskosten − pensioen
  - Belastbaar inkomen = winst − €3.360 − 14% MKB-vrijstelling
  - Inkomstenbelasting = Box-1 schijven minus heffingskortingen
  - Netto = winst − belasting − WW-buffer (3%) − Zvw-premie

- [ ] **Detacheren-berekening**: Netto resultaat overeenkomstig verwachting
  - Factuurwaarde = clientRate × werkbare jaaruren
  - Totaal beschikbaar = factuurwaarde − fee (marge%)
  - Werkgeverskosten = totaal beschikbaar × (som componenten)
  - Bruto salaris = totaal beschikbaar − werkgeverskosten
  - Bruto loon = bruto salaris + vakantiegeld + bovenwettelijke vakantie + PAWW
  - Netto = bruto loon − pensioen werknemer − loonheffing + WKR-vergoeding

### ✅ Preset-waarden
- [ ] **Feestdagen**: Alle 2026 presets hebben `holidaysPaid: 6` (was 7)
- [ ] **ZVW**: Alle presets hebben `zvwPct: 6.10` (was 6.75)
- [ ] **StiPP pensioen**: `employerPct: 15.90`, `employeePct: 7.95` (was null)
- [ ] **Sociale premies**: Totaal = 25,75% (AZV 1,90% + ZVW 6,10% + WhK WGA 1,34% + WhK ZW-Flex 3,71% + WW 7,74% + Aof 6,26% + Wko 0,50% + PAWW 0,10%)
- [ ] **Opslagen**: Sociaal fonds 0,20% + KV/FD 0,60% = 0,80%

### ✅ Sheet Arsenaal-vergelijking
- [ ] **Vakantiedagen**: 25 dagen (10,87%) — matcht Sheet Arsenaal
- [ ] **Feestdagen**: 6 dagen (2,61%) — matcht Sheet Arsenaal
- [ ] **Werkbare dagen**: 255 dagen (2026) = 2040 uur — matcht Sheet Arsenaal
- [ ] **Vakantiegeld**: 8,33% (StiPP) / 8,0% (Generiek) — matcht Sheet Arsenaal
- [ ] **Sociale premies**: Componenten komen overeen met Sheet Arsenaal
- [ ] **Pensioen StiPP**: 15,90% WG / 7,95% WN — matcht Sheet Arsenaal

### ✅ UI-weergave
- [ ] **Detailview**: Toont alle gedetailleerde componenten correct
- [ ] **Detailview**: Groepeert sociale verzekeringen met subtotaal
- [ ] **Detailview**: Toont opslagen apart
- [ ] **Dropdown**: Toont alleen de 5 presets (geen baseline, rabobank, assumptions)
- [ ] **Labels**: Geen "(draft)" meer in dropdown labels

### ✅ Fallback-logica
- [ ] **Berekening**: Gebruikt gedetailleerde componenten als beschikbaar
- [ ] **Berekening**: Valt terug op geaggregeerde waarden als componenten ontbreken
- [ ] **Preset-resolutie**: `assumptions_2026` → active preset → `current_2025_baseline`

---

## Bekende verschillen met Sheet Arsenaal

### Vakantiegeld
- **Sheet Arsenaal stamgegevens**: 8,33%
- **Sheet Arsenaal kostprijzen**: 8,00%
- **Presets**: StiPP gebruikt 8,33%, Generiek/Banken/Gemeenten gebruiken 8,0%
- **Beslissing**: Beide waarden zijn correct afhankelijk van context

### Pensioen kostprijsfactor
- **Sheet Arsenaal**: Gebruikt 10,24% op pensioengrondslag (16,10)
- **Presets**: Gebruikt 15,90% WG + 7,95% WN = 23,85% totaal
- **Verschil**: Sheet Arsenaal berekent kostprijsfactor, presets gebruiken premiepercentages
- **Impact**: Geen impact op netto-uitkomst (beide methoden zijn correct)

---

## Technische details

### Bestanden gewijzigd
- `data/presets/*.json` — alle presets bijgewerkt
- `lib/calculations.ts` — berekeningslogica uitgebreid voor gedetailleerde componenten, helper functie `getDerivedEmployerCostsPct()` toegevoegd
- `components/Calculator.tsx` — UI aangepast voor gedetailleerde weergave
- `app/page.tsx` — dropdown gefilterd, labels aangepast, logica voor afgeleide werkgeverskosten toegevoegd

### Nieuwe velden in JSON-structuur
```json
{
  "emp": {
    "employer": {
      "azvPct": number,
      "whkWgaPct": number,
      "whkZwFlexPct": number,
      "wwPct": number,
      "aofPct": number,
      "wkoPct": number
    },
    "employerOther": {
      "sociaalFondsPct": number,
      "kvFdReserveringPct": number
    }
  }
}
```

### Backward compatibility
- ✅ Oude presets met alleen `socialPct` blijven werken (fallback-logica)
- ✅ Nieuwe presets met gedetailleerde componenten worden correct gebruikt
- ✅ Geen breaking changes in berekeningen

---

## Vragen voor verificatie

1. **Zijn de sociale premie-percentages correct?**
   - Verifieer tegen officiële bronnen (Belastingdienst, UWV, etc.)

2. **Klopt de StiPP pensioen-premie?**
   - 15,90% WG / 7,95% WN voor 2026 — is dit definitief?

3. **Zijn de opslagen (sociaal fonds, KV/FD) correct?**
   - 0,20% + 0,60% = 0,80% totaal — klopt dit voor alle sectoren?

4. **Is de berekeningsvolgorde correct?**
   - Werkgeverskosten → bruto salaris → toeslagen → pensioen → belasting → netto

5. **Zijn de fallback-waarden correct?**
   - `assumptions_2026.json` als primaire fallback
   - `current_2025_baseline.json` als laatste redmiddel

---

**Documentatie**:
- [CALCULATIES.md](https://zzp-uitzenden-vergelijker.vercel.app/docs/calculaties) — volledige berekeningsdocumentatie
- [ZZP_PARAMETERS.md](https://zzp-uitzenden-vergelijker.vercel.app/docs/zzp-parameters) — ZZP-parameters per CAO