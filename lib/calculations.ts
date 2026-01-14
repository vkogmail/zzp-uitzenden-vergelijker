// ============================================================================
// Calculator Configuratie Interface
// ============================================================================
// Deze interface definieert alle configuratie-opties voor de detachering calculator.
// Alle percentages zijn als decimale getallen (bijv. 0.15 = 15%).
// ============================================================================

export interface CalculatorConfig {
  // Marge & Bedrijf
  // Het bedrijf houdt een marge in op het klanttarief voor bemiddeling en risicodraging
  companyMarginTotal: number; // Totale marge percentage (standaard 15%)
  companyMarginProfit: number; // Winstdeel van de marge (standaard 5%)
  companyMarginCosts: number; // Kosten deel van de marge (standaard 10%)

  // Conversiefactor
  // Converteert het kandidatentarief naar bruto uurtarief
  // Deze factor houdt rekening met werkgeverslasten en andere kosten
  conversionFactor: number; // Conversiefactor kandidatentarief naar bruto uurtarief (standaard 1.9776)

  // Pensioen (StiPP-stijl)
  // Pensioen wordt berekend op het pensioengevend loon (bruto minus franchise)
  // De franchise is een vast bedrag per uur dat wordt afgetrokken van het bruto uurloon
  // voordat de pensioenpremie wordt berekend (StiPP 2026: €9,24 per uur)
  hourlyFranchise: number; // Franchise per uur voor pensioenberekening (standaard €9,24)
  // Oude implementatie (uitgecommentarieerd voor referentie):
  // annualFranchise: number; // Jaarlijkse franchise (oude methode: €19.554,24 per jaar)
  employerPensionRate: number; // Werkgeverspensioen percentage (standaard 15.9%)
  employeePensionRate: number; // Werknemerspensioen percentage (standaard 7.5%)

  // Pensioencompensatie (herrekende grondslag)
  // Sommige CAO's/opdrachtgevers gebruiken een "herrekende grondslag" waarbij
  // compensatie wordt toegevoegd aan de basis pensioengrondslag
  pensionCompensationEnabled: boolean; // Of pensioencompensatie actief is (standaard false)
  pensionCompensationRate: number; // Compensatie percentage op basis pensioengrondslag (standaard 0)

  // Andere Fiscale Reserveringen
  // Deze worden voor de belasting afgetrokken van het bruto loon
  azvRate: number; // AZV (Arbeidsongeschiktheidsverzekering) percentage (standaard 0.3%)
  pawwRate: number; // PAWW (Premie Aanvullende Werknemersverzekeringen) percentage (standaard 0.1%)

  // Belastingschijven (2026 Nederland)
  // Progressieve belastingschijven voor inkomstenbelasting (niet AOW)
  // Let op: in 2026 zijn er 3 schijven. We modelleren dat in de berekening,
  // zonder dat de config een derde tarief nodig heeft (rate3 is constant 49.50%).
  taxBracket1Limit: number; // Eerste schijf limiet (2026: €38.883)
  taxBracket2Limit: number; // Tweede schijf limiet (2026: €78.426)
  taxRate1: number; // Belastingtarief schijf 1 (2026: 35,75%)
  taxRate2: number; // Belastingtarief schijf 2 (2026: 37,56%)
  socialPremiumRate: number; // Indicatieve "premie-deel" weergave, niet gebruiken voor aftrek (bijv. 18,22%)

  // Belastingkortingen
  // Nederlandse belastingkortingen die de belastingdruk verlagen
  arbeidsKortingMax: number; // Maximum arbeidskorting (standaard €5.052)
  arbeidsKortingPhaseInEnd: number; // Einde opbouwfase arbeidskorting (standaard €11.000)
  arbeidsKortingPhaseOutStart: number; // Start afbouwfase arbeidskorting (standaard €24.000)
  arbeidsKortingPhaseOutEnd: number; // Einde afbouwfase arbeidskorting (standaard €115.000)
  algemeenHeffingsKortingMax: number; // Maximum algemene heffingskorting (standaard €3.362)
  algemeenHeffingsKortingPhaseOutStart: number; // Start afbouwfase algemene heffingskorting (standaard €24.000)
  algemeenHeffingsKortingPhaseOutEnd: number; // Einde afbouwfase algemene heffingskorting (standaard €75.000)

