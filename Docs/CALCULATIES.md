## CALCULATIES — Eén bron van waarheid

Doel: in dit document staat beknopt en eenduidig hoe we rekenen, waar cijfers vandaan komen, en hoe JSON-velden doorwerken in de code. Dit document is leidend t.o.v. oudere losse documenten.

### 1) Overzicht en definities
- ZZP: berekening in `lib/calculations.ts` functie `calculateZzp` (netto per jaar/maand uit omzet − kosten − pensioen − belasting − post‑tax reserveringen).
- Uitzenden: berekening in `lib/calculations.ts` functie `calculateEmployee` (factuurwaarde → fee → totaal beschikbaar → werkgeverskosten → bruto salaris → toeslagen → pensioen werknemer → loonheffing → WKR → netto).
- UI gebruikt deze functies en toont tussenstappen in `components/Calculator.tsx` en `components/DetailedResults.tsx`.

### 2) Databronnen en configuratie-resolutie
We werken met presets (CAO’s) en fallback‑assumpties:
- Baseline: `data/presets/current_2025_baseline.json`
- Assumpties (fallback): `data/presets/assumptions_2026.json`
- Draft presets 2026: `data/presets/stipp_basis_2026_draft.json`, `stipp_plus_2026_draft.json`, `gemeenten_2026_draft.json`, `banken_2026_draft.json`, `generiek_2026_draft.json`

Resolutie (zoals geïmplementeerd in `getResolvedConfig()`):
1. Start met `assumptions_2026.json` (basiswaarden 2026)
2. Overschrijf met de actieve preset (velden die niet null/undefined zijn)
3. Vang resterende hiaten op via `current_2025_baseline.json`

Hierdoor heb je altijd volledige, consistente input. Null in een preset betekent “gebruik fallback”.
Voorbeeld (schematisch):
```
ASSUMPTIONS   : { emp: { employer: { socialPct: 11.0, vacationPct: 8.33 } } }
PRESET (actief): { emp: { employer: { socialPct: 10.5, vacationPct: null } } }
BASELINE      : { emp: { employer: { vacationPct: 8.00, insuranceOtherPct: 1.21 } } }

RESOLVED CFG  : { emp: { employer: {
  socialPct: 10.5,         // uit PRESET (niet null)
  vacationPct: 8.33,       // PRESET is null ⇒ fallback naar ASSUMPTIONS
  insuranceOtherPct: 1.21  // niet in PRESET/ASSUMPTIONS ⇒ fallback naar BASELINE
}}}
```

### 3) ZZP-berekening (korte keten)
1. Uurtarief en uren: effectieve rate = `clientRateZzp × (1 − marginZzp%)`. Jaaruren = `hoursPerWeek × 52`. Betaalde uren = jaaruren × `zzp.effectiveRateFactor` (standaard 0,8913 ⇒ 10,87% onbetaalde vakantie).
2. Omzet = effectieve rate × betaalde uren.
3. Kosten: bedrijfskosten = omzet × `costs%`. AOV (nu placeholder) optioneel. Pensioen (aftrekbaar): `(omzet − kosten − AOV) × pensionBase% × pensionTotal%`, met plafond 30% jaarruimte.
4. Fiscale winst: winst vóór belasting − zelfstandigenaftrek − MKB‑vrijstelling (14%). Box‑1 tariefschijven, minus heffingskortingen ⇒ inkomstenbelasting.
5. Post‑tax reserveringen: WW‑buffer = omzet × `zzp.wwBufferPct`; Zvw = min(belastbaar inkomen, `zzp.zvwCap`) × `zzp.zvwPct`; vakantiereserve = (omzet − kosten − AOV) × `zzp.vacationReservePctBase` × (1 − effectieve belastingdruk).
6. Netto jaar = winst vóór belasting − inkomstenbelasting − WW‑buffer − Zvw − vakantiereserve. Netto maand = /12.

Belangrijke velden (bron JSON): `zzp.effectiveRateFactor`, `zzp.zvwPct`, `zzp.zvwCap`, `zzp.vacationReservePctBase`, `zzp.wwBufferPct`.

