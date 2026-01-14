import BASE_CONFIG from "@/data/presets/current_2025_baseline.json";
import ASSUMPTIONS from "@/data/presets/assumptions_2026.json";

// Active preset configuration (can be updated at runtime from the UI)
let ACTIVE_PRESET: any = BASE_CONFIG;
export function setActivePresetConfig(config: any) {
  ACTIVE_PRESET = config ?? BASE_CONFIG;
}

export function getActivePresetConfig(): any {
  return ACTIVE_PRESET;
}

// Deep merge where override only wins if value is not null/undefined
function mergeWithAssumptions(base: any, override: any): any {
  if (override === null || override === undefined) return base;
  if (Array.isArray(base) && Array.isArray(override)) return override;
  if (typeof base === "object" && base && typeof override === "object" && override) {
    const out: any = Array.isArray(base) ? [] : {};
    const keys = new Set([...Object.keys(base), ...Object.keys(override)]);
    for (const key of keys) {
      const bv = base[key];
      const ov = override[key];
      if (ov === null || ov === undefined) {
        out[key] = bv;
      } else if (typeof bv === "object" && bv && typeof ov === "object") {
        out[key] = mergeWithAssumptions(bv, ov);
      } else {
        out[key] = ov;
      }
    }
    return out;
  }
  return override;
}

function getResolvedConfig(): any {
  // assumptions -> active preset -> baseline (for safety)
  const merged = mergeWithAssumptions(ASSUMPTIONS as any, ACTIVE_PRESET as any);
  return mergeWithAssumptions(merged, BASE_CONFIG as any);
}

