"use client";

import { ChangeEvent } from "react";

type NumericKey =
  | "rate"
  | "weeksZzp"
  | "weeksEmp"
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NumberField label="Uurtarief opdrachtgever" min={10} max={300} step={1} value={values.rate} onChange={(v) => onChange("rate", v)} suffix="€" />
      <NumberField label="Werkweken ZZP" min={0} max={52} step={1} value={values.weeksZzp} onChange={(v) => onChange("weeksZzp", v)} />
      <NumberField label="Werkweken Uitzenden" min={0} max={52} step={1} value={values.weeksEmp} onChange={(v) => onChange("weeksEmp", v)} />
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


