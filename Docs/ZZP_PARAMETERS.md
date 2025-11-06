# ZZP-parameters per CAO

## Overzicht

Voor een eerlijke vergelijking tussen ZZP en uitzenden worden aan de ZZP-kant de volgende parameters gebruikt die **per CAO kunnen variëren**:

## Parameters uit preset config (`zzp.*`)

### 1. **effectiveRateFactor** (standaard: 0.8913)
- **Wat**: Factor voor betaalde uren (werkbare uren minus onbetaalde vakantie)
- **Berekening**: `betaalde_uren = werkbare_jaaruren × effectiveRateFactor`
- **Waarom CAO-afhankelijk**: Verschillende CAO's hebben verschillende vakantie-afspraken
- **Fallback**: 0.8913 (89.13% = 100% - 10.87% onbetaalde vakantie)

### 2. **vacationUnpaidPct** (standaard: 10.87%)
- **Wat**: Percentage onbetaalde vakantie-uren
- **Relatie**: `effectiveRateFactor = 1 - (vacationUnpaidPct / 100)`
- **Waarom CAO-afhankelijk**: CAO's kunnen verschillende vakantie-afspraken hebben
- **Fallback**: 10.87%

### 3. **vacationReservePctBase** (standaard: 8.33%)
- **Wat**: Basis percentage voor vakantiegeld reserve (vóór belastingcorrectie)
- **Berekening**: `vakantiegeld = (omzet - bedrijfskosten) × vacationReservePctBase × (1 - effectieve_belastingdruk)`
- **Waarom CAO-afhankelijk**: Kan overgenomen worden van `vakantiegeldPct` of `emp.employer.vacationPct` uit CAO
- **Fallback prioriteit**:
  1. `vakantiegeldPct` (top-level)
  2. `emp.employer.vacationPct` (CAO werkgeverskosten)
  3. `zzp.vacationReservePctBase` (8.33%)

### 4. **wwBufferPct** (standaard: 3.0%)
- **Wat**: Percentage WW-buffer/reserve (niet verplicht, aanbevolen)
- **Berekening**: `wwBuffer = omzet × wwBufferPct`
- **Waarom CAO-afhankelijk**: Sommige CAO's kunnen andere reserve-afspraken hebben
- **Fallback**: 3.0%

### 5. **zvwPct** (standaard: 5.75%)
- **Wat**: Zorgverzekeringswet premie percentage
- **Berekening**: `zvwPremie = min(belastbaar_inkomen, zvwCap) × zvwPct`
- **Waarom CAO-afhankelijk**: Kan jaarlijks wijzigen (2026: 5.75%)
- **Fallback prioriteit**:
  1. `zzp.zvwPct`
  2. `zvw.pct` (top-level)
  3. 5.75%

### 6. **zvwCap** (standaard: 75860)
- **Wat**: Maximum inkomen waarover Zvw wordt geheven (in euro's)
- **Waarom CAO-afhankelijk**: Kan jaarlijks wijzigen (2026: €75.860)
- **Fallback prioriteit**:
  1. `zzp.zvwCap`
  2. `zvw.cap` (top-level)
  3. 75860

## Parameters uit user inputs (niet CAO-afhankelijk)

Deze komen uit de calculator inputs en zijn **niet** CAO-afhankelijk:
- `costs` (bedrijfskosten %) - gebruiker bepaalt
- `pensionTotal` (totaal pensioen %) - gebruiker bepaalt
- `pensionBase` (pensioen grondslag %) - gebruiker bepaalt

## Parameters die altijd hetzelfde zijn (fiscaal)

Deze zijn **niet** CAO-afhankelijk omdat ze fiscaal bepaald zijn:
- Zelfstandigenaftrek: €3.360 (vast bedrag)
- MKB-vrijstelling: 14% (vast percentage)
- Belastingtarieven: 36.93% / 49.5% (vast)
- Heffingskortingen: algemene heffingskorting, arbeidskorting (vast)

## Implementatie

De parameters worden opgehaald via `getResolvedConfig()` met fallback:
1. **Active preset** (CAO-specifiek)
2. **Assumptions** (fallback defaults)
3. **Baseline** (veiligheid)

Zie `lib/calculations.ts` functie `calculateZzp()` voor de exacte implementatie.

