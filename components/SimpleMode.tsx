"use client";

import { CalculatorInputs, calculateAll, formatCurrency, formatCurrencyWithDecimals } from "@/lib/calculations";

interface SimpleModeProps {
  inputs: CalculatorInputs;
  onInputChange: (key: keyof CalculatorInputs, value: number) => void;
}

export default function SimpleMode({ inputs }: SimpleModeProps) {
  const result = calculateAll(inputs);
  
  // Bereken max waarde voor de bars (hoogste waarde = 100%)
  const maxValue = Math.max(result.zzp.nettoMaand, result.emp.nettoMaand);
  const zzpBarPercentage = maxValue > 0 ? (result.zzp.nettoMaand / maxValue) * 100 : 50;
  const empBarPercentage = maxValue > 0 ? (result.emp.nettoMaand / maxValue) * 100 : 50;
  
  // Bepaal welke het laagste is voor kleur (laagste = oranje, hoogste = groen)
  // Orange kleur matcht met de verschil card eronder (orange-300 = #fdba74 meer oranje, minder geel)
  const zzpIsLower = result.zzp.nettoMaand < result.emp.nettoMaand;
  const zzpBarColor = zzpIsLower ? '#fdba74' : '#10b981'; // orange-300 als lager, groen als hoger
  const empBarColor = zzpIsLower ? '#10b981' : '#fdba74'; // groen als ZZP lager is, orange-300 als uitzenden lager is

  return (
    <div className="space-y-0">
      {/* Resultaat vergelijking - groot en duidelijk */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8" style={{ boxShadow: '0 2px 4px 0 rgba(13, 13, 18, 0.05)' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Wat krijg je netto per maand?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* ZZP Result */}
          <div className={`rounded-xl p-6 border-2 ${
            result.zzp.nettoMaand > result.emp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als ZZP'er:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(result.zzp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(result.zzp.nettoJaar)} per jaar
            </div>
            {/* Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden mt-2" style={{ backgroundColor: zzpIsLower ? '#e5e7eb' : 'transparent' }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${zzpBarPercentage}%`, 
                  minWidth: '4px',
                  backgroundColor: zzpBarColor,
                  height: '100%'
                }}
              />
            </div>
          </div>

          {/* Uitzenden Result */}
          <div className={`rounded-xl p-6 border-2 ${
            result.emp.nettoMaand > result.zzp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als uitzendkracht:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(result.emp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(result.emp.nettoJaar)} per jaar
            </div>
            {/* Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden mt-2" style={{ backgroundColor: !zzpIsLower ? '#e5e7eb' : 'transparent' }}>
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${empBarPercentage}%`, 
                  minWidth: '4px',
                  backgroundColor: empBarColor,
                  height: '100%'
                }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

