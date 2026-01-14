// ============================================================================
// FigmaMake Calculator Configuration Interface
// ============================================================================

export interface CalculatorConfig {
  // Margin & Company
  companyMarginTotal: number; // Total margin percentage (default 15%)
  companyMarginProfit: number; // Profit portion (default 5%)
  companyMarginCosts: number; // Costs portion (default 10%)
  
  // Conversion Factor
  conversionFactor: number; // Candidate rate to gross hourly conversion (default 1.9776)
  
  // Pension (StiPP-style)
  annualFranchise: number; // Annual franchise amount (default 19554.24)
  employerPensionRate: number; // Employer pension % (default 15.9%)
  employeePensionRate: number; // Employee pension % (default 7.5%)
  
  // Other Reservations
  azvRate: number; // AZV percentage (default 0.3%)
  pawwRate: number; // PAWW percentage (default 0.1%)
  
  // Tax Brackets (2026 NL)
  taxBracket1Limit: number; // First bracket limit (default 38098)
  taxBracket2Limit: number; // Second bracket limit (default 75518)
  taxRate1: number; // Rate for bracket 1 (default 36.97%)
  taxRate2: number; // Rate for bracket 2+ (default 49.50%)
  socialPremiumRate: number; // Social premiums portion (default 18.22%)
  
  // Tax Credits
  arbeidsKortingMax: number; // Max work credit (default 5052)
  arbeidsKortingPhaseInEnd: number; // Phase-in end (default 11000)
  arbeidsKortingPhaseOutStart: number; // Phase-out start (default 24000)
  arbeidsKortingPhaseOutEnd: number; // Phase-out end (default 115000)
  algemeenHeffingsKortingMax: number; // Max general credit (default 3362)
  algemeenHeffingsKortingPhaseOutStart: number; // Phase-out start (default 24000)
  algemeenHeffingsKortingPhaseOutEnd: number; // Phase-out end (default 75000)
  
  // Additional Benefits (CAO-specific)
  holidayHoursRate: number; // Vacation hours % (default 10.92%)
  holidayAllowanceRate: number; // Vacation money % (default 8%)
  yearEndBonusRate: number; // Year-end bonus % (default 4.5%)
  ikbRate: number; // IKB % (default 1.8%)
  
  // CAO Settings - Toggle for optional items
  hasAZV: boolean; // Whether AZV applies
  hasPAWW: boolean; // Whether PAWW applies
  hasYearEndBonus: boolean; // Whether year-end bonus applies
  hasIKB: boolean; // Whether IKB applies
}

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
// FigmaMake Detailed Employee Calculation
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

