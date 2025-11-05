"use client";

import { ChangeEvent, useState } from "react";
import { formatCurrency, formatCurrencyWithDecimals, getWorkableAnnualHours, calculateIncomeTax, calculateZzp, calculateEmployee, getActivePresetConfig } from "@/lib/calculations";

type TabType = "zzp" | "uitzenden";

type NumericKey =
  | "rate"
  | "vacation"
  | "costs"
  | "taxZzp"
  | "pensionTotal"
  | "pensionEmployer"
  | "pensionEmployee"
  | "pensionBase";

export type CalculatorProps = {
  values: Record<NumericKey, number>;
  onChange: (key: NumericKey, value: number) => void;
};

function NumberField({
  label,
  suffix,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  suffix?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value));
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white shadow-sm border border-gray-100">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handle}
          className="w-full accent-[#00B37E]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={handle}
          className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right"
        />
        {suffix ? <span className="text-gray-500 w-10 text-sm">{suffix}</span> : null}
      </div>
    </div>
  );
}

export default function Calculator({ values, onChange }: CalculatorProps) {
  const preset = getActivePresetConfig() as any;
  const clientRateZzp = (values as any).clientRateZzp ?? values.rate;
  const clientRateEmp = (values as any).clientRateEmp ?? values.rate;
  const marginZzp = (values as any).marginZzp ?? 0;
  const marginEmp = (values as any).marginEmp ?? 0;
  const effectiveRateZzp = clientRateZzp * (1 - marginZzp / 100);
  const effectiveRateEmp = clientRateEmp * (1 - marginEmp / 100);
  // Werkgeverslasten (vaste componenten volgens specificatie)
  // Basis werkgeverslasten (41.6%):
  const wgSocial = preset?.emp?.employer?.socialPct ?? 11.0; // Sociale premies (WW, WIA, ZW)
  const wgZvw = preset?.emp?.employer?.zvwPct ?? 6.75; // Zorgverzekeringswet heffing (werkgeversheffing Zvw)
  const wgVacation = preset?.emp?.employer?.vacationPct ?? preset?.vakantiegeldPct ?? 8.33; // Vakantiegeld (wettelijk)
  const wgPensionEmployer = preset?.emp?.employer?.pensionEmployerPct ?? 14.31; // Pensioen werkgeversdeel
  const wgInsurance = preset?.emp?.employer?.insuranceOtherPct ?? 1.21; // Overige verzekeringen (aangepast voor Zvw)
  
  // Toeslagen bovenop bruto salaris (deze komen bovenop de basis werkgeverslasten):
  const wgBovenwettelijkeVakantie = preset?.emp?.extraOnSalary?.bovenwettelijkeVacationPct ?? 2.18; // Bovenwettelijke vakantiedagen
  const wgPaww = preset?.emp?.extraOnSalary?.pawwEmployerPct ?? 0.10; // PAWW (werkgever)
  const ikbPctDisplay = preset?.emp?.ikbPct ?? preset?.ikbPct ?? 0;
  const advCompPctDisplay = preset?.emp?.advCompPct ?? preset?.advCompPct ?? 0;
  
  // Basis werkgeverslasten som - berekend dynamisch voor accurate weergave
  const werkgeverslastenBasisSom = wgSocial + wgZvw + wgVacation + wgPensionEmployer + wgInsurance; // Dynamisch berekend
  
  // Totaal werkgeverslasten inclusief toeslagen
  // Let op: bovenwettelijke vakantie en PAWW zijn percentages van bruto salaris,
  // maar moeten meegenomen worden in de totale kosten. De effectieve percentage 
  // op totaal beschikbaar is ongeveer: basis + (toeslagen × (1 - basis%))
  // Voor nauwkeurigheid gebruiken we de berekening uit calculateEmployee
  const employerTotal = (values as any).employerTotalPct ?? (preset?.emp?.employer?.employerTotalPct ?? 41.6); // Basis percentage
  const employerTotalFraction = employerTotal / 100;
  
  // Calculate annual hours based on hours per week
  const hoursPerWeekInput = (values as any).hoursPerWeek ?? 36;
  const theoreticalAnnualHours = hoursPerWeekInput * 52; // Theoretische uren (Uitzenden: inclusief betaalde vakantie)
  
  // Voor ZZP: werkbare jaaruren (zelfde als UI-teller) en betaalde uren (10.87% onbetaalde vakantie)
  const workableAnnualHours = getWorkableAnnualHours(hoursPerWeekInput);
  const unpaidVacationPercentage = 0.1087;
  const paidHoursRatio = 1 - unpaidVacationPercentage; // 89.13%
  const zzpPaidHours = workableAnnualHours * paidHoursRatio; // Betaalde uren voor ZZP
  const vacationHours = workableAnnualHours * unpaidVacationPercentage;
  
  // Voor Uitzenden: gebruik ook werkbare jaaruren voor eerlijke vergelijking
  const empAnnualHours = getWorkableAnnualHours(hoursPerWeekInput);
  
  // Use calculateEmployee for consistent calculations (includes fix for vacation pay double-counting)
  const empCalc = calculateEmployee(values as any);
  const brutoUurloonEmp = empCalc.brutoUurloon;
  const brutoJaarloon = empCalc.brutoJaarloon; // This is already WITH vacation pay included
  const vacationPct = values.vacation ?? 8;
  const pensionEmployee = (values as any).pensionEmployee ?? 7.5;
  const pensionBase = values.pensionBase ?? 90;
  
  // Calculate bruto salaris (basis, zonder toeslagen) voor berekening van percentages
  // Dit is nodig om de toeslagen percentages te kunnen tonen
  const brutoSalarisJaar = brutoUurloonEmp * empAnnualHours;
  
  // Calculate vacation pay amount (for display purposes)
  // Note: vacation pay is already included in brutoJaarloon, so we calculate it separately for display
  const brutoJaarloonZonderVakantie = brutoUurloonEmp * empAnnualHours;
  const vakantiegeldBedrag = empCalc.vakantiegeldEmp;
  
  // Bovenwettelijke vakantiedagen en PAWW (zoals in calculateEmployee)
  const bovenwettelijkeVakantiePct = 2.18; // 2.18% bovenwettelijke vakantiedagen
  const pawwPct = 0.10; // 0.10% PAWW
  const bovenwettelijkeVakantieBedrag = brutoSalarisJaar * (bovenwettelijkeVakantiePct / 100);
  const pawwBedrag = brutoSalarisJaar * (pawwPct / 100);
  
  // Bereken totale werkgeverskosten inclusief bovenwettelijke vakantie en PAWW
  // Deze worden berekend als percentage van bruto salaris, maar moeten weergegeven worden
  // Basis werkgeverskosten = 41.6% van totaal beschikbaar
  // Extra kosten = (2.18% + 0.10%) van bruto salaris = 2.28% van bruto salaris
  // Bruto salaris = totaal beschikbaar × (1 - 0.416) = totaal beschikbaar × 0.584
  // Extra kosten als % van totaal beschikbaar = 2.28% × 0.584 = 1.33%
  // Totaal werkgeverskosten = 41.6% + 1.33% = 42.93% van totaal beschikbaar
  const extraKostenPctVanBrutoSalaris = bovenwettelijkeVakantiePct + pawwPct; // 2.28%
  const brutoSalarisRatio = 1 - (employerTotal / 100); // 0.584 (als employerTotal = 41.6%)
  const extraKostenPctVanTotaalBeschikbaar = extraKostenPctVanBrutoSalaris * brutoSalarisRatio; // ~1.33%
  const totaleWerkgeverskostenPct = employerTotal + extraKostenPctVanTotaalBeschikbaar; // ~42.93%
  
  // WKR onkostenvergoeding (2.62% van werkgeverskosten)
  // Dit wordt berekend in calculateEmployee en toegevoegd aan netto loon
  const wkrOnkostenPct = 0.0262; // 2.62% van werkgeverskosten
  // Bereken werkgeverskosten bedrag voor WKR berekening
  const factuurwaardeEmp = clientRateEmp * empAnnualHours;
  const feeEmp = factuurwaardeEmp * (marginEmp / 100);
  const totaalBeschikbaarEmp = factuurwaardeEmp - feeEmp;
  const werkgeverskostenBedrag = totaalBeschikbaarEmp * (employerTotal / 100);
  const wkrOnkostenBedrag = werkgeverskostenBedrag * wkrOnkostenPct;
  const wkrOnkostenPctVanTotaalBeschikbaar = (wkrOnkostenBedrag / totaalBeschikbaarEmp) * 100;
  const pensioenWerknemer = empCalc.pensioenWerknemer;
  const loonbelasting = empCalc.loonbelasting;
  const nettoJaar = empCalc.nettoJaar;
  const nettoUurloon = nettoJaar / empAnnualHours;
  const nettoMaand = empCalc.nettoMaand;
  
  // For display: employer costs per hour
  const employerCostsPerHour = effectiveRateEmp * employerTotalFraction;
  
  // ZZP netto uit lib-berekening (zelfde inputs)
  const zzpCalc = calculateZzp(values as any);
  
  // Bereken alle tussenstappen voor ZZP breakdown (gebruik bestaande variabelen waar mogelijk)
  const costsPct = values.costs ?? 10;
  const pensionTotalPct = values.pensionTotal ?? 20;
  const pensionBasePct = pensionBase; // gebruik bestaande variabele
  
  // Tussenstappen berekenen (volgens nieuwe logica - gebruik betaalde uren voor ZZP)
  const omzet = effectiveRateZzp * zzpPaidHours;
  const bedrijfskosten = omzet * (costsPct / 100);
  
  // AOV alleen aftrekbaar bij echte verzekering
  const heeftEchteAovVerzekering = false; // TODO: moet input worden
  const aov = heeftEchteAovVerzekering ? omzet * 0.065 : 0;
  
  // Pensioen wordt berekend op (omzet - bedrijfskosten - AOV) met plafond van 30% jaarruimte
  const pensioenZonderPlafond = (omzet - bedrijfskosten - aov) * (pensionBasePct / 100) * (pensionTotalPct / 100);
  const jaarruimteMax = (omzet - bedrijfskosten - aov) * 0.30;
  const pensioen = Math.min(pensioenZonderPlafond, jaarruimteMax);
  
  // Winst voor belasting = omzet - bedrijfskosten - AOV (alleen bij echte verzekering) - pensioen
  const winstVoorBelasting = omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0) - pensioen;
  
  // Ondernemersaftrekken
  const zelfstandigenaftrek = 3360; // Gecorrigeerd naar €3360
  const winstNaZelfstandig = Math.max(0, winstVoorBelasting - zelfstandigenaftrek);
  const mkbVrijstelling = winstNaZelfstandig * 0.14;
  const belastbaarInkomen = Math.max(0, winstNaZelfstandig - mkbVrijstelling);
  
  // Belasting berekening
  let brutoBelasting = 0;
  if (belastbaarInkomen <= 73031) {
    brutoBelasting = belastbaarInkomen * 0.3693;
  } else {
    brutoBelasting = 73031 * 0.3693 + (belastbaarInkomen - 73031) * 0.495;
  }
  
  // Heffingskortingen
  let algemeneHeffingskorting = 0;
  if (belastbaarInkomen <= 23000) {
    algemeneHeffingskorting = 3100;
  } else if (belastbaarInkomen <= 73031) {
    algemeneHeffingskorting = 3100 * (1 - (belastbaarInkomen - 23000) / 50000);
  }
  
  let arbeidskorting = 0;
  if (belastbaarInkomen <= 40000) {
    arbeidskorting = 4000;
  } else if (belastbaarInkomen < 130000) {
    arbeidskorting = 4000 * (1 - (belastbaarInkomen - 40000) / 90000);
  }
  
  const inkomstenbelasting = Math.max(0, brutoBelasting - algemeneHeffingskorting - arbeidskorting);
  
  // Effectieve belastingdruk berekenen
  const effectieveBelastingdruk = belastbaarInkomen > 0 ? inkomstenbelasting / belastbaarInkomen : 0;
  
  // POST-TAX kosten (niet fiscaal aftrekbaar)
  // WW-buffer wordt na belasting afgetrokken
  const wwBuffer = omzet * 0.03; // 3% van omzet als WW buffer/sparen
  // Zvw-premie gebruiken uit de berekening
  const zvwPremie = zzpCalc.zvwPremie;
  // Vakantiegeld: 8.33% met effectieve belastingdruk toegepast
  const vakantiegeldBasePct = 8.33; // Basis percentage
  const vakantiegeldEffectiefPct = vakantiegeldBasePct * (1 - effectieveBelastingdruk);
  const vakantiegeld = (omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0)) * (vakantiegeldEffectiefPct / 100); // vakantiereserve
  
  // Netto = winst voor belasting - belasting - WW buffer - Zvw-premie - vakantiegeld
  const nettoJaarBerekend = winstVoorBelasting - inkomstenbelasting - wwBuffer - zvwPremie - vakantiegeld;
  const nettoUurloonZzp = nettoJaarBerekend / zzpPaidHours;
  
  const [showZzpBreakdown, setShowZzpBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("zzp");
  
  return (
    <div>
      {/* Tab Navigation - Mobile Only */}
      <div className="mb-4 flex gap-2 bg-gray-100 p-1 rounded-lg md:hidden">
        <button
          onClick={() => setActiveTab("zzp")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "zzp"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ZZP
        </button>
        <button
          onClick={() => setActiveTab("uitzenden")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "uitzenden"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Uitzenden
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-4">
        <div className="md:row-start-1 hidden md:block">
          <h2 className="text-sm font-semibold text-gray-700">ZZP</h2>
        </div>
        <div className="md:col-start-2 md:row-start-1 hidden md:block">
          <h2 className="text-sm font-semibold text-gray-700">Uitzenden</h2>
        </div>
      
      {/* ZZP Cards Column */}
      <div className={`md:contents ${activeTab !== "zzp" ? "hidden md:block" : ""}`}>
        {/* Marge ZZP */}
        <div className="md:col-start-1 md:row-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm text-gray-600">Marge ZZP (ingehouden %)</label>
          <div className="group relative">
            <svg className="w-4 h-4 cursor-help text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal">
              {(marginZzp > 0 && marginEmp > 0 && Math.abs(marginZzp - marginEmp) > 1) && (
                <div className="mb-2 pb-2 border-b border-gray-600">
                  ⚠️ Let op: Marges verschillen ({marginZzp.toFixed(1)}% vs {marginEmp.toFixed(1)}%). Dit beïnvloedt de vergelijking.
                </div>
              )}
              Percentage dat wordt ingehouden door tussenpartij voordat het tarief aan de ZZP'er wordt doorbetaald.
            </div>
          </div>
        </div>
          <div className="text-lg font-semibold text-gray-900">
            {(values as any).marginZzp ?? 0}%
          </div>
        </div>
        
        {/* Klanttarief ZZP — verwijderd op verzoek */}
        
        {/* ZZP opbouw */}
        <div className="md:col-start-1 md:row-start-4 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">ZZP opbouw (van omzet)</p>
        
        {/* Summary Section */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Voor belasting:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between"><span>• Bedrijfskosten</span><span>{costsPct.toFixed(1)}%</span></li>
            {heeftEchteAovVerzekering && (
              <li className="flex justify-between"><span>• AOV</span><span>6.5%</span></li>
            )}
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>• Pensioen totaal (grondslag {pensionBasePct}%, max 30% jaarruimte)</span>
                <div className="group relative">
                  <svg className="w-4 h-4 cursor-help text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal">
                    {Math.abs(pensionTotalPct - (pensionEmployee + wgPensionEmployer)) > 1 && (
                      <div className="mb-2 pb-2 border-b border-gray-600">
                        ⚠️ Let op: ZZP pensioen = {pensionTotalPct.toFixed(1)}% vs Uitzenden = {(pensionEmployee + wgPensionEmployer).toFixed(2)}%. Dit beïnvloedt de vergelijking.
                      </div>
                    )}
                    Pensioenpremie voor ZZP'ers. Berekenen op grondslag van {pensionBasePct}% van de winst, met een maximum van 30% jaarruimte. Het totaal percentage ({pensionTotalPct.toFixed(1)}%) verschilt mogelijk van uitzenden omdat je als ZZP'er zelf kunt kiezen hoeveel je inlegt.
                  </div>
                </div>
              </div>
              <span>{pensionTotalPct.toFixed(1)}%</span>
            </li>
            <li className="flex justify-between text-xs text-gray-500 pl-4">
              <span>→ Effectief: {((pensionBasePct * pensionTotalPct) / 100).toFixed(1)}% van winst</span>
              <span>vs Uitzenden: {(pensionEmployee + wgPensionEmployer).toFixed(2)}% totaal</span>
            </li>
          </ul>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Na belasting (reserves, aanbevolen):</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between"><span>• Zvw-premie (verplicht)</span><span>5.75%</span></li>
            <li className="flex justify-between"><span>• WW-buffer (reserve, niet verplicht)</span><span>3.0%</span></li>
            <li className="flex justify-between"><span>• Vakantiegeld reserve (8.33% × {((1 - effectieveBelastingdruk) * 100).toFixed(1)}%), niet verplicht</span><span>{vakantiegeldEffectiefPct.toFixed(2)}%</span></li>
          </ul>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Zelfstandigenaftrek</span>
            <span>{formatCurrency(zelfstandigenaftrek)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>MKB-vrijstelling</span>
            <span>14%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Belasting (box 1)</span>
            <span>36.93% / 49.5%</span>
          </div>
        </div>
        <button
          onClick={() => setShowZzpBreakdown(!showZzpBreakdown)}
          className="mt-3 w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
        >
          <span>{showZzpBreakdown ? "Verberg detail" : "Meer detail"}</span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${showZzpBreakdown ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showZzpBreakdown && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Effectieve rate ZZP</span>
              <span className="font-semibold">{formatCurrencyWithDecimals(effectiveRateZzp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">× Betaalde uren ({zzpPaidHours.toLocaleString("nl-NL")} uur = werkbare jaaruren − vakantie‑uren [{workableAnnualHours.toLocaleString("nl-NL")} − {Math.round(vacationHours).toLocaleString("nl-NL")}])</span>
              <span className="text-gray-500">= {formatCurrency(omzet)}</span>
            </div>
            <div className="flex justify-between text-gray-700 pl-4">
              <span>Omzet (jaar)</span>
              <span className="font-medium">{formatCurrency(omzet)}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 font-medium mb-2">Voor belasting:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">− Bedrijfskosten ({costsPct}%)</span>
                  <span className="text-gray-500">{formatCurrency(bedrijfskosten)}</span>
                </div>
                {heeftEchteAovVerzekering && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">− AOV (6.5% van omzet)</span>
                    <span className="text-gray-500">{formatCurrency(aov)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">− Pensioen ({pensionBasePct}% × {pensionTotalPct}%, max 30% jaarruimte)</span>
                  <span className="text-gray-500">{formatCurrency(pensioen)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pl-4 pt-1">
                  <span>Winst voor belasting</span>
                  <span className="font-medium">{formatCurrency(winstVoorBelasting)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">− Zelfstandigenaftrek</span>
                  <span className="text-gray-500">{formatCurrency(zelfstandigenaftrek)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pl-4">
                  <span>Winst na zelfstandigenaftrek</span>
                  <span className="font-medium">{formatCurrency(winstNaZelfstandig)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− MKB-vrijstelling (14%)</span>
                  <span className="text-gray-500">{formatCurrency(mkbVrijstelling)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pl-4">
                  <span>Belastbaar inkomen</span>
                  <span className="font-medium">{formatCurrency(belastbaarInkomen)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bruto belasting</span>
                  <span className="text-gray-500">{formatCurrency(brutoBelasting)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− Algemene heffingskorting</span>
                  <span className="text-gray-500">{formatCurrency(algemeneHeffingskorting)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− Arbeidskorting</span>
                  <span className="text-gray-500">{formatCurrency(arbeidskorting)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pl-4 pt-1">
                  <span>Inkomstenbelasting</span>
                  <span className="font-medium">{formatCurrency(inkomstenbelasting)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pl-4">
                  <span>Winst na belasting</span>
                  <span className="font-medium">{formatCurrency(winstVoorBelasting - inkomstenbelasting)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-gray-500 font-medium mb-2">Na belasting (reserves, aanbevolen):</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">− Zvw-premie (verplicht: 5.75% van belastbaar inkomen, max €75.860)</span>
                  <span className="text-gray-500">{formatCurrency(zvwPremie)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− WW-buffer (reserve, niet verplicht: 3% van omzet)</span>
                  <span className="text-gray-500">{formatCurrency(wwBuffer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− Vakantiegeld reserve (niet verplicht: {vakantiegeldEffectiefPct.toFixed(2)}% = 8.33% × {((1 - effectieveBelastingdruk) * 100).toFixed(1)}%)</span>
                  <span className="text-gray-500">{formatCurrency(vakantiegeld)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-700 font-semibold">Netto per jaar</span>
                  <span className="font-bold">{formatCurrency(nettoJaarBerekend)}</span>
                </div>
                <div className="flex justify-between pb-0 mb-0">
                  <span className="text-gray-600">÷ 12 maanden</span>
                  <span className="text-gray-500">= {formatCurrencyWithDecimals(nettoJaarBerekend / 12)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
        
        {/* Netto uurloon ZZP */}
        <div className="md:col-start-1 md:row-start-6 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Netto uurloon (ZZP)</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(nettoUurloonZzp)}</span>
            <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(nettoJaarBerekend)} ÷ {workableAnnualHours.toLocaleString("nl-NL")} uur</span>
          </div>
          <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Na belasting, WW-buffer (3%), pensioen en vakantiegeld</p>
          </div>
        </div>
      </div>

      {/* Uitzenden Cards Column */}
      <div className={`md:contents ${activeTab !== "uitzenden" ? "hidden md:block" : ""}`}>
        {/* Marge Uitzenden */}
        <div className="md:col-start-2 md:row-start-2 md:self-start rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <label className="text-sm text-gray-600">Marge Uitzenden (ingehouden %)</label>
          <div className="group relative">
            <svg className="w-4 h-4 cursor-help text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal">
              {(marginZzp > 0 && marginEmp > 0 && Math.abs(marginZzp - marginEmp) > 1) && (
                <div className="mb-2 pb-2 border-b border-gray-600">
                  ⚠️ Let op: Marges verschillen ({marginZzp.toFixed(1)}% vs {marginEmp.toFixed(1)}%). Dit beïnvloedt de vergelijking.
                </div>
              )}
              Percentage dat wordt ingehouden door uitzendbureau. Marges zijn vaak hoger bij uitzenden omdat het bureau voorfinanciert (je krijgt direct betaald aan het einde van de maand).
            </div>
          </div>
        </div>
          <div className="text-lg font-semibold text-gray-900">
            {(values as any).marginEmp ?? 0}%
          </div>
        </div>
        
        {/* Klanttarief Uitzenden — verwijderd op verzoek */}
        
        {/* Totaal werkgeverslasten */}
        <div className="md:col-start-2 md:row-start-4 md:self-start rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">Werkgeverskosten (van totaal beschikbaar):</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>• Sociale premies</span>
              <span className="font-medium">{wgSocial.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>• Zvw-heffing</span>
              <span className="font-medium">{wgZvw.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>• Vakantiegeld (wettelijk)</span>
              <span className="font-medium">{wgVacation.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>• Pensioen werkgever</span>
              <span className="font-medium">{wgPensionEmployer.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-700">
              <span>• Overige verzekeringen</span>
              <span className="font-medium">{wgInsurance.toFixed(2)}%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Toeslagen (% van bruto salaris):</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>• Bovenwettelijke vakantiedagen</span>
                <span className="font-medium">{bovenwettelijkeVakantiePct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-700">
                <span>• PAWW (werkgever)</span>
                <span className="font-medium">{pawwPct.toFixed(2)}%</span>
              </div>
              {ikbPctDisplay > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span>• IKB</span>
                  <span className="font-medium">{ikbPctDisplay.toFixed(2)}%</span>
                </div>
              )}
              {advCompPctDisplay > 0 && (
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span>• ADV-compensatie</span>
                  <span className="font-medium">{advCompPctDisplay.toFixed(2)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Totaal pensioen (werknemer {pensionEmployee.toFixed(1)}% + werkgever {wgPensionEmployer.toFixed(2)}%):</span>
                <div className="group relative">
                  <svg className="w-4 h-4 cursor-help text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-normal">
                    {Math.abs(pensionTotalPct - (pensionEmployee + wgPensionEmployer)) > 1 && (
                      <div className="mb-2 pb-2 border-b border-gray-600">
                        ⚠️ Let op: ZZP pensioen = {pensionTotalPct.toFixed(1)}% vs Uitzenden = {(pensionEmployee + wgPensionEmployer).toFixed(2)}%. Dit beïnvloedt de vergelijking.
                      </div>
                    )}
                    Totale pensioenpremie bij uitzenden bestaat uit werknemersdeel ({pensionEmployee.toFixed(1)}%) en werkgeversdeel ({wgPensionEmployer.toFixed(2)}%). Dit is vaak hoger dan bij ZZP omdat het uitzendbureau het pensioen voor je regelt en deels betaalt.
                  </div>
                </div>
              </div>
              <span className="font-semibold text-gray-900">{(pensionEmployee + wgPensionEmployer).toFixed(2)}%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
            <div className="flex items-end justify-between pb-0 mb-0">
              <span className="text-xs text-gray-500">Som basis werkgeverslasten</span>
              <span className="text-sm font-semibold text-gray-900">{werkgeverslastenBasisSom.toFixed(2)}%</span>
            </div>
            <div className="text-xs text-gray-400 italic pl-2">
              ({wgSocial.toFixed(2)}% + {wgZvw.toFixed(2)}% + {wgVacation.toFixed(2)}% + {wgPensionEmployer.toFixed(2)}% + {wgInsurance.toFixed(2)}% = {werkgeverslastenBasisSom.toFixed(2)}%)
            </div>
            <div className="flex items-end justify-between pb-0 mb-0 text-xs text-gray-600">
              <span>+ Toeslagen (effectief van totaal beschikbaar):</span>
            </div>
            <div className="flex items-end justify-between pb-0 mb-0 text-xs text-gray-600 pl-4">
              <span>• Bovenwettelijke vakantie + PAWW: ~{extraKostenPctVanTotaalBeschikbaar.toFixed(2)}%</span>
            </div>
            <div className="flex items-end justify-between pb-1 mb-0 pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Totaal werkgeverskosten</span>
              <span className="text-base font-bold text-gray-900">{totaleWerkgeverskostenPct.toFixed(2)}%</span>
            </div>
            <div className="text-xs text-gray-500 italic">
              * Bovenwettelijke vakantie (2.18%) en PAWW (0.10%) zijn percentages van bruto salaris, effectief ~{extraKostenPctVanTotaalBeschikbaar.toFixed(2)}% van totaal beschikbaar
            </div>
          </div>
        </div>
        
        {/* Bruto uurloon Uitzenden */}
        <div className="md:col-start-2 md:row-start-5 md:self-start rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Bruto uurloon (Uitzenden)</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(brutoUurloonEmp)}</span>
            <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(effectiveRateEmp)} − {formatCurrencyWithDecimals(employerCostsPerHour)}</span>
          </div>
          <p className="text-xs text-gray-500">Werkgeverslasten per uur = effectieve rate × {employerTotal.toFixed(2)}%</p>
        </div>
        
        {/* Netto uurloon Uitzenden */}
        <div className="md:col-start-2 md:row-start-6 md:self-start rounded-xl bg-white border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-600 mb-1">Netto uurloon (Uitzenden)</p>
          <div className="flex items-end justify-between mb-2">
            <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(nettoUurloon)}</span>
            <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(nettoJaar)} ÷ {empAnnualHours.toLocaleString("nl-NL")} uur</span>
          </div>
          <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">Inclusief {vacationPct.toFixed(1)}% vakantiegeld: {formatCurrencyWithDecimals(vakantiegeldBedrag)}</p>
            <p className="text-xs text-gray-500">Met pensioeninhouding {pensionEmployee.toFixed(1)}% vóór belasting: {formatCurrencyWithDecimals(pensioenWerknemer)}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
