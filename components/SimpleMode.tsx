"use client";

import { CalculatorInputs, calculateAll, formatCurrency, formatCurrencyWithDecimals, ComparisonResult } from "@/lib/calculations";
import VisualBreakdown from "./VisualBreakdown";

interface SimpleModeProps {
  inputs: CalculatorInputs;
  onInputChange: (key: keyof CalculatorInputs, value: number) => void;
}

export default function SimpleMode({ inputs }: SimpleModeProps) {
  const result: ComparisonResult = calculateAll(inputs);
  
  // Bereken max waarde voor de bars (hoogste waarde = 100%)
  const maxValue = Math.max(result.zzp.nettoMaand, result.emp.nettoMaand);
  const zzpBarPercentage = maxValue > 0 ? (result.zzp.nettoMaand / maxValue) * 100 : 50;
  const empBarPercentage = maxValue > 0 ? (result.emp.nettoMaand / maxValue) * 100 : 50;
  
  // Bepaal welke het laagste is voor kleur (laagste = oranje, hoogste = groen)
  // Orange kleur matcht met de verschil card eronder (orange-300 = #fdba74 meer oranje, minder geel)
  const zzpIsLower = result.zzp.nettoMaand < result.emp.nettoMaand;
  const zzpBarColor = zzpIsLower ? '#fdba74' : '#10b981'; // orange-300 als lager, groen als hoger
  const empBarColor = zzpIsLower ? '#10b981' : '#fdba74'; // groen als ZZP lager is, orange-300 als detacheren lager is

  return (
    <div className="space-y-0">
      {/* Visual Breakdown Component - includes comparison cards */}
      <VisualBreakdown data={result} inputs={inputs} />
    </div>
  );
}