  // Extra Arbeidsvoorwaarden (CAO-specifiek)
  // Deze voordelen komen bovenop het netto loon
  holidayHoursRate: number; // Vakantie-uren percentage (standaard 10.92%)
  holidayAllowanceRate: number; // Vakantiegeld percentage (standaard 8%)
  yearEndBonusRate: number; // Eindejaarsuitkering percentage (standaard 4.5%)
  ikbRate: number; // IKB (Individueel Keuzebudget) percentage (standaard 1.8%)

  // CAO Instellingen - Schakelaars voor optionele items
  // Niet alle CAO's hebben dezelfde arbeidsvoorwaarden
  hasAZV: boolean; // Of AZV van toepassing is
  hasPAWW: boolean; // Of PAWW van toepassing is
  hasYearEndBonus: boolean; // Of eindejaarsuitkering van toepassing is
  hasIKB: boolean; // Of IKB van toepassing is
}

// Standaard configuratie voor ABU/NBBU CAO met StiPP Plus pensioen
// Deze waarden zijn gebaseerd op de meest voorkomende detachering CAO's in 2026
export const defaultCalculatorConfig: CalculatorConfig = {
  companyMarginTotal: 0.15,
  companyMarginProfit: 0.05,
  companyMarginCosts: 0.10,
  conversionFactor: 1.9776,
  hourlyFranchise: 9.24, // StiPP 2026: €9,24 per uur (naar boven afgerond)
  // Oude implementatie (uitgecommentarieerd voor referentie):
  // annualFranchise: 19554.24, // Oude methode: vast jaarlijks bedrag
  employerPensionRate: 0.159,
  employeePensionRate: 0.075,
  pensionCompensationEnabled: false,
  pensionCompensationRate: 0,
  azvRate: 0.003,
  pawwRate: 0.001,

  // 2026 (niet AOW): 3 schijven
  taxBracket1Limit: 38883,
  taxBracket2Limit: 78426,
  taxRate1: 0.3575,
  taxRate2: 0.3756,

  // Alleen voor indicatieve weergave in UI, niet voor het berekenen van netto
  socialPremiumRate: 0.1822,

  arbeidsKortingMax: 5052,
  arbeidsKortingPhaseInEnd: 11000,
  arbeidsKortingPhaseOutStart: 24000,
  arbeidsKortingPhaseOutEnd: 115000,
  algemeenHeffingsKortingMax: 3362,
  algemeenHeffingsKortingPhaseOutStart: 24000,
  algemeenHeffingsKortingPhaseOutEnd: 75000,
  holidayHoursRate: 0.1092,
  holidayAllowanceRate: 0.08,
  yearEndBonusRate: 0.045,
  ikbRate: 0.018,
  hasAZV: true,
  hasPAWW: true,
  hasYearEndBonus: true,
  hasIKB: true
};

// ============================================================================
// Resultaat Interface voor Gedetailleerde Werknemer Berekening
// ============================================================================
// Deze interface bevat alle berekende waarden voor een gedetacheerde werknemer.
// Alle bedragen zijn maandelijks, tenzij anders aangegeven.
// ============================================================================

export interface FigmaMakeEmployeeResult {
  // Totals
  clientTotal: number;
  companyTotal: number;
  candidateTotal: number;
  grossTotal: number;
  reservationsTotal: number;
  taxableTotal: number;
  taxesTotal: number;
  netTotal: number;
  monthlyHours: number;