// Helper function to calculate derived employer costs percentage from preset
export function getDerivedEmployerCostsPct(preset: any): number | null {
  const cfgEmp = preset?.emp ?? {};
  const cfgEmployer = cfgEmp?.employer ?? {};
  
  // If employerTotalPct is explicitly set, use it
  if (typeof cfgEmployer?.employerTotalPct === "number") {
    return cfgEmployer.employerTotalPct;
  }
  
  // Check if detailed components are available
  const hasDetailedComponents = cfgEmployer?.azvPct != null || cfgEmployer?.zvwPct != null || 
                                 cfgEmployer?.whkWgaPct != null || cfgEmployer?.whkZwFlexPct != null ||
                                 cfgEmployer?.wwPct != null || cfgEmployer?.aofPct != null || cfgEmployer?.wkoPct != null;
  
  if (hasDetailedComponents) {
    // Calculate from detailed components
    let derivedWgPct = [
      cfgEmployer?.azvPct ?? 0,
      cfgEmployer?.zvwPct ?? 0,
      cfgEmployer?.whkWgaPct ?? 0,
      cfgEmployer?.whkZwFlexPct ?? 0,
      cfgEmployer?.wwPct ?? 0,
      cfgEmployer?.aofPct ?? 0,
      cfgEmployer?.wkoPct ?? 0,
      cfgEmployer?.vacationPct ?? 0,
      cfgEmployer?.pensionEmployerPct ?? 0,
      cfgEmployer?.insuranceOtherPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    
    // Add employerOther (sociaal fonds, KV/FD)
    const cfgEmployerOther = cfgEmp?.employerOther ?? {};
    const employerOtherPct = [
      cfgEmployerOther?.sociaalFondsPct ?? 0,
      cfgEmployerOther?.kvFdReserveringPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    derivedWgPct += employerOtherPct;
    
    return derivedWgPct > 0 ? derivedWgPct : null;
  } else {
    // Fallback to aggregated values
    const derivedWgPct = [
      cfgEmployer?.socialPct,
      cfgEmployer?.zvwPct,
      cfgEmployer?.vacationPct,
      cfgEmployer?.pensionEmployerPct,
      cfgEmployer?.insuranceOtherPct
    ]
      .filter((v) => typeof v === "number")
      .reduce((a: number, b: number) => a + b, 0);
    
    return derivedWgPct > 0 ? derivedWgPct : null;
  }
}

export type CalculatorInputs = {
  // Contract and pricing
  clientRateZzp?: number; // rate charged to client for ZZP
  clientRateEmp?: number; // rate charged to client for Detacheren
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
  zvwPremie: number; // Zorgverzekeringswet premie (inkomensafhankelijke bijdrage)
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
  const currentYear = new Date().getFullYear();
  
  // Workable days per year (excluding weekends and Dutch holidays)
  // 2026: 255 days, 2027: 256 days, 2028: 254 days
  let workableDays: number;
  if (currentYear === 2026) {
    workableDays = 255;
  } else if (currentYear === 2027) {
    workableDays = 256;
  } else if (currentYear === 2028) {
    workableDays = 254;
  } else {
    // Default to 2026 values if year is outside range
    workableDays = 255;
  }
  
  // Calculate hours per day assuming 5-day work week
  const hoursPerDay = hoursPerWeek / 5;
  
  // Total workable hours = workable days × hours per day
  return Math.round(workableDays * hoursPerDay);
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
  // Gebruik dezelfde jaaruren als de UI (werkbaar): 52 weken minus 6 dagen
  const theoreticalAnnualHours = getWorkableAnnualHours(hoursPerWeekActual);
  
  // Voor ZZP: rekening houden met onbetaalde vakantie-uren (resolved-config)
  const CFG = getResolvedConfig();
  const paidHoursRatio = CFG?.zzp?.effectiveRateFactor ?? (1 - 0.1087);
  const effectivePaidHours = theoreticalAnnualHours * paidHoursRatio; // Betaalde uren (werkbaar × factor)
  
  const omzet = effectiveRateZzp * effectivePaidHours; // revenue (alleen voor gewerkte uren)
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
  const wwBufferPct = (CFG?.zzp?.wwBufferPct ?? 3) / 100;
  const wwBuffer = omzet * wwBufferPct; // WW buffer/sparen (niet fiscaal)
  
  // Zvw-premie (Zorgverzekeringswet): gebruik preset waarden; val terug op top-level preset.zvw wanneer zzp.zvw* ontbreekt
  const zvwMaxBasis = (CFG?.zzp?.zvwCap ?? (CFG as any)?.zvw?.cap ?? 75860) as number;
  const zvwPercentage = (((CFG?.zzp?.zvwPct ?? (CFG as any)?.zvw?.pct) ?? 5.75) as number) / 100;
  const zvwBasis = Math.min(belastbaarInkomen, zvwMaxBasis);
  const zvwPremie = zvwBasis * zvwPercentage;
  
  // Vakantiegeld basis voor ZZP: top-level vakantiegeldPct → of CAO WG-basis (emp.employer.vacationPct) → anders zzp.vacationReservePctBase
  const vakantiegeldBasePct = (
    ((CFG as any)?.vakantiegeldPct as number | undefined) ??
    ((CFG as any)?.emp?.employer?.vacationPct as number | undefined) ??
    (CFG?.zzp?.vacationReservePctBase ?? 8.33)
  ); // %
  const vakantiegeldEffectiefPct = vakantiegeldBasePct * (1 - effectieveBelastingdruk);
  const vakantiegeld = (omzet - businessCosts - (heeftEchteAovVerzekering ? aov : 0)) * (vakantiegeldEffectiefPct / 100); // vakantiereserve (informatief, niet fiscaal)

  // === Stap 9: Netto resultaat ===
  const winstNaBelasting = winstVoorBelasting - inkomstenbelasting; // for reporting parity
  // Netto = belastbaar inkomen (na aftrekposten) - belasting - WW buffer - Zvw-premie
  // Aftrekposten (zelfstandigenaftrek + MKB-vrijstelling) zijn al afgetrokken in belastbaarInkomen
  // Vakantiegeld blijft beschikbaar voor eigen toekenning en wordt niet apart afgetrokken
  const nettoJaar = belastbaarInkomen - inkomstenbelasting - wwBuffer - zvwPremie;
  const nettoMaand = nettoJaar / 12;

  return {
    omzet,
    winstVoorBelasting,
    belasting: inkomstenbelasting,
    winstNaBelasting,
    vakantiegeld,
    pensioen,
    zvwPremie,
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

  // === NIEUWE BEREKENING VOLGORDE (zoals Publieke Partner model) ===
  
  // Stap 1: Factuurwaarde berekenen (theoretische uren, inclusief vakantiedagen)
  const hoursPerWeekActual = hoursPerWeek && hoursPerWeek > 0 ? hoursPerWeek : 36;
  // Gebruik dezelfde werkbare jaaruren als in de UI voor eerlijke vergelijking
  const theoreticalAnnualHours = getWorkableAnnualHours(hoursPerWeekActual);
  
  const uurtarief = clientRateEmp != null ? clientRateEmp : rate;
  const factuurwaarde = uurtarief * theoreticalAnnualHours; // Totale factuurwaarde
  
  // Stap 2: Fee aftrekken (marge uit inputs; default blijft 15)
  const marginPct = marginEmp != null ? marginEmp : 15;
  const fee = factuurwaarde * toPct(marginPct); // Fee die het bureau houdt
  const totaalBeschikbaar = factuurwaarde - fee; // Beschikbaar voor werkgeverskosten en loon
  
  // Stap 3: Werkgeverskosten berekenen
  // Gebruik bestaande employerTotalPct of leid af uit componenten uit preset
  const CFG = getResolvedConfig();
  const cfgEmp = (CFG as any)?.emp ?? {};
  const cfgEmployer = cfgEmp?.employer ?? {};
  
  // Bereken werkgeverskosten uit gedetailleerde componenten indien beschikbaar
  const hasDetailedComponents = cfgEmployer?.azvPct != null || cfgEmployer?.zvwPct != null || 
                                 cfgEmployer?.whkWgaPct != null || cfgEmployer?.whkZwFlexPct != null ||
                                 cfgEmployer?.wwPct != null || cfgEmployer?.aofPct != null || cfgEmployer?.wkoPct != null;
  
  let derivedWgPct = 0;
  if (hasDetailedComponents) {
    // Gebruik gedetailleerde componenten
    derivedWgPct = [
      cfgEmployer?.azvPct ?? 0,
      cfgEmployer?.zvwPct ?? 0,
      cfgEmployer?.whkWgaPct ?? 0,
      cfgEmployer?.whkZwFlexPct ?? 0,
      cfgEmployer?.wwPct ?? 0,
      cfgEmployer?.aofPct ?? 0,
      cfgEmployer?.wkoPct ?? 0,
      cfgEmployer?.vacationPct ?? 0,
      cfgEmployer?.pensionEmployerPct ?? 0,
      cfgEmployer?.insuranceOtherPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    
    // Voeg employerOther toe (sociaal fonds, KV/FD)
    const cfgEmployerOther = cfgEmp?.employerOther ?? {};
    const employerOtherPct = [
      cfgEmployerOther?.sociaalFondsPct ?? 0,
      cfgEmployerOther?.kvFdReserveringPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    derivedWgPct += employerOtherPct;
  } else {
    // Fallback naar geaggregeerde waarden
    derivedWgPct = [
      cfgEmployer?.socialPct,
      cfgEmployer?.zvwPct,
      cfgEmployer?.vacationPct,
      cfgEmployer?.pensionEmployerPct,
      cfgEmployer?.insuranceOtherPct
    ]
      .filter((v) => typeof v === "number")
      .reduce((a: number, b: number) => a + b, 0);
  }
  
  const baselineWgPct = (cfgEmployer?.employerTotalPct as number | undefined) ?? (derivedWgPct > 0 ? derivedWgPct : 41.6);
  const wgPct = employerTotalPct != null ? employerTotalPct : baselineWgPct;
  const werkgeverskosten = totaalBeschikbaar * toPct(wgPct); // Werkgeverskosten
  
  // Stap 4: Bruto salaris (basis, zonder toeslagen)
  const brutoSalaris = totaalBeschikbaar - werkgeverskosten; // Basis bruto salaris
  
  // Stap 5: Toeslagen bovenop bruto salaris (uit baseline/preset waar beschikbaar)
  const vakantiegeldPct = cfgEmployer?.vacationPct ?? (CFG as any)?.vakantiegeldPct ?? 8.33;
  const bovenwettelijkeVakantiePct = (cfgEmp?.extraOnSalary?.bovenwettelijkeVacationPct ?? 2.18);
  const pawwPct = (cfgEmp?.extraOnSalary?.pawwEmployerPct ?? 0.10);
  
  const vakantiegeldEmp = brutoSalaris * toPct(vakantiegeldPct);
  const bovenwettelijkeVakantie = brutoSalaris * toPct(bovenwettelijkeVakantiePct);
  const pawwWerkgever = brutoSalaris * toPct(pawwPct);
  const ikbPct = (cfgEmp?.ikbPct as number | undefined) ?? ((CFG as any)?.ikbPct as number | undefined) ?? 0;
  const advCompPct = (cfgEmp?.advCompPct as number | undefined) ?? ((CFG as any)?.advCompPct as number | undefined) ?? 0;
  const ikbToeslag = brutoSalaris * toPct(ikbPct);
  const advToeslag = brutoSalaris * toPct(advCompPct);
  
  // Stap 6: Bruto loon (voor belasting) - inclusief alle toeslagen
  const brutoLoon = brutoSalaris + vakantiegeldEmp + bovenwettelijkeVakantie + pawwWerkgever + ikbToeslag + advToeslag;
  
  // Stap 7: Pensioen werknemer berekenen (op bruto salaris, niet op bruto loon)
  const presetPensionEmployeePct = (cfgEmp?.employee?.pensionEmployeePct as number | undefined);
  const pensionEmployeeActual = pensionEmployee ?? (presetPensionEmployeePct != null ? presetPensionEmployeePct : 7.5);
  const pensionBaseActual = pensionBase ?? 90;
  const pensioenWerknemer = brutoSalaris * toPct(pensionBaseActual) * toPct(pensionEmployeeActual);
  
  // Stap 8: Belastbaar bedrag (bruto loon - pensioen werknemer)
  // Pensioen is fiscaal aftrekbaar voor de werknemer
  const belastbaarBedrag = brutoLoon - pensioenWerknemer;
  
  // Stap 9: Loonheffing berekenen
  let algemeneHeffingskorting = 0;
  if (belastbaarBedrag <= 23000) {
    algemeneHeffingskorting = 3100;
  } else if (belastbaarBedrag <= 73031) {
    algemeneHeffingskorting = 3100 * (1 - (belastbaarBedrag - 23000) / 50000);
  }
  
  let arbeidskorting = 0;
  if (belastbaarBedrag <= 40000) {
    arbeidskorting = 4000;
  } else if (belastbaarBedrag < 130000) {
    arbeidskorting = 4000 * (1 - (belastbaarBedrag - 40000) / 90000);
  }
  
  const brutoBelasting = calculateIncomeTax(belastbaarBedrag);
  const loonbelasting = Math.max(0, brutoBelasting - algemeneHeffingskorting - arbeidskorting);
  
  // Stap 10: Werknemersinhoudingen
  const pawwWerknemer = -pawwWerkgever; // PAWW premie werknemer (aftrekbaar, netto effect = 0)
  
  // Stap 11: Netto loon
  const nettoLoon = brutoLoon + pawwWerknemer - pensioenWerknemer - loonbelasting;
  
  // Stap 12: WKR onkostenvergoeding (optioneel, kan worden toegevoegd)
  // In de Publieke Partner breakdown: ~2.62% van werkgeverskosten
  // Dit wordt als vergoeding toegevoegd aan het netto loon
  const wkrOnkostenPct = ((((CFG as any)?.emp?.wkrOnkostenPctOfEmployerCosts ?? 2.62) as number)) / 100;
  const wkrOnkosten = werkgeverskosten * wkrOnkostenPct;
  const teOntvangen = nettoLoon + wkrOnkosten; // Netto + WKR vergoeding
  
  // Voor consistentie met huidige return: gebruik teOntvangen als nettoJaar
  const nettoJaar = teOntvangen;
  const nettoMaand = nettoJaar / 12;
  
  // Bruto uurloon voor display (bruto salaris per uur)
  const brutoUurloon = brutoSalaris / theoreticalAnnualHours;

  return {
    brutoUurloon, // Basis bruto uurloon (bruto salaris per uur)
    brutoJaarloon: brutoLoon, // Volledige bruto loon (met alle toeslagen)
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