export function calculateEmployeeDetailed(
  hourlyRate: number,
  hoursPerWeek: number,
  config: CalculatorConfig = defaultCalculatorConfig
): FigmaMakeEmployeeResult {
  // Constants
  const MONTHLY_HOURS = hoursPerWeek * (52 / 12);
  
  // STEP 1: Client -> Candidate
  const clientRate = hourlyRate;
  const clientMonthly = clientRate * MONTHLY_HOURS;
  
  const marginPct = config.companyMarginTotal;
  const marginMonthly = clientMonthly * marginPct;
  const candidateMonthly = clientMonthly - marginMonthly;

  // STEP 2: Candidate -> Gross Hourly
  const candidateRate = clientRate * (1 - marginPct);
  const conversionFactor = config.conversionFactor;
  const grossHourly = candidateRate / conversionFactor;

  // STEP 3: Gross Hourly -> Gross Monthly
  const grossMonthly = grossHourly * MONTHLY_HOURS;

  // STEP 4: Pension Calculation (StiPP-style)
  const annualFranchise = config.annualFranchise;
  const monthlyFranchise = annualFranchise / 12;
  const pensionableWageVal = grossMonthly - monthlyFranchise;
  
  const employerPensionVal = pensionableWageVal * config.employerPensionRate;
  const employeePensionVal = pensionableWageVal * config.employeePensionRate;
  
  // STEP 5: Other Fiscal Reservations (Pre-tax)
  const azvVal = config.hasAZV ? grossMonthly * config.azvRate : 0;
  const pawwVal = config.hasPAWW ? grossMonthly * config.pawwRate : 0;
  const reservationsMonthly = employeePensionVal + azvVal + pawwVal;

  // STEP 6: Taxable Wage Base
  const taxableMonthly = grossMonthly - reservationsMonthly;

  // STEP 7: Dutch Payroll Tax Calculation (2026)
  const annualTaxableIncome = taxableMonthly * 12;
  
  // 7a. Calculate gross wage tax using progressive brackets
  let annualWageTax = 0;
  const bracket1Limit = config.taxBracket1Limit;
  const bracket2Limit = config.taxBracket2Limit;
  const rate1 = config.taxRate1;
  const rate2 = config.taxRate2;
  
  if (annualTaxableIncome <= bracket1Limit) {
    annualWageTax = annualTaxableIncome * rate1;
  } else if (annualTaxableIncome <= bracket2Limit) {
    annualWageTax = (bracket1Limit * rate1) + ((annualTaxableIncome - bracket1Limit) * rate1);
  } else {
    annualWageTax = (bracket1Limit * rate1) + ((bracket2Limit - bracket1Limit) * rate1) + ((annualTaxableIncome - bracket2Limit) * rate2);
  }
  
  // 7b. Calculate Arbeidskorting (work credit)
  let arbeidskorting = 0;
  const akMax = config.arbeidsKortingMax;
  const akPhaseInEnd = config.arbeidsKortingPhaseInEnd;
  const akPhaseOutStart = config.arbeidsKortingPhaseOutStart;
  const akPhaseOutEnd = config.arbeidsKortingPhaseOutEnd;
  
  if (annualTaxableIncome <= akPhaseInEnd) {
    arbeidskorting = annualTaxableIncome * 0.08425;
  } else if (annualTaxableIncome <= akPhaseOutStart) {
    arbeidskorting = akMax;
  } else if (annualTaxableIncome <= akPhaseOutEnd) {
    const phaseOutRate = akMax / (akPhaseOutEnd - akPhaseOutStart);
    arbeidskorting = akMax - ((annualTaxableIncome - akPhaseOutStart) * phaseOutRate);
  } else {
    arbeidskorting = 0;
  }
  arbeidskorting = Math.max(0, arbeidskorting);
  
  // 7c. Calculate Algemene heffingskorting (general tax credit)
  let algemeenHeffingskorting = 0;
  const ahkMax = config.algemeenHeffingsKortingMax;
  const ahkPhaseOutStart = config.algemeenHeffingsKortingPhaseOutStart;
  const ahkPhaseOutEnd = config.algemeenHeffingsKortingPhaseOutEnd;
  
  if (annualTaxableIncome <= ahkPhaseOutStart) {
    algemeenHeffingskorting = ahkMax;
  } else if (annualTaxableIncome <= ahkPhaseOutEnd) {
    const phaseOutRate = ahkMax / (ahkPhaseOutEnd - ahkPhaseOutStart);
    algemeenHeffingskorting = ahkMax - ((annualTaxableIncome - ahkPhaseOutStart) * phaseOutRate);
  } else {
    algemeenHeffingskorting = 0;
  }
  algemeenHeffingskorting = Math.max(0, algemeenHeffingskorting);
  
  // 7d. Total tax credits
  const totalTaxCredits = arbeidskorting + algemeenHeffingskorting;
  
  // 7e. Wage tax after credits
  const annualWageTaxAfterCredits = Math.max(0, annualWageTax - totalTaxCredits);
  
  // 7f. Split wage tax into income tax and social premiums
  const socialPremiumRate = config.socialPremiumRate;
  const incomeTaxRate = rate1 - socialPremiumRate;
  
  const annualSocialPremiums = annualTaxableIncome * socialPremiumRate;
  const annualIncomeTax = annualWageTaxAfterCredits - annualSocialPremiums;
  
  // Convert to monthly
  const monthlyWageTaxBeforeCredits = annualWageTax / 12;
  const monthlyTaxCredits = totalTaxCredits / 12;
  const monthlyWageTaxAfterCredits = annualWageTaxAfterCredits / 12;
  const monthlySocialPremiums = annualSocialPremiums / 12;
  const monthlyIncomeTax = Math.max(0, monthlyWageTaxAfterCredits - monthlySocialPremiums);
  
  // Total deductions from taxable wage
  const totalMonthlyDeductions = monthlyIncomeTax + monthlySocialPremiums;

  // Net Result
  const netMonthly = taxableMonthly - totalMonthlyDeductions;

  // STEP 8: Additional Benefits (calculated after net is known) - CAO specific
  const holidayHours = MONTHLY_HOURS * config.holidayHoursRate;
  const netHourlyRate = netMonthly / MONTHLY_HOURS;
  const holidayDaysEquivalent = holidayHours * netHourlyRate;
  const holidayAllowance = grossMonthly * config.holidayAllowanceRate;
  const yearEndBonus = config.hasYearEndBonus ? grossMonthly * config.yearEndBonusRate : 0;
  const ikbContribution = config.hasIKB ? grossMonthly * config.ikbRate : 0;
  const totalAdditionalBenefits = holidayDaysEquivalent + holidayAllowance + yearEndBonus + ikbContribution;

  return {
    // Totals
    clientTotal: clientMonthly,
    companyTotal: marginMonthly,
    candidateTotal: candidateMonthly,
    grossTotal: grossMonthly,
    reservationsTotal: reservationsMonthly,
    taxableTotal: taxableMonthly,
    taxesTotal: totalMonthlyDeductions,
    netTotal: netMonthly,
    monthlyHours: MONTHLY_HOURS,
    
    // Breakdowns
    marginBreakdown: {
      admin: marginMonthly * (config.companyMarginCosts / config.companyMarginTotal),
      profit: marginMonthly * (config.companyMarginProfit / config.companyMarginTotal)
    },
    reservationBreakdown: {
      employeePension: employeePensionVal,
      azv: azvVal,
      paww: pawwVal
    },
    pensionableWage: pensionableWageVal,
    employerPension: employerPensionVal,
    taxBreakdown: {
      wageTaxBeforeCredits: monthlyWageTaxBeforeCredits,
      taxCredits: monthlyTaxCredits,
      incomeTax: monthlyIncomeTax,
      socialPremiums: monthlySocialPremiums,
      totalDeductions: totalMonthlyDeductions
    },
    additionalBenefits: {
      azv: azvVal,
      paww: pawwVal,
      totalAdditionalBenefits: totalAdditionalBenefits,
      holidayDaysEquivalent: holidayDaysEquivalent,
      holidayAllowance: holidayAllowance,
      yearEndBonus: yearEndBonus,
      ikbContribution: ikbContribution
    }
  };
}
