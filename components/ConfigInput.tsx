"use client";

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
  const [localValue, setLocalValue] = React.useState(value.toFixed(step < 1 ? 2 : step < 0.1 ? 3 : 0));
  
  React.useEffect(() => {
    setLocalValue(value.toFixed(step < 1 ? 2 : step < 0.1 ? 3 : 0));
  }, [value, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(localValue);
    if (isNaN(numValue) || numValue < min) {
      onChange(min);
    } else if (numValue > max) {
      onChange(max);
    } else {
      onChange(numValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-xs text-gray-500">{prefix}</span>}
          <input
            type="number"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            className="w-36 px-4 py-2.5 text-right text-sm font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
          />
          {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
}
