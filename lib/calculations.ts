export type CalculatorInputs = {
  rate: number; // hourly rate paid by client
  weeksZzp: number; // billable weeks per year (ZZP)
  weeksEmp: number; // working weeks per year (employee)
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

export function calculateZzp(inputs: CalculatorInputs): ZzpResult {
  const {
    rate,
    weeksZzp,
    vacation,
    costs,
    taxZzp,
    pensionTotal,
    pensionBase,
  } = inputs;

  const omzet = rate * 40 * weeksZzp;
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

export function calculateEmployee(inputs: CalculatorInputs): EmployeeResult {
  const { rate, weeksEmp, vacation, pensionEmployee, pensionBase } = inputs;

  const brutoUurloon = rate * 0.55;
  const brutoJaarloon = brutoUurloon * 40 * weeksEmp;
  const vakantiegeldEmp = brutoJaarloon * toPct(vacation);
  const pensioenWerknemer = brutoJaarloon * toPct(pensionBase) * toPct(pensionEmployee);
  const loonbelasting = brutoJaarloon * 0.4;
  const nettoJaar = brutoJaarloon - loonbelasting - pensioenWerknemer + vakantiegeldEmp;
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
  rate: 100,
  weeksZzp: 46,
  weeksEmp: 51,
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

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}


