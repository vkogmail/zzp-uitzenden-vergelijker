export type CalculatorInputs = {
  // Contract and pricing
  clientRateZzp?: number; // rate charged to client for ZZP
  clientRateEmp?: number; // rate charged to client for Detachering/Uitzenden
  marginZzp?: number; // % margin withheld before reaching ZZP
  marginEmp?: number; // % margin withheld before reaching employer payroll
  employerTotalPct?: number; // total employer on-costs percentage to derive gross wage
  rate: number; // hourly rate paid by client
  hoursPerWeek?: number; // hours worked per week (same for both ZZP and Employee for fair comparison)
  vacation: number; // % of salary
  costs: number; // % of turnover for business costs
  taxZzp: number; // effective income tax for ZZP
  pensionTotal: number; // employer + employee combined
  pensionEmployer: number; // employer part (for info only)
  pensionEmployee: number; // employee part
  pensionBase: number; // % of wage that counts for pension
};

export type ZzpResult = {
  omzet: number;
  winstVoorBelasting: number;
  belasting: number;
  winstNaBelasting: number;
  vakantiegeld: number;
  pensioen: number;
  nettoJaar: number;
  nettoMaand: number;
};

export type EmployeeResult = {
  brutoUurloon: number;
  brutoJaarloon: number;
  vakantiegeldEmp: number;
  pensioenWerknemer: number;
  loonbelasting: number;
  nettoJaar: number;
  nettoMaand: number;
};

export type ComparisonResult = {
  zzp: ZzpResult;
  emp: EmployeeResult;
  diffMonthly: number; // zzp - emp
  diffPercent: number; // (zzp - emp) / emp
};

const toPct = (value: number) => value / 100;

export function getWorkableAnnualHours(hoursPerWeek: number): number {
  // Formula: (hoursPerWeek * 52) - (6 * (hoursPerWeek / 5))
  // This accounts for 6 holiday days at average hours per day (hoursPerWeek / 5)
  return Math.round((hoursPerWeek * 52) - (6 * (hoursPerWeek / 5)));
}

export function calculateZzp(inputs: CalculatorInputs): ZzpResult {
  const {
    rate,
    hoursPerWeek,
    vacation,
    costs,
    taxZzp,
    pensionTotal,
    pensionBase,
    clientRateZzp,
    marginZzp,
  } = inputs;

  const effectiveRateZzp = clientRateZzp != null && marginZzp != null
    ? clientRateZzp * (1 - toPct(marginZzp))
    : rate;
  // Use same hoursPerWeek for both ZZP and Employee for fair comparison
  const hoursPerWeekActual = hoursPerWeek && hoursPerWeek > 0 ? hoursPerWeek : 36;
  const annualHours = getWorkableAnnualHours(hoursPerWeekActual);
  const omzet = effectiveRateZzp * annualHours;
  const winstVoorBelasting = omzet * (1 - toPct(costs));
  const belasting = winstVoorBelasting * toPct(taxZzp);
  const winstNaBelasting = winstVoorBelasting - belasting;
  const vakantiegeld = omzet * toPct(vacation);
  const pensioen = omzet * toPct(pensionBase) * toPct(pensionTotal);
  const nettoJaar = winstNaBelasting - vakantiegeld - pensioen;
  const nettoMaand = nettoJaar / 12;

  return {
    omzet,
    winstVoorBelasting,
    belasting,
    winstNaBelasting,
    vakantiegeld,
    pensioen,
    nettoJaar,
    nettoMaand,
  };
}

export function calculateIncomeTax(jaarLoon: number): number {
  const schijf1 = 37000;
  const schijf2 = 73031;
  const tarief1 = 0.3693; // 36.93%
  const tarief2 = 0.495;  // 49.5%
  
  // Schijf 1: tot €37.000 → 36.93%
  if (jaarLoon <= schijf1) {
    return jaarLoon * tarief1;
  }
  // Schijf 2: €37.000 - €73.031 → 36.93% (volgens formule)
  else if (jaarLoon <= schijf2) {
    return (schijf1 * tarief1) + ((jaarLoon - schijf1) * tarief1);
  }
  // Schijf 3: boven €73.031 → 49.5%
  else {
    return (schijf1 * tarief1) + ((schijf2 - schijf1) * tarief1) + ((jaarLoon - schijf2) * tarief2);
  }
}

export function calculateEmployee(inputs: CalculatorInputs): EmployeeResult {
  const { rate, vacation, pensionEmployee, pensionBase, clientRateEmp, marginEmp, employerTotalPct, hoursPerWeek } = inputs;

  const effectiveClientToAgency = clientRateEmp != null && marginEmp != null
    ? clientRateEmp * (1 - toPct(marginEmp))
    : rate;
  const wgPct = employerTotalPct != null ? employerTotalPct : 41.6;
  // kostprijs = bruto * (1 + wgPct); dus bruto = kostprijs / (1 + wgPct)
  const brutoUurloon = effectiveClientToAgency / (1 + toPct(wgPct));
  const hoursPerWeekActual = hoursPerWeek && hoursPerWeek > 0 ? hoursPerWeek : 36;
  const annualHours = getWorkableAnnualHours(hoursPerWeekActual);
  
  // Jaarloon = bruto uurloon * jaaruren * 1.08 (vakantiegeld inclusief)
  const brutoJaarloon = brutoUurloon * annualHours;
  const jaarLoonMetVakantie = brutoJaarloon * 1.08;
  
  const vakantiegeldEmp = brutoJaarloon * toPct(vacation);
  const pensioenWerknemer = brutoJaarloon * toPct(pensionBase) * toPct(pensionEmployee);
  
  // Pensioen is aftrekbaar voor belasting (belastbaar = jaarloon met vakantie - pensioen)
  const belastbaarBedrag = jaarLoonMetVakantie - pensioenWerknemer;
  const loonbelasting = calculateIncomeTax(belastbaarBedrag);
  
  const nettoJaar = jaarLoonMetVakantie - loonbelasting - pensioenWerknemer;
  const nettoMaand = nettoJaar / 12;

  return {
    brutoUurloon,
    brutoJaarloon,
    vakantiegeldEmp,
    pensioenWerknemer,
    loonbelasting,
    nettoJaar,
    nettoMaand,
  };
}

export function calculateAll(inputs: CalculatorInputs): ComparisonResult {
  const zzp = calculateZzp(inputs);
  const emp = calculateEmployee(inputs);
  const diffMonthly = zzp.nettoMaand - emp.nettoMaand;
  const diffPercent = emp.nettoMaand === 0 ? 0 : diffMonthly / emp.nettoMaand;
  return { zzp, emp, diffMonthly, diffPercent };
}

export const defaultInputs: CalculatorInputs = {
  clientRateZzp: 111,
  clientRateEmp: 118,
  marginZzp: 10,
  marginEmp: 15,
  employerTotalPct: 41.6,
  rate: 100,
  hoursPerWeek: 36,
  vacation: 8,
  costs: 10,
  taxZzp: 36,
  pensionTotal: 20.0, // Adjusted to match "20% pensioen" from new spec
  pensionEmployer: 15.9,
  pensionEmployee: 7.5,
  pensionBase: 90,
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
    value,
  );
}

export function formatCurrencyWithDecimals(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(
    value,
  );
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}


