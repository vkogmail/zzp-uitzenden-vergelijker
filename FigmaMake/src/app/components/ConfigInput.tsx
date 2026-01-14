import React from 'react';

interface ConfigInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

export function ConfigInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  prefix,
  suffix
}: ConfigInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xs text-slate-500">{prefix}</span>}
          <input
            type="number"
            value={value.toFixed(step < 1 ? 2 : step < 0.1 ? 3 : 0)}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            className="w-24 px-2 py-1 text-right text-sm font-bold border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}
