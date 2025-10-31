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

  // === Stap 1: Basisberekening (tarief, omzet, kosten) ===
  const effectiveRateZzp = clientRateZzp != null && marginZzp != null
    ? clientRateZzp * (1 - toPct(marginZzp))
    : rate;
  const hoursPerWeekActual = hoursPerWeek && hoursPerWeek > 0 ? hoursPerWeek : 36;
  const annualHours = getWorkableAnnualHours(hoursPerWeekActual);
  const omzet = effectiveRateZzp * annualHours; // revenue
  const businessCosts = omzet * toPct(costs); // bedrijfskosten
  
  // AOV alleen aftrekbaar bij echte verzekering (voor nu niet aftrekbaar als voorbeeld)
  // TODO: Dit moet een input worden om aan te geven of er een echte AOV verzekering is
  const heeftEchteAovVerzekering = false; // placeholder - moet input worden
  const aov = heeftEchteAovVerzekering ? omzet * 0.065 : 0; // AOV alleen bij echte verzekering

  // === Stap 2: Pensioeninleg (aftrekbaar vóór belasting) ===
  // Pensioen wordt berekend op (omzet - bedrijfskosten - AOV)
  // Maximaal 30% jaarruimte (pensioenplafond)
  const pensionBasePct = toPct(pensionBase);
  const pensionPct = toPct(pensionTotal);
  const pensioenZonderPlafond = (omzet - businessCosts - aov) * pensionBasePct * pensionPct;
  // Pensioenplafond: max 30% van jaarruimte
  const jaarruimteMax = (omzet - businessCosts - aov) * 0.30;
  const pensioen = Math.min(pensioenZonderPlafond, jaarruimteMax);

  // === Stap 3: Winst voor belasting ===
  const winstVoorBelasting = omzet - businessCosts - (heeftEchteAovVerzekering ? aov : 0) - pensioen;

  // === Stap 4: Fiscale winstberekening (ondernemersaftrekken) ===
  const zelfstandigenaftrek = 3360; // Gecorrigeerd naar €3360
  const mkbVrijstellingPct = 0.14;
  const winstNaZelfstandig = Math.max(0, winstVoorBelasting - zelfstandigenaftrek);
  const mkbVrijstelling = winstNaZelfstandig * mkbVrijstellingPct;
  const belastbaarInkomen = Math.max(0, winstNaZelfstandig - mkbVrijstelling);

  // === Stap 5: Box 1 belasting ===
  let brutoBelasting = 0;
  if (belastbaarInkomen <= 73031) {
    brutoBelasting = belastbaarInkomen * 0.3693;
  } else {
    brutoBelasting = 73031 * 0.3693 + (belastbaarInkomen - 73031) * 0.495;
  }

  // === Stap 6: Heffingskortingen ===
  // Algemene heffingskorting
  let algemeneHeffingskorting = 0;
  if (belastbaarInkomen <= 23000) {
    algemeneHeffingskorting = 3100;
  } else if (belastbaarInkomen <= 73031) {
    algemeneHeffingskorting = 3100 * (1 - (belastbaarInkomen - 23000) / 50000);
  }

  // Arbeidskorting
  let arbeidskorting = 0;
  if (belastbaarInkomen <= 40000) {
    arbeidskorting = 4000;
  } else if (belastbaarInkomen < 130000) {
    arbeidskorting = 4000 * (1 - (belastbaarInkomen - 40000) / 90000);
  }

  const inkomstenbelasting = Math.max(0, brutoBelasting - algemeneHeffingskorting - arbeidskorting);

  // === Stap 7: Effectieve belastingdruk berekenen ===
  // Effectieve belastingdruk = inkomstenbelasting / belastbaar inkomen
  const effectieveBelastingdruk = belastbaarInkomen > 0 ? inkomstenbelasting / belastbaarInkomen : 0;

  // === Stap 8: POST-TAX kosten (niet fiscaal aftrekbaar) ===
  // WW-buffer wordt na belasting afgetrokken (al correct)
  const wwBuffer = omzet * 0.03; // 3% van omzet als WW buffer/sparen (niet fiscaal)
  
  // Vakantiegeld: 8.33% met effectieve belastingdruk toegepast
  // Vakantiegeld percentage = 8.33% × (1 - effectieve belastingdruk)
  const vakantiegeldBasePct = 8.33; // Basis percentage
  const vakantiegeldEffectiefPct = vakantiegeldBasePct * (1 - effectieveBelastingdruk);
  const vakantiegeld = (omzet - businessCosts - (heeftEchteAovVerzekering ? aov : 0)) * (vakantiegeldEffectiefPct / 100); // vakantiereserve (niet fiscaal)

  // === Stap 9: Netto resultaat ===
  const winstNaBelasting = winstVoorBelasting - inkomstenbelasting; // for reporting parity
  // Netto = winst voor belasting - belasting - WW buffer - vakantiegeld
  // WW buffer en vakantiegeld worden na belasting afgetrokken
  const nettoJaar = winstVoorBelasting - inkomstenbelasting - wwBuffer - vakantiegeld;
  const nettoMaand = nettoJaar / 12;

  return {
    omzet,
    winstVoorBelasting,
    belasting: inkomstenbelasting,
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
  // Werkgeverslasten per uur = effectief tarief × werkgeverslasten%
  // Bruto uurloon = effectief tarief - werkgeverslasten per uur
  const employerCostsPerHour = effectiveClientToAgency * toPct(wgPct);
  const brutoUurloon = effectiveClientToAgency - employerCostsPerHour;
  const hoursPerWeekActual = hoursPerWeek && hoursPerWeek > 0 ? hoursPerWeek : 36;
  const annualHours = getWorkableAnnualHours(hoursPerWeekActual);
  
  // Jaarloon = bruto uurloon * jaaruren * 1.08 (vakantiegeld inclusief)
  const brutoJaarloon = brutoUurloon * annualHours;
  const jaarLoonMetVakantie = brutoJaarloon * 1.08;
  
  const vakantiegeldEmp = brutoJaarloon * toPct(vacation);
  const pensionEmployeeActual = pensionEmployee ?? 7.5;
  const pensionBaseActual = pensionBase ?? 90;
  const pensioenWerknemer = brutoJaarloon * toPct(pensionBaseActual) * toPct(pensionEmployeeActual);
  
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


