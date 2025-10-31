"use client";

import { ChangeEvent, useState } from "react";
import { formatCurrency, formatCurrencyWithDecimals, getWorkableAnnualHours, calculateIncomeTax, calculateZzp } from "@/lib/calculations";

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
  const clientRateZzp = (values as any).clientRateZzp ?? values.rate;
  const clientRateEmp = (values as any).clientRateEmp ?? values.rate;
  const marginZzp = (values as any).marginZzp ?? 0;
  const marginEmp = (values as any).marginEmp ?? 0;
  const effectiveRateZzp = clientRateZzp * (1 - marginZzp / 100);
  const effectiveRateEmp = clientRateEmp * (1 - marginEmp / 100);
  // Werkgeverslasten (vaste componenten volgens specificatie)
  const wgSocial = 11.0;
  const wgVacation = 8.33;
  const wgPensionEmployer = 14.31;
  const wgInsurance = 2.0;
  const wgOther = 6.0;
  const employerTotal = 41.6;
  const employerTotalFraction = employerTotal / 100;
  const employerCostsPerHour = effectiveRateEmp * employerTotalFraction;
  const brutoUurloonEmp = effectiveRateEmp - employerCostsPerHour;
  
  // Calculate annual hours based on hours per week
  const hoursPerWeekInput = (values as any).hoursPerWeek ?? 36;
  const annualHours = getWorkableAnnualHours(hoursPerWeekInput);
  
  // Calculate netto uurloon for display
  const brutoJaarloon = brutoUurloonEmp * annualHours;
  const jaarLoonMetVakantie = brutoJaarloon * 1.08;
  const vacationPct = values.vacation ?? 8;
  const pensionEmployee = (values as any).pensionEmployee ?? 7.5;
  const pensionBase = values.pensionBase ?? 90;
  
  const vakantiegeldBedrag = brutoJaarloon * (vacationPct / 100);
  const pensioenWerknemer = brutoJaarloon * (pensionBase / 100) * (pensionEmployee / 100);
  
  // Pensioen is aftrekbaar voor belasting (belastbaar = jaarloon met vakantie - pensioen)
  const belastbaarBedrag = jaarLoonMetVakantie - pensioenWerknemer;
  const loonbelasting = calculateIncomeTax(belastbaarBedrag);
  
  const nettoJaar = jaarLoonMetVakantie - loonbelasting - pensioenWerknemer;
  const nettoUurloon = nettoJaar / annualHours;
  const nettoMaand = nettoJaar / 12;
  
  // ZZP netto uit lib-berekening (zelfde inputs)
  const zzpCalc = calculateZzp(values as any);
  
  // Bereken alle tussenstappen voor ZZP breakdown (gebruik bestaande variabelen waar mogelijk)
  const costsPct = values.costs ?? 10;
  const pensionTotalPct = values.pensionTotal ?? 20;
  const pensionBasePct = pensionBase; // gebruik bestaande variabele
  
  // Tussenstappen berekenen (volgens nieuwe logica)
  const omzet = effectiveRateZzp * annualHours;
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
  // Vakantiegeld: 8.33% met effectieve belastingdruk toegepast
  const vakantiegeldBasePct = 8.33; // Basis percentage
  const vakantiegeldEffectiefPct = vakantiegeldBasePct * (1 - effectieveBelastingdruk);
  const vakantiegeld = (omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0)) * (vakantiegeldEffectiefPct / 100); // vakantiereserve
  
  // Netto = winst voor belasting - belasting - WW buffer - vakantiegeld
  const nettoJaarBerekend = winstVoorBelasting - inkomstenbelasting - wwBuffer - vakantiegeld;
  const nettoUurloonZzp = nettoJaarBerekend / annualHours;
  
  const [showZzpBreakdown, setShowZzpBreakdown] = useState(false);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-700">ZZP</h2>
      </div>
      <div className="md:col-start-2">
        <h2 className="text-sm font-semibold text-gray-700">Uitzenden</h2>
      </div>
      <NumberField label="Klanttarief ZZP" min={10} max={300} step={1} value={(values as any).clientRateZzp ?? values.rate} onChange={(v) => onChange("clientRateZzp" as any, v)} suffix="€" />
      <NumberField label="Klanttarief Uitzenden" min={10} max={300} step={1} value={(values as any).clientRateEmp ?? values.rate} onChange={(v) => onChange("clientRateEmp" as any, v)} suffix="€" />
      <NumberField label="Marge ZZP" min={0} max={50} step={0.5} value={(values as any).marginZzp ?? 0} onChange={(v) => onChange("marginZzp" as any, v)} suffix="%" />
      <NumberField label="Marge Uitzenden" min={0} max={50} step={0.5} value={(values as any).marginEmp ?? 0} onChange={(v) => onChange("marginEmp" as any, v)} suffix="%" />
      <div className="md:col-span-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <label className="text-sm text-gray-600 mb-2 block">Uren per week</label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="range"
            min={24}
            max={40}
            step={1}
            value={hoursPerWeekInput}
            onChange={(e) => onChange("hoursPerWeek" as any, Number(e.target.value))}
            className="w-full accent-[#00B37E]"
          />
          <input
            type="number"
            min={24}
            max={40}
            step={1}
            value={hoursPerWeekInput}
            onChange={(e) => onChange("hoursPerWeek" as any, Number(e.target.value))}
            className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right"
          />
        </div>
        <div className="flex items-end justify-between">
          <span className="text-xs text-gray-500">Jaaruren (werkbaar):</span>
          <span className="text-base font-semibold">{annualHours.toLocaleString("nl-NL")} uur</span>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Effectieve rate ZZP</p>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(effectiveRateZzp)}</span>
          <span className="text-xs text-gray-500">{formatCurrencyWithDecimals(clientRateZzp)} × (1 − {marginZzp.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Effectieve rate Uitzenden</p>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(effectiveRateEmp)}</span>
          <span className="text-xs text-gray-500">{formatCurrencyWithDecimals(clientRateEmp)} × (1 − {marginEmp.toFixed(1)}%)</span>
        </div>
      </div>
      {/* UITGEZET: handmatige ZZP schuifjes */}
      {false && (
        <div className="space-y-4">
          <NumberField label="Kosten ZZP" min={0} max={50} step={0.5} value={values.costs} onChange={(v) => onChange("costs", v)} suffix="%" />
          <NumberField label="Belastingdruk ZZP" min={0} max={60} step={0.5} value={values.taxZzp} onChange={(v) => onChange("taxZzp", v)} suffix="%" />
          <NumberField label="Pensioenpremie totaal ZZP" min={0} max={40} step={0.1} value={values.pensionTotal} onChange={(v) => onChange("pensionTotal", v)} suffix="%" />
        </div>
      )}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-2">ZZP opbouw (van omzet)</p>
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Voor belasting:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between"><span>• Bedrijfskosten</span><span>{costsPct.toFixed(1)}%</span></li>
            {heeftEchteAovVerzekering && (
              <li className="flex justify-between"><span>• AOV</span><span>6.5%</span></li>
            )}
            <li className="flex justify-between"><span>• Pensioen (grondslag {pensionBasePct}%, max 30% jaarruimte)</span><span>{(pensionBasePct * pensionTotalPct / 100).toFixed(1)}%</span></li>
          </ul>
        </div>
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Na belasting:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex justify-between"><span>• WW-buffer</span><span>3.0%</span></li>
            <li className="flex justify-between"><span>• Vakantiegeld (8.33% × {((1 - effectieveBelastingdruk) * 100).toFixed(1)}%)</span><span>{vakantiegeldEffectiefPct.toFixed(2)}%</span></li>
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
              <span className="text-gray-600">× Jaaruren ({annualHours.toLocaleString("nl-NL")} uur)</span>
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
              <p className="text-gray-500 font-medium mb-2">Na belasting:</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">− WW-buffer (3% van omzet)</span>
                  <span className="text-gray-500">{formatCurrency(wwBuffer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">− Vakantiegeld ({vakantiegeldEffectiefPct.toFixed(2)}% = 8.33% × {((1 - effectieveBelastingdruk) * 100).toFixed(1)}%)</span>
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
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4 self-start">
        <p className="text-sm text-gray-600 mb-2">Totaal werkgeverslasten (uitzenden)</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex justify-between"><span>• Sociale premies</span><span>{wgSocial.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Vakantiegeld</span><span>{wgVacation.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Pensioen</span><span>{wgPensionEmployer.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Verzekeringen</span><span>{wgInsurance.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Overige werkgeverslasten</span><span>{wgOther.toFixed(2)}%</span></li>
        </ul>
        <div className="mt-3 flex items-end justify-between pb-0 mb-0">
          <span className="text-xs text-gray-500">Som onderdelen</span>
          <span className="text-base font-semibold">41.60%</span>
        </div>
      </div>
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Bruto uurloon (Uitzenden)</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(brutoUurloonEmp)}</span>
          <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(effectiveRateEmp)} − {formatCurrencyWithDecimals(employerCostsPerHour)}</span>
        </div>
        <p className="text-xs text-gray-500">Werkgeverslasten per uur = effectieve rate × {employerTotal.toFixed(2)}%</p>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Netto uurloon (ZZP)</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(nettoUurloonZzp)}</span>
          <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(nettoJaarBerekend)} ÷ {annualHours.toLocaleString("nl-NL")} uur</span>
        </div>
        <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">Na belasting, AOV (6.5%), WW buffer (3%), pensioen en vakantiegeld</p>
        </div>
      </div>
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Netto uurloon (Uitzenden)</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(nettoUurloon)}</span>
          <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(nettoJaar)} ÷ {annualHours.toLocaleString("nl-NL")} uur</span>
        </div>
        <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">Inclusief {vacationPct.toFixed(1)}% vakantiegeld: {formatCurrencyWithDecimals(vakantiegeldBedrag)}</p>
          <p className="text-xs text-gray-500">Met pensioeninhouding {pensionEmployee.toFixed(1)}% vóór belasting: {formatCurrencyWithDecimals(pensioenWerknemer)}</p>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4 self-start">
        <p className="text-sm text-gray-600 mb-1">Netto maandloon (ZZP)</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(zzpCalc.nettoMaand)}</span>
          <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(zzpCalc.nettoJaar)} ÷ 12</span>
        </div>
      </div>
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Netto maandloon (Uitzenden)</p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(nettoMaand)}</span>
          <span className="text-xs text-gray-500">= {formatCurrencyWithDecimals(nettoJaar)} ÷ 12</span>
        </div>
      </div>
      {/* <NumberField label="Vakantiegeld" min={0} max={20} step={0.5} value={values.vacation} onChange={(v) => onChange("vacation", v)} suffix="%" /> */}
      {/* <NumberField label="Werkgeverbijdrage" min={0} max={40} step={0.1} value={values.pensionEmployer} onChange={(v) => onChange("pensionEmployer", v)} suffix="%" /> */}
      {/* <NumberField label="Werknemerbijdrage" min={0} max={20} step={0.1} value={values.pensionEmployee} onChange={(v) => onChange("pensionEmployee", v)} suffix="%" /> */}
      {/* <NumberField label="Pensioengrondslag" min={0} max={100} step={0.5} value={values.pensionBase} onChange={(v) => onChange("pensionBase", v)} suffix="%" /> */}
    </div>
  );
}


