# Vergelijking CSV kostprijsgegevens vs. presets

## Bronbestanden
- CSV: `Docs/opzet kostprijs 2026 versie 20251010 BASIS LEEG/stamgegevens-Table 1.csv`
- CSV: `Docs/opzet kostprijs 2026 versie 20251010 BASIS LEEG/kostprijzen-Table 1.csv`
- Presets: `assumptions_2026.json`, `current_2025_baseline.json`, `generiek_2026_draft.json`, `stipp_basis_2026_draft.json`, `stipp_plus_2026_draft.json`, `gemeenten_2026_draft.json`, `banken_2026_draft.json`, `cao_rabobank_2025.json`

## Samenvatting
- **Matcht**: aantal vakantiedagen (25), afwezigheid ADV-dagen, basis voor werkbare dagen (261 bruto) en netto (230) komen overeen met presets.
- **Afwijkingen**: CSV hanteert 6 feestdagen (2,61%), terwijl alle presets `holidaysPaid: 7` hebben. In `kostprijzen-Table 1.csv` staat vakantiegeld op 8,00% i.p.v. 8,33%.
- **Ontbreekt in presets**: gedetailleerde opsplitsing van sociale lasten (AZV, WhK, WW, Aof), PAWW, sector-specifieke opslagen (sociaal fonds, KV/FD, contractverplichting), en concrete pensioenpercentages voor StiPP/ABP.

## Detailvergelijking

### Vakantieregeling
- CSV:
  - Vakantiedagen regulier: 10,87% (≈25 dagen) zowel voor administratief als technisch.
  - Feestdagen: 2,61% (6 dagen).
  - Vakantiegeld: 8,33% in `stamgegevens`, 8,00% in `kostprijzen`.
- Presets:
  - Alle presets (`generiek`, `StiPP`, `gemeenten`, `banken`) hebben `vacationDays: 25`, `advDays: 0` → match.
  - `holidaysPaid: 7` (veronderstelde 7 betaalde feestdagen) → mismatch t.o.v. CSV (6).
  - `vakantiegeldPct` varieert: 8,33% (StiPP) / 8,0% (Generiek, Banken, Gemeenten). CSV toont beide waarden, maar 8,33% is expliciet in stamgegevens.

### Sociale premies & opslagen
- CSV bevat volledige opsplitsing per component:
  - AZV administratief: werknemer 0,30%, werkgever 1,90%.
  - ZVW werkgever: 6,10% (werknemer 0%).
  - WhK (WGA) werkgever: 1,34%; WhK (ZW-Flex) werkgever: 3,71%.
  - WW (Awf) werkgever: 7,74%.
  - WAO/WIA (Aof) werkgever: 6,26%.
  - Wko: 0,50%; PAWW: 0,10%.
  - Opslagen: Sociaal fonds 0,20%; KV/FD-reservering 0,60%; overige 0%.
- Presets:
  - `assumptions_2026` en `current_2025_baseline` hebben alleen geaggregeerde waarden (`socialPct`, `zvwPct`, `insuranceOtherPct`) en missen componentdetail.
  - StiPP/Gemeenten/Banken drafts hebben `%`-velden op `null` of alleen vakantiegeld/IKB. Geen expliciete AZV/WhK/WW/Aof/PAWW.

### Pensioen
- CSV: StiPP premie 2026 indicatie — werknemer 7,95%, werkgever 15,90% (totaal 23,85%). Kostprijsberekening gebruikt premie 10,24% (op pensioengrondslag 16,10).
- Presets:
  - `stipp_basis_2026_draft` / `stipp_plus_2026_draft` laten `employerPct` en `employeePct` op `null` (placeholder).
  - `current_2025_baseline` heeft werkgever 14,31%, werknemer 7,5% (oude default) → wijkt af van CSV.
  - `cao_rabobank_2025` bevat precieze percentages (21,5% WG / 5,5% WN) conform cao → toont dat het model deze velden wel aankan als gevuld.

### Kostprijsfactor
- CSV berekent kostprijsfactoren tussen 1,6740 en 1,7164 per scenario.
- Presets bevatten geen veld voor totale kostprijsfactor; applicatie herleidt op basis van componenten.

### Werktijden
- CSV `stamgegevens`: bruto werkbare dagen 261, vakantiedagen 25, netto 230 → sluit aan bij `getWorkableAnnualHours` (5-daagse week) en onze vaste aannames.

## Aanbevolen vervolgstappen
1. **Feestdagen**: beslissen of presets moeten worden aangepast naar 6 of dat 7 bewust gekozen is.
2. **Vakantiegeld**: bevestigen of 8,33% leidend is voor StiPP en generiek (nu inconsistent tussen CSV en JSON’s).
3. **Sociale lasten**: uitbreiden van presets met componentvelden (`azvPct`, `whkPct`, etc.) om de kostprijs uit de CSV te reproduceren.
4. **Pensioen**: invullen van StiPP-waarde (15,90% WG / 7,95% WN) zodra definitief.
5. **PAWW en overige opslagen**: toevoegen aan `employerOther` of nieuwe velden, zodat de berekening deze posten meeneemt.
6. **Documentatie**: opnemen dat CSV-werkwijze en modelnuances verschillen (bijv. kostprijsfactor vs. componenten).