  // Breakdowns
  marginBreakdown: {
    admin: number;
    profit: number;
  };
  reservationBreakdown: {
    employeePension: number;
    azv: number;
    paww: number;
  };
  basePensionableWage: number; // Basis pensioengrondslag (na franchise, voor compensatie)
  pensionCompensation: number; // Pensioencompensatie bedrag (indien actief)
  pensionableWage: number;
  employerPension: number;
  taxBreakdown: {
    wageTaxBeforeCredits: number;
    taxCredits: number;
    incomeTax: number;
    socialPremiums: number;
    totalDeductions: number;
  };
  additionalBenefits: {
    azv: number;
    paww: number;
    totalAdditionalBenefits: number;
    holidayDaysEquivalent: number;
    holidayAllowance: number;
    yearEndBonus: number;
    ikbContribution: number;
  };
}

/**
 * Berekent het gedetailleerde netto inkomen voor een gedetacheerde werknemer
 *
 * Deze functie volgt de volledige flow van klanttarief naar netto inkomen:
 * 1. Klant betaalt → Bedrijf houdt marge → Kandidatentarief
 * 2. Kandidatentarief → Bruto uurtarief (via conversiefactor)
 * 3. Bruto uurtarief → Bruto maandloon
 * 4. Pensioenberekening (StiPP-stijl met franchise)
 * 5. Fiscale reserveringen (AZV, PAWW)
 * 6. Belastbaar loon
 * 7. Nederlandse loonbelasting met progressieve schijven en kortingen
 * 8. Netto loon + extra arbeidsvoorwaarden
 *
 * @param hourlyRate - Het uurtarief dat de klant betaalt (€/uur)
 * @param hoursPerWeek - Aantal gewerkte uren per week
 * @param config - Configuratie object met CAO-specifieke instellingen
 * @returns Gedetailleerd resultaat met alle tussenstappen en eindbedragen
 */
