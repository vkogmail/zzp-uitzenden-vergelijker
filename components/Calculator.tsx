"use client";

import { ChangeEvent } from "react";
import { formatCurrency, formatCurrencyWithDecimals, getWorkableAnnualHours, calculateIncomeTax } from "@/lib/calculations";

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
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-1">Effectieve rate Uitzenden</p>
        <div className="flex items-end justify-between">
          <span className="text-2xl font-semibold">{formatCurrencyWithDecimals(effectiveRateEmp)}</span>
          <span className="text-xs text-gray-500">{formatCurrencyWithDecimals(clientRateEmp)} × (1 − {marginEmp.toFixed(1)}%)</span>
        </div>
      </div>
      <div className="md:col-start-2 rounded-xl bg-white border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-600 mb-2">Totaal werkgeverslasten (uitzenden)</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li className="flex justify-between"><span>• Sociale premies</span><span>{wgSocial.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Vakantiegeld</span><span>{wgVacation.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Pensioen</span><span>{wgPensionEmployer.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Verzekeringen</span><span>{wgInsurance.toFixed(2)}%</span></li>
          <li className="flex justify-between"><span>• Overige werkgeverslasten</span><span>{wgOther.toFixed(2)}%</span></li>
        </ul>
        <div className="mt-3 flex items-end justify-between">
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
      <NumberField label="Vakantiegeld" min={0} max={20} step={0.5} value={values.vacation} onChange={(v) => onChange("vacation", v)} suffix="%" />
      <NumberField label="Kosten ZZP" min={0} max={50} step={0.5} value={values.costs} onChange={(v) => onChange("costs", v)} suffix="%" />
      <NumberField label="Belastingdruk ZZP" min={0} max={60} step={0.5} value={values.taxZzp} onChange={(v) => onChange("taxZzp", v)} suffix="%" />
      <NumberField label="Pensioenpremie totaal" min={0} max={40} step={0.1} value={values.pensionTotal} onChange={(v) => onChange("pensionTotal", v)} suffix="%" />
      <NumberField label="Werkgeverbijdrage" min={0} max={40} step={0.1} value={values.pensionEmployer} onChange={(v) => onChange("pensionEmployer", v)} suffix="%" />
      <NumberField label="Werknemerbijdrage" min={0} max={20} step={0.1} value={values.pensionEmployee} onChange={(v) => onChange("pensionEmployee", v)} suffix="%" />
      <NumberField label="Pensioengrondslag" min={0} max={100} step={0.5} value={values.pensionBase} onChange={(v) => onChange("pensionBase", v)} suffix="%" />
    </div>
  );
}


