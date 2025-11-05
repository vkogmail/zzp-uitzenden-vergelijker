## Plan: CAO‑presets voor betrouwbare vergelijking (createnew.co)

### Doel
Een werkbaar, transparant rekenmodel dat zonder directe koppeling met een CAO‑inlener bruikbare uitkomsten geeft door te werken met een beperkte set CAO‑presets. Uit te breiden zodra een centrale bron beschikbaar is.

## Waarom presets?
- CAO‑componenten verschillen per inlener en wijzigen periodiek (vakantiedagen, ADV, IKB, pensioen, feestdagen, ZVW, etc.).
- Zonder koppeling is één generiek model onbetrouwbaar.
- Presets maken het model voorspelbaar en uitlegbaar; afwijkingen zijn expliciet.

## MVP‑scope
- Presets (3–5): Generiek 2025, Publieke sector (richtlijn), ABU/NBBU StiPP (basis/plus) met WG‑pensioen 15,9%.
- Inclusief: vakantiedagen, vakantiegeld, feestdagen, ADV (uren/%), IKB (%), pensioen (WN+WG), ZVW (pct + cap), overige premies/vergoedingen.
- Exclude (MVP): zeldzame toeslagen/vergoedingen; later toevoegen.

## UI/UX
- Dropdown “CAO‑inlener” (met “Generiek 2025” fallback).
- Preset‑badges onder de selector: vakantiedagen, ADV, IKB, pensioen (WG 15,9%), ZVW, bronnen + datum.
- Info‑icoon “Waarom preset?” met uitleg en bronvermelding.
- Warnings:
  - “Verouderd?” badge na X maanden.
  - “Afwijking t.o.v. preset” als waarden handmatig overschreven.
- Banner “Gelijk(waardig) belonen (Wet Meer Zekerheid Flex)” met korte toelichting.

## Rekentechniek (hoog over)
1. Factuurwaarde = uurtarief × jaaruren.
2. Fee aftrek (ZZP bijv. 10%, Detachering 14%).
3. Totaal beschikbaar = factuur − fee.
4. Basis werkgeverskosten (preset) op totaal beschikbaar.
5. Bruto salaris = totaal beschikbaar − WG‑kosten.
6. Toeslagen op bruto salaris: vakantiegeld, IKB, ADV‑compensatie.
7. Pensioen: WN (aftrekbaar) + WG (kosten).
8. Heffing: loonheffing (schijven/kortingen), ZVW (pct + cap per preset).
9. Netto + optionele vergoedingen (bijv. WKR) = resultaat.

## Datamodel (voorbeeld)
```json
{
  "id": "stipp_basis_2025",
  "label": "ABU/NBBU (StiPP basis) – 2025",
  "version": "2025.12",
  "sources": ["https://normeringarbeid.nl"],
  "vacationDays": 25,
  "holidaysPaid": 7,
  "advDays": 0,
  "vakantiegeldPct": 8.33,
  "ikbPct": 17.05,
  "pension": { "employerPct": 15.9, "employeePct": 7.5, "basePct": 90, "fund": "StiPP", "phase": "Basis" },
  "zvw": { "pct": 5.75, "cap": 75860, "basis": "belastbaar" },
  "employerOther": [{ "label": "Overige premies", "pctOf": "totaalBeschikbaar", "pct": 1.2 }]
}
```

## Transparantie over marges
- Toon fee: ZZP 10% (indicatief), Detachering 14% (conform vergelijkbare aanbieders).
- Licht toe waarom het detacheringsfee hoger is (loonadmin, heffingen, CAO‑toepassing).
- Verwijs naar marktpraktijk:
  - Publieke Partner: “Fee 10% (ZZP), 14% (Detachering)” (https://depubliekepartner.nl/zzp-of-detachering/).

## Governance en versies
- Jaarversie per preset (2025, 2026), changelog en vervaldatum.
- Label alle uitkomsten als “indicatief; afhankelijk van CAO‑inlener en fase”.
- Bronnen en update‑policy:
  - Schemahouder normering arbeid (ABU/NBBU): https://normeringarbeid.nl.
  - Interne review bij wetswijzigingen (Wet Meer Zekerheid Flex).

## Roadmap
- Fase 1 (MVP): Presets + UI + transparantie, limited CAO’s.
- Fase 2: Uitbreiden presets (sector‑specifiek), meer toeslagen/vergoedingen.
- Fase 3: Koppeling naar centrale bron (API) zodra beschikbaar (normeringarbeid).
- Fase 4: Validatie op “gelijk(waardig) belonen” t.o.v. vaste medewerker.

## Risico’s en mitigatie
- Wijzigende CAO’s/percentages: versiebeheer + “verouderd?” badge.
- Onvolledige dekking: expliciete scope en “afwijking”‑indicator bij overrides.
- Juridisch/interpretatie: disclaimers + bronvermelding.

## Referenties
- Publieke Partner – ZZP of Detachering: https://depubliekepartner.nl/zzp-of-detachering/
- Normering arbeid (schemahouder ABU/NBBU): https://normeringarbeid.nl

## Samenvatting
Beperk het model tot een beheersbare set CAO‑presets met heldere bronverwijzing en versiebeheer. Maak de calculator transparant, uitlegbaar en uitbreidbaar richting een toekomstige koppeling, met focus op “gelijk(waardig) belonen” en duidelijke communicatie over aannames en beperkingen.