export function calculateEmployeeDetailed(
  hourlyRate: number,
  hoursPerWeek: number,
  config: CalculatorConfig = defaultCalculatorConfig
): FigmaMakeEmployeeResult {
  // Constanten
  // Maandelijks aantal uren: 52 weken per jaar / 12 maanden
  const MONTHLY_HOURS = hoursPerWeek * (52 / 12);

  // STAP 1: Klanttarief → Kandidatentarief
  // Het bedrijf houdt een marge in voor bemiddeling, risicodraging en administratie
  const clientRate = hourlyRate; // Wat de klant betaalt per uur
  const clientMonthly = clientRate * MONTHLY_HOURS; // Maandelijks klantbedrag

  const marginPct = config.companyMarginTotal; // Totale marge percentage
  const marginMonthly = clientMonthly * marginPct; // Wat het bedrijf houdt
  const candidateMonthly = clientMonthly - marginMonthly; // Wat beschikbaar is voor de kandidaat

  // STAP 2: Kandidatentarief → Bruto Uurtarief
  // Het kandidatentarief moet worden omgezet naar bruto uurtarief
  // De conversiefactor houdt rekening met werkgeverslasten en andere kosten
  const candidateRate = clientRate * (1 - marginPct); // Kandidatentarief per uur
  const conversionFactor = config.conversionFactor; // Conversiefactor (standaard 1.9776)
  const grossHourly = candidateRate / conversionFactor; // Bruto uurtarief

  // STAP 3: Bruto Uurtarief → Bruto Maandloon
  // Eenvoudige vermenigvuldiging van uurtarief met maandelijkse uren
  const grossMonthly = grossHourly * MONTHLY_HOURS;

  // STAP 4: Pensioenberekening (StiPP-stijl)
  // Pensioen wordt berekend op het pensioengevend loon (bruto minus franchise)
  // De franchise is een vast bedrag per uur (€9,24 in 2026) dat wordt afgetrokken
  // van het bruto loon voordat de pensioenpremie wordt berekend
  // Formule volgens StiPP 2026: Bruto uurloon - Franchise = Pensioengrondslag

  // ============================================================================
  // Beredenering: Pensioengrondslag berekening
  // ============================================================================
  // Oude logica:
  //   - pensionableWageVal = grossMonthly - monthlyFranchise (zonder clamping)
  //   - Geen ondersteuning voor pensioencompensatie/herrekende grondslag
  //
  // Probleem 1: Negatieve pensioengrondslag
  //   - Bij laag bruto loon en/of hoge franchise kan pensionableWageVal negatief worden
  //   - Dit leidt tot negatieve pensioenpremies (onlogisch)
  //
  // Probleem 2: Geen compensatie ondersteuning
  //   - Sommige opdrachtgevers/CAO kostprijs sheets gebruiken "herrekende grondslag"
  //   - Compensatie wordt toegevoegd aan de basisgrondslag voor pensioenberekening
  //   - Oude logica ondersteunt dit niet
  //
  // Nieuwe logica:
  //   - basePensionableWage = Math.max(0, grossMonthly - monthlyFranchise) (geclamped)
  //   - pensionCompensationVal = optioneel (via config, percentage op basisgrondslag)
  //   - pensionableWageVal = basePensionableWage + pensionCompensationVal
  //
  // Aanname:
  //   - Compensatie wordt gemodelleerd als percentage op basis pensioengrondslag
  //   - Alleen beschikbaar in Custom config (niet in ABU/NBBU presets)
  // ============================================================================
  const hourlyFranchise = config.hourlyFranchise; // Franchise per uur (standaard €9,24)
  const monthlyFranchise = hourlyFranchise * MONTHLY_HOURS; // Maandelijkse franchise = €9,24 × maandelijkse uren

  // Oude implementatie (uitgecommentarieerd voor referentie):
  // const annualFranchise = config.annualFranchise; // Jaarlijkse franchise (oude methode)
  // const monthlyFranchise = annualFranchise / 12; // Maandelijkse franchise (vast bedrag, onafhankelijk van uren)
  // const pensionableWageVal = grossMonthly - monthlyFranchise; // Geen clamping, geen compensatie
  // const employerPensionVal = pensionableWageVal * config.employerPensionRate;
  // const employeePensionVal = pensionableWageVal * config.employeePensionRate;

  // Nieuwe implementatie: basisgrondslag met clamping + optionele compensatie
  const basePensionableWage = Math.max(0, grossMonthly - monthlyFranchise); // Basisgrondslag (geclamped)
  const pensionCompensationVal = config.pensionCompensationEnabled
    ? basePensionableWage * config.pensionCompensationRate
    : 0; // Compensatie (optioneel)
  const pensionableWageVal = basePensionableWage + pensionCompensationVal; // Herrekende grondslag

  // Werkgever en werknemer betalen beide een percentage van de herrekende grondslag
  const employerPensionVal = pensionableWageVal * config.employerPensionRate; // Werkgeversdeel
  const employeePensionVal = pensionableWageVal * config.employeePensionRate; // Werknemersdeel

  // STAP 5: Andere Fiscale Reserveringen (Voor belasting)
  // Deze worden voor de belasting afgetrokken van het bruto loon
  // AZV = Arbeidsongeschiktheidsverzekering
  // PAWW = Premie Aanvullende Werknemersverzekeringen
  const azvVal = config.hasAZV ? grossMonthly * config.azvRate : 0;
  const pawwVal = config.hasPAWW ? grossMonthly * config.pawwRate : 0;
  const reservationsMonthly = employeePensionVal + azvVal + pawwVal; // Totale reserveringen

  // STAP 6: Belastbaar Loon
  // Het belastbaar loon is het bruto loon minus de fiscale reserveringen
  const taxableMonthly = grossMonthly - reservationsMonthly;

  // STAP 7: Nederlandse Loonbelasting Berekening (2026)
  // De Nederlandse belasting werkt met progressieve schijven en belastingkortingen
  const annualTaxableIncome = taxableMonthly * 12; // Jaarlijks belastbaar inkomen

  // 7a. Bereken bruto loonbelasting met progressieve schijven
  // ============================================================================
  // Beredenering: Belastingschijven berekening (2026)
  // ============================================================================
  // Oude situatie in code:
  //   - Er werd gerekend met 2 schijven
  //   - Limits en tarieven waren niet 2026-correct
  //   - Daardoor werd te veel loonheffing berekend (netto te laag)
  //
  // Nieuwe situatie:
  //   - 2026 heeft 3 schijven (niet AOW)
  //   - We modelleren dat als:
  //       schijf 1: t/m taxBracket1Limit tegen taxRate1
  //       schijf 2: taxBracket1Limit t/m taxBracket2Limit tegen taxRate2
  //       schijf 3: boven taxBracket2Limit tegen 49,50% (vast)
  //
  // Opzet:
  //   - Config houdt 2 grenzen en 2 tarieven, omdat rate3 in 2026 constant is (49,50%)
  //   - Als je later wil configureren per jaar, kun je taxRate3 ook toevoegen aan de config
  // ============================================================================
  let annualWageTax = 0;
  const bracket1Limit = config.taxBracket1Limit; // 2026: 38.883
  const bracket2Limit = config.taxBracket2Limit; // 2026: 78.426
  const rate1 = config.taxRate1; // 2026: 35,75%
  const rate2 = config.taxRate2; // 2026: 37,56%
  const rate3 = 0.495; // 2026: 49,50% (top)

  // Oude implementatie (uitgecommentarieerd voor referentie):
  // if (annualTaxableIncome <= bracket1Limit) {
  //   annualWageTax = annualTaxableIncome * rate1;
  // } else if (annualTaxableIncome <= bracket2Limit) {
  //   annualWageTax = (bracket1Limit * rate1) + ((annualTaxableIncome - bracket1Limit) * rate2);
  // } else {
  //   annualWageTax = (bracket1Limit * rate1) + ((bracket2Limit - bracket1Limit) * rate2) + ((annualTaxableIncome - bracket2Limit) * rate2); // FOUT: geen derde schijf
  // }

  // Nieuwe implementatie: 3 schijven
  if (annualTaxableIncome <= bracket1Limit) {
    annualWageTax = annualTaxableIncome * rate1;
  } else if (annualTaxableIncome <= bracket2Limit) {
    annualWageTax =
      (bracket1Limit * rate1) +
      ((annualTaxableIncome - bracket1Limit) * rate2);
  } else {
    annualWageTax =
      (bracket1Limit * rate1) +
      ((bracket2Limit - bracket1Limit) * rate2) +
      ((annualTaxableIncome - bracket2Limit) * rate3);
  }

  // 7b. Bereken Arbeidskorting (werkbonus)
  // Een belastingkorting die afneemt naarmate het inkomen stijgt
  let arbeidskorting = 0;
  const akMax = config.arbeidsKortingMax; // Maximum arbeidskorting (€5.052)
  const akPhaseInEnd = config.arbeidsKortingPhaseInEnd; // Einde opbouwfase (€11.000)
  const akPhaseOutStart = config.arbeidsKortingPhaseOutStart; // Start afbouwfase (€24.000)
  const akPhaseOutEnd = config.arbeidsKortingPhaseOutEnd; // Einde afbouwfase (€115.000)

  if (annualTaxableIncome <= akPhaseInEnd) {
    // Opbouwfase: lineair oplopend tot maximum
    arbeidskorting = annualTaxableIncome * 0.08425; // 8.425% van inkomen
  } else if (annualTaxableIncome <= akPhaseOutStart) {
    // Plateau: volledige korting
    arbeidskorting = akMax;
  } else if (annualTaxableIncome <= akPhaseOutEnd) {
    // Afbouwfase: lineair afnemend
    const phaseOutRate = akMax / (akPhaseOutEnd - akPhaseOutStart);
    arbeidskorting = akMax - ((annualTaxableIncome - akPhaseOutStart) * phaseOutRate);
  } else {
    // Geen korting meer
    arbeidskorting = 0;
  }
  arbeidskorting = Math.max(0, arbeidskorting); // Zorg dat het niet negatief wordt

  // 7c. Bereken Algemene heffingskorting (algemene belastingkorting)
  // Een basis korting voor alle belastingplichtigen
  let algemeenHeffingskorting = 0;
  const ahkMax = config.algemeenHeffingsKortingMax; // Maximum algemene heffingskorting (€3.362)
  const ahkPhaseOutStart = config.algemeenHeffingsKortingPhaseOutStart; // Start afbouwfase (€24.000)
  const ahkPhaseOutEnd = config.algemeenHeffingsKortingPhaseOutEnd; // Einde afbouwfase (€75.000)

  if (annualTaxableIncome <= ahkPhaseOutStart) {
    // Volledige korting
    algemeenHeffingskorting = ahkMax;
  } else if (annualTaxableIncome <= ahkPhaseOutEnd) {
    // Afbouwfase: lineair afnemend
    const phaseOutRate = ahkMax / (ahkPhaseOutEnd - ahkPhaseOutStart);
    algemeenHeffingskorting = ahkMax - ((annualTaxableIncome - ahkPhaseOutStart) * phaseOutRate);
  } else {
    // Geen korting meer
    algemeenHeffingskorting = 0;
  }
  algemeenHeffingskorting = Math.max(0, algemeenHeffingskorting); // Zorg dat het niet negatief wordt

  // 7d. Totale belastingkortingen
  // De som van alle kortingen die van de belasting worden afgetrokken
  const totalTaxCredits = arbeidskorting + algemeenHeffingskorting;

  // 7e. Loonbelasting na kortingen
  // De uiteindelijke belasting die betaald moet worden
  const annualWageTaxAfterCredits = Math.max(0, annualWageTax - totalTaxCredits);

  // 7f. Maandelijks maken
  const monthlyWageTaxBeforeCredits = annualWageTax / 12;
  const monthlyTaxCredits = totalTaxCredits / 12;
  const monthlyWageTaxAfterCredits = annualWageTaxAfterCredits / 12;

  // ============================================================================
  // Beredenering: Netto berekening (Optie A)
  // ============================================================================
  // Waarom de oude "splits premies" aanpak fout kan uitpakken:
  //   - Als je annualSocialPremiums apart berekent en daarna opnieuw aftrekt, loop je
  //     het risico dubbel te tellen of een onrealistische split te tonen.
  //
  // Nieuwe keuze (Optie A):
  //   - Netto = belastbaar loon - totale loonheffing na kortingen
  //   - Voor UI tonen we een indicatieve split "inkomstenbelasting" en "sociale premies"
  //     op basis van het aandeel socialPremiumRate, maar zonder invloed op netto.
  //
  // Let op:
  //   - Dit is een UI-split, niet een fiscaal exacte decompositie.
  // ============================================================================
  const totalMonthlyDeductions = monthlyWageTaxAfterCredits;

  // Indicatieve split voor UI, telt exact op tot totalMonthlyDeductions
  const socialPremiumRate = config.socialPremiumRate;
  const monthlySocialPremiums = totalMonthlyDeductions * socialPremiumRate;
  const monthlyIncomeTax = Math.max(0, totalMonthlyDeductions - monthlySocialPremiums);

  // Netto Resultaat
  // Het bedrag dat de werknemer daadwerkelijk ontvangt op de bankrekening
  const netMonthly = taxableMonthly - totalMonthlyDeductions;

  // STAP 8: Extra Arbeidsvoorwaarden (berekend na netto loon) - CAO specifiek
  // Deze voordelen komen bovenop het netto loon en zijn CAO-afhankelijk
  // Vakantie-uren: extra vrije uren die worden uitbetaald tegen netto uurtarief
  const holidayHours = MONTHLY_HOURS * config.holidayHoursRate; // Aantal vakantie-uren per maand
  const netHourlyRate = netMonthly / MONTHLY_HOURS; // Netto uurtarief
  const holidayDaysEquivalent = holidayHours * netHourlyRate; // Waarde van vakantie-uren in euro's

  // Vakantiegeld: percentage van bruto loon (meestal 8%)
  const holidayAllowance = grossMonthly * config.holidayAllowanceRate;

  // Eindejaarsuitkering: extra uitkering aan het einde van het jaar (meestal 4.5%)
  const yearEndBonus = config.hasYearEndBonus ? grossMonthly * config.yearEndBonusRate : 0;

  // IKB (Individueel Keuzebudget): flexibele uitkering die werknemer kan besteden (meestal 1.8%)
  const ikbContribution = config.hasIKB ? grossMonthly * config.ikbRate : 0;

  // Totale extra arbeidsvoorwaarden
  // Dit is wat er bovenop het netto loon komt
  const totalAdditionalBenefits = holidayDaysEquivalent + holidayAllowance + yearEndBonus + ikbContribution;

  // Retourneer alle berekende waarden
  // Alle bedragen zijn maandelijks, behalve waar anders aangegeven
  return {
    // Totalen - Hoofdcijfers voor overzicht
    clientTotal: clientMonthly, // Wat de klant betaalt per maand
    companyTotal: marginMonthly, // Wat het bedrijf houdt per maand
    candidateTotal: candidateMonthly, // Wat beschikbaar is voor de kandidaat per maand
    grossTotal: grossMonthly, // Bruto maandloon
    reservationsTotal: reservationsMonthly, // Totale fiscale reserveringen (pensioen, AZV, PAWW)
    taxableTotal: taxableMonthly, // Belastbaar maandloon
    taxesTotal: totalMonthlyDeductions, // Totale belastingen en premies (loonheffing na kortingen)
    netTotal: netMonthly, // Netto maandloon (wat op de bankrekening komt)
    monthlyHours: MONTHLY_HOURS, // Aantal uren per maand

    // Gedetailleerde Opbrekingen - Voor transparantie
    marginBreakdown: {
      // Opbreking van de bedrijfsmarge
      admin: marginMonthly * (config.companyMarginCosts / config.companyMarginTotal), // Kosten deel
      profit: marginMonthly * (config.companyMarginProfit / config.companyMarginTotal) // Winst deel
    },
    reservationBreakdown: {
      // Opbreking van fiscale reserveringen
      employeePension: employeePensionVal, // Werknemerspensioen
      azv: azvVal, // Arbeidsongeschiktheidsverzekering
      paww: pawwVal // Premie Aanvullende Werknemersverzekeringen
    },
    basePensionableWage: basePensionableWage, // Basis pensioengrondslag (na franchise, voor compensatie)
    pensionCompensation: pensionCompensationVal, // Pensioencompensatie bedrag (indien actief)
    pensionableWage: pensionableWageVal, // Herrekende pensioengrondslag (basis + compensatie)
    employerPension: employerPensionVal, // Werkgeverspensioen (komt bovenop netto loon)
    taxBreakdown: {
      // Opbreking van belastingen
      wageTaxBeforeCredits: monthlyWageTaxBeforeCredits, // Bruto loonbelasting (voor kortingen)
      taxCredits: monthlyTaxCredits, // Totale belastingkortingen
      incomeTax: monthlyIncomeTax, // Indicatief voor UI
      socialPremiums: monthlySocialPremiums, // Indicatief voor UI
      totalDeductions: totalMonthlyDeductions // Totale inhouding (loonheffing na kortingen)
    },
    additionalBenefits: {
      // Extra arbeidsvoorwaarden (bovenop netto loon)
      azv: azvVal, // AZV (ook in reserveringen, hier voor overzicht)
      paww: pawwVal, // PAWW (ook in reserveringen, hier voor overzicht)
      totalAdditionalBenefits: totalAdditionalBenefits, // Totale extra voordelen
      holidayDaysEquivalent: holidayDaysEquivalent, // Waarde van vakantie-uren
      holidayAllowance: holidayAllowance, // Vakantiegeld
      yearEndBonus: yearEndBonus, // Eindejaarsuitkering
      ikbContribution: ikbContribution // IKB bijdrage
    }
  };
}