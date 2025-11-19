"use client";

import { CalculatorInputs, ComparisonResult, formatCurrencyWithDecimals, getWorkableAnnualHours } from "@/lib/calculations";

interface StickyComparisonFooterProps {
  data: ComparisonResult;
  inputs: CalculatorInputs;
}

export default function StickyComparisonFooter({ data, inputs }: StickyComparisonFooterProps) {
  const { zzp, emp } = data;
  
  // Calculate annual hours for netto per uur calculation
  const hoursPerWeek = (inputs as any).hoursPerWeek ?? 36;
  const workableAnnualHours = getWorkableAnnualHours(hoursPerWeek); // Werkbare jaaruren (exclusief weekends en feestdagen)
  
  // Voor ZZP: betaalde uren (10.87% onbetaalde vakantie)
  const unpaidVacationPercentage = 0.1087;
  const paidHoursRatio = 1 - unpaidVacationPercentage; // 89.13%
  const zzpPaidHours = workableAnnualHours * paidHoursRatio; // Betaalde uren voor ZZP
  
  // Voor Detacheren: werkbare jaaruren (inclusief betaalde vakantiedagen)
  const empAnnualHours = workableAnnualHours; // Werkbare jaaruren
  
  // Calculate netto per uur
  const nettoPerUurZzp = zzp.nettoJaar / zzpPaidHours;
  const nettoPerUurEmp = emp.nettoJaar / empAnnualHours;
  
  // Determine which option is better (for green border)
  const zzpIsBetter = zzp.nettoMaand > emp.nettoMaand;
  
  // Calculate bar percentages and colors (hoogste waarde = 100%)
  const maxValue = Math.max(zzp.nettoMaand, emp.nettoMaand);
  const zzpBarPercentage = maxValue > 0 ? (zzp.nettoMaand / maxValue) * 100 : 50;
  const empBarPercentage = maxValue > 0 ? (emp.nettoMaand / maxValue) * 100 : 50;
  const zzpIsLower = zzp.nettoMaand < emp.nettoMaand;
  const zzpBarColor = zzpIsLower ? '#fdba74' : '#10b981';
  const empBarColor = zzpIsLower ? '#10b981' : '#fdba74';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom backdrop-blur-sm bg-white/95" style={{ boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1), 0 -2px 8px rgba(0, 0, 0, 0.06)' }}>
      <div className="mx-auto max-w-4xl px-4 py-3 safe-area-bottom">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-3 text-center">
          Wat krijg je netto per maand?
        </h3>
        
        {/* Two Cards Side-by-Side */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* ZZP Card */}
          <div className={`rounded-xl p-3 border-2 ${
            zzpIsBetter 
              ? "bg-green-50 border-green-400" 
              : "bg-white border-gray-200"
          }`}>
            <div className="text-xs text-gray-600 mb-1 font-medium">Als ZZP'er:</div>
            <div className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              {formatCurrencyWithDecimals(zzp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              per maand • {formatCurrencyWithDecimals(nettoPerUurZzp)}/uur
            </div>
            {/* Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: zzpIsLower ? '#e5e7eb' : 'transparent' }}>
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
          
          {/* Detacheren Card */}
          <div className={`rounded-xl p-3 border-2 ${
            !zzpIsBetter 
              ? "bg-green-50 border-green-400" 
              : "bg-white border-gray-200"
          }`}>
            <div className="text-xs text-gray-600 mb-1 font-medium">Als gedetacheerde:</div>
            <div className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              {formatCurrencyWithDecimals(emp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-2">
              per maand • {formatCurrencyWithDecimals(nettoPerUurEmp)}/uur
            </div>
            {/* Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden" style={{ backgroundColor: !zzpIsLower ? '#e5e7eb' : 'transparent' }}>
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

