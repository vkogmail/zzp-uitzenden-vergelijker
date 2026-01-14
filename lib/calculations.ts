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
  annualFranchise: number; // Jaarlijkse franchise voor pensioenberekening (standaard €19.554,24)
  employerPensionRate: number; // Werkgeverspensioen percentage (standaard 15.9%)
  employeePensionRate: number; // Werknemerspensioen percentage (standaard 7.5%)
  
  // Andere Fiscale Reserveringen
  // Deze worden voor de belasting afgetrokken van het bruto loon
  azvRate: number; // AZV (Arbeidsongeschiktheidsverzekering) percentage (standaard 0.3%)
  pawwRate: number; // PAWW (Premie Arbeidsongeschiktheidsverzekering Werknemers) percentage (standaard 0.1%)
  
  // Belastingschijven (2026 Nederland)
  // Progressieve belastingschijven voor inkomstenbelasting
  taxBracket1Limit: number; // Eerste schijf limiet (standaard €38.098)
  taxBracket2Limit: number; // Tweede schijf limiet (standaard €75.518)
  taxRate1: number; // Belastingtarief schijf 1 (standaard 36.97%)
  taxRate2: number; // Belastingtarief schijf 2+ (standaard 49.50%)
  socialPremiumRate: number; // Sociale premies percentage (standaard 18.22%)
  
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
  annualFranchise: 19554.24,
  employerPensionRate: 0.159,
  employeePensionRate: 0.075,
  azvRate: 0.003,
  pawwRate: 0.001,
  taxBracket1Limit: 38098,
  taxBracket2Limit: 75518,
  taxRate1: 0.3697,
  taxRate2: 0.4950,
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
  // De franchise is een jaarlijks bedrag dat niet meetelt voor pensioen
  const annualFranchise = config.annualFranchise; // Jaarlijkse franchise (standaard €19.554,24)
  const monthlyFranchise = annualFranchise / 12; // Maandelijkse franchise
  const pensionableWageVal = grossMonthly - monthlyFranchise; // Pensioengevend loon
  
  // Werkgever en werknemer betalen beide een percentage van het pensioengevend loon
  const employerPensionVal = pensionableWageVal * config.employerPensionRate; // Werkgeversdeel
  const employeePensionVal = pensionableWageVal * config.employeePensionRate; // Werknemersdeel
  
  // STAP 5: Andere Fiscale Reserveringen (Voor belasting)
  // Deze worden voor de belasting afgetrokken van het bruto loon
  // AZV = Arbeidsongeschiktheidsverzekering
  // PAWW = Premie Arbeidsongeschiktheidsverzekering Werknemers
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
  // Nederland kent twee belastingschijven met verschillende tarieven
  let annualWageTax = 0;
  const bracket1Limit = config.taxBracket1Limit; // Eerste schijf limiet (€38.098)
  const bracket2Limit = config.taxBracket2Limit; // Tweede schijf limiet (€75.518)
  const rate1 = config.taxRate1; // Tarief eerste schijf (36.97%)
  const rate2 = config.taxRate2; // Tarief tweede schijf (49.50%)
  
  // Progressieve berekening: elk deel van het inkomen wordt belast tegen het juiste tarief
  if (annualTaxableIncome <= bracket1Limit) {
    // Alleen eerste schijf
    annualWageTax = annualTaxableIncome * rate1;
  } else if (annualTaxableIncome <= bracket2Limit) {
    // Eerste schijf vol + deel tweede schijf
    annualWageTax = (bracket1Limit * rate1) + ((annualTaxableIncome - bracket1Limit) * rate1);
  } else {
    // Beide schijven vol + rest tegen hoogste tarief
    annualWageTax = (bracket1Limit * rate1) + ((bracket2Limit - bracket1Limit) * rate1) + ((annualTaxableIncome - bracket2Limit) * rate2);
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
  
  // 7f. Splits loonbelasting in inkomstenbelasting en sociale premies
  // De loonbelasting bestaat uit twee delen: inkomstenbelasting en sociale premies
  const socialPremiumRate = config.socialPremiumRate; // Sociale premies percentage (18.22%)
  const incomeTaxRate = rate1 - socialPremiumRate; // Inkomstenbelasting percentage
  
  // Sociale premies worden berekend over het volledige belastbare inkomen
  const annualSocialPremiums = annualTaxableIncome * socialPremiumRate;
  // Inkomstenbelasting is het restant na sociale premies
  const annualIncomeTax = annualWageTaxAfterCredits - annualSocialPremiums;
  
  // Converteer naar maandelijks
  // Alle jaarlijkse bedragen worden gedeeld door 12 voor maandelijkse weergave
  const monthlyWageTaxBeforeCredits = annualWageTax / 12;
  const monthlyTaxCredits = totalTaxCredits / 12;
  const monthlyWageTaxAfterCredits = annualWageTaxAfterCredits / 12;
  const monthlySocialPremiums = annualSocialPremiums / 12;
  const monthlyIncomeTax = Math.max(0, monthlyWageTaxAfterCredits - monthlySocialPremiums);
  
  // Totale aftrekposten van belastbaar loon
  // Dit is wat er daadwerkelijk wordt ingehouden op het loon
  const totalMonthlyDeductions = monthlyIncomeTax + monthlySocialPremiums;

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
    taxesTotal: totalMonthlyDeductions, // Totale belastingen en premies
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
      paww: pawwVal // Premie Arbeidsongeschiktheidsverzekering Werknemers
    },
    pensionableWage: pensionableWageVal, // Pensioengevend loon (bruto minus franchise)
    employerPension: employerPensionVal, // Werkgeverspensioen (komt bovenop netto loon)
    taxBreakdown: {
      // Opbreking van belastingen
      wageTaxBeforeCredits: monthlyWageTaxBeforeCredits, // Bruto loonbelasting (voor kortingen)
      taxCredits: monthlyTaxCredits, // Totale belastingkortingen
      incomeTax: monthlyIncomeTax, // Inkomstenbelasting
      socialPremiums: monthlySocialPremiums, // Sociale premies
      totalDeductions: totalMonthlyDeductions // Totale aftrekposten
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