### 4) Uitzenden-berekening (korte keten)
1. Factuurwaarde: `clientRateEmp × (hoursPerWeek × 52)`.
2. Fee (marge): `factuurwaarde × marginEmp%`. Totaal beschikbaar = factuurwaarde − fee.
3. Werkgeverskosten: percentage `emp.employer.employerTotalPct` of afgeleid uit som componenten: `socialPct + zvwPct + vacationPct + pensionEmployerPct + insuranceOtherPct`.
4. Bruto salaris (basis) = totaal beschikbaar − werkgeverskosten.
5. Toeslagen op bruto salaris: vakantiegeld (top‑level `vakantiegeldPct` of `emp.employer.vacationPct`), bovenwettelijke vakantiedagen (`emp.extraOnSalary.bovenwettelijkeVacationPct`), PAWW (`emp.extraOnSalary.pawwEmployerPct`), optioneel IKB (`emp.ikbPct` of top‑level `ikbPct`) en ADV‑compensatie (`emp.advCompPct` of top‑level `advCompPct`). Totaal “bruto loon” = bruto salaris + alle toeslagen.
6. Pensioen werknemer (aftrekbaar): `bruto salaris × pensionBase% × emp.employee.pensionEmployeePct`.
7. Loonheffing: box‑1 op (bruto loon − pensioen werknemer), minus heffingskortingen.
8. WKR‑onkosten: `werkgeverskosten × emp.wkrOnkostenPctOfEmployerCosts` (standaard ~2,62%) ⇒ bij netto opgeteld.
9. Netto jaar = netto loon + WKR; netto maand = /12.

Belangrijke velden (bron JSON): `emp.employer.*`, `emp.extraOnSalary.*`, `emp.employee.pensionEmployeePct`, `emp.wkrOnkostenPctOfEmployerCosts`, (top‑level) `vakantiegeldPct`, `ikbPct`, `advCompPct`.

### 5) JSON → code mapping (essentieel)
- `zzp.zvwPct`, `zzp.zvwCap` → gebruikt in `calculateZzp` (Zvw‑premie: cap + percentage).
- `zzp.effectiveRateFactor` → bepaalt betaalde uren in `calculateZzp` (default 0,8913).
- `zzp.vacationReservePctBase`, `zzp.wwBufferPct` → post‑tax reserveringen in `calculateZzp`.
- `emp.employer.[socialPct,zvwPct,vacationPct,pensionEmployerPct,insuranceOtherPct,employerTotalPct]` → werkgeverskosten in `calculateEmployee` (som of expliciet totaal).
- `emp.extraOnSalary.[bovenwettelijkeVacationPct,pawwEmployerPct]` → toeslagen op bruto salaris in `calculateEmployee`.
- `emp.employee.pensionEmployeePct` → werknemerspensioen in `calculateEmployee`.
- `emp.wkrOnkostenPctOfEmployerCosts` → WKR‑vergoeding in `calculateEmployee` (~2,62%).
- Top‑level `vakantiegeldPct`, `ikbPct`, `advCompPct` → fallback als dezelfde velden niet onder `emp.*` staan; gebruikt in UI en `calculateEmployee`.
- UI toont JSON‑waarden in `components/Calculator.tsx` en `components/DetailedResults.tsx` via `getActivePresetConfig()`.

### 6) Versie, peildatum en bronnen
Elk preset‑bestand bevat:
- `version`: semver‑achtige string voor de presetversie
- `peildatum`: ISO‑datum waarop cijfers geldig/laatst geverifieerd zijn
- `sources`: lijst van herleidbare bronnen (Belastingdienst, fondsen, cao‑teksten)
- `notes`: toelichting/assumpties (korte zinnen, geen multi‑line JSON)

Onderhoudsafspraak: bij wijziging van percentages of caps een nieuwe versie en peildatum opnemen en de bron vermelden.

Referenties (actueel in repo):
- Belastingdienst Zvw 2026: `zzp.zvwPct = 5.75`, `zzp.zvwCap ≈ 75.860` (zie `assumptions_2026.json`, bevestigen bij officiële publicatie).
- Baseline werkgeverslasten (2025): 41,60% (som componenten) in `current_2025_baseline.json`.
- StiPP/ABU/NBBU/Gemeenten/Banken 2026: draft‑presets met `notes` en `sources`; concrete pensioenpercentages 2026 nog te bevestigen.

### 7) Validaties en checks
- Som werkgeverskosten (basis) = `socialPct + zvwPct + vacationPct + pensionEmployerPct + insuranceOtherPct`; tonen in UI voor transparantie.
- Indien `employerTotalPct` ontbreekt, wordt de som afgeleid; indien aanwezig, is dat leidend.
- Preset Overlay (UI) laat de actieve JSON zien voor externe review.

### 8) Wijzigingsprocedure
1. Werk het relevante preset‑JSON bij en voeg/actualiseer `sources`, `notes`, `version`, `peildatum`.
2. Controleer in de app of de UI‑overzicht en sommen overeenkomen met de verwachtingen.
3. Laat (optioneel) een externe expert reviewen via de preset JSON overlay.

— Einde document —


