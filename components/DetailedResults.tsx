"use client";

import { useState } from "react";
import { CalculatorInputs, ComparisonResult, calculateZzp, calculateEmployee, formatCurrency, formatCurrencyWithDecimals, getWorkableAnnualHours, getActivePresetConfig } from "@/lib/calculations";

interface DetailedResultsProps {
  data: ComparisonResult;
  inputs: CalculatorInputs;
}

export default function DetailedResults({ data, inputs }: DetailedResultsProps) {
  const preset = getActivePresetConfig() as any;
  // const [activeTab, setActiveTab] = useState<"zzp" | "uitzenden">("zzp");
  const [showZzpBreakdown, setShowZzpBreakdown] = useState(false);
  const [showEmpBreakdown, setShowEmpBreakdown] = useState(false);
  
  // Calculate bar percentages and colors for comparison cards
  const maxValue = Math.max(data.zzp.nettoMaand, data.emp.nettoMaand);
  const zzpBarPercentage = maxValue > 0 ? (data.zzp.nettoMaand / maxValue) * 100 : 50;
  const empBarPercentage = maxValue > 0 ? (data.emp.nettoMaand / maxValue) * 100 : 50;
  const zzpIsLower = data.zzp.nettoMaand < data.emp.nettoMaand;
  const zzpBarColor = zzpIsLower ? '#fdba74' : '#10b981'; // orange-300 als lager, groen als hoger
  const empBarColor = zzpIsLower ? '#10b981' : '#fdba74'; // groen als ZZP lager is, orange-300 als uitzenden lager is

  // Calculate breakdown values
  const clientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
  const clientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
  const marginZzp = (inputs as any).marginZzp ?? 0;
  const marginEmp = (inputs as any).marginEmp ?? 0;
  const effectiveRateZzp = clientRateZzp * (1 - marginZzp / 100);
  const effectiveRateEmp = clientRateEmp * (1 - marginEmp / 100);
  const hoursPerWeek = (inputs as any).hoursPerWeek ?? 36;
  // Gebruik werkbare jaaruren voor beide varianten voor eerlijke vergelijking
  const theoreticalAnnualHours = getWorkableAnnualHours(hoursPerWeek);
  
  // Voor ZZP: betaalde uren (10.87% onbetaalde vakantie)
  const unpaidVacationPercentage = 0.1087;
  const paidHoursRatio = 1 - unpaidVacationPercentage; // 89.13%
  const zzpPaidHours = theoreticalAnnualHours * paidHoursRatio; // Betaalde uren voor ZZP
  
  // Voor Uitzenden: ook werkbare jaaruren
  const empAnnualHours = theoreticalAnnualHours;
  
  // Detail cards variables (commented out - cards are hidden)
  // const employerTotal = 41.6;
  // const employerCostsPerHour = effectiveRateEmp * (employerTotal / 100);
  
  // ZZP calculations
  const zzpCalc = calculateZzp(inputs as any);
  const costsPct = inputs.costs ?? 10;
  const omzet = effectiveRateZzp * zzpPaidHours;
  const bedrijfskosten = omzet * (costsPct / 100);
  const pensionTotalPct = inputs.pensionTotal ?? 20;
  const pensionBasePct = inputs.pensionBase ?? 90;
  const heeftEchteAovVerzekering = false;
  const aov = heeftEchteAovVerzekering ? omzet * 0.065 : 0;
  const pensioenZonderPlafond = (omzet - bedrijfskosten - aov) * (pensionBasePct / 100) * (pensionTotalPct / 100);
  const jaarruimteMax = (omzet - bedrijfskosten - aov) * 0.30;
  const pensioen = Math.min(pensioenZonderPlafond, jaarruimteMax);
  const winstVoorBelasting = omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0) - pensioen;
  const zelfstandigenaftrek = 3360;
  const winstNaZelfstandig = Math.max(0, winstVoorBelasting - zelfstandigenaftrek);
  const mkbVrijstelling = winstNaZelfstandig * 0.14;
  const belastbaarInkomen = Math.max(0, winstNaZelfstandig - mkbVrijstelling);
  
  // Calculate effective tax rate for vacation pay calculation
  let brutoBelasting = 0;
  if (belastbaarInkomen <= 73031) {
    brutoBelasting = belastbaarInkomen * 0.3693;
  } else {
    brutoBelasting = 73031 * 0.3693 + (belastbaarInkomen - 73031) * 0.495;
  }
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
  const effectieveBelastingdruk = belastbaarInkomen > 0 ? inkomstenbelasting / belastbaarInkomen : 0;
  const vakantiegeldBasePct = 8.33;
  const vakantiegeldEffectiefPct = vakantiegeldBasePct * (1 - effectieveBelastingdruk);
  const wwBuffer = omzet * 0.03;
  const vakantiegeld = (omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0)) * (vakantiegeldEffectiefPct / 100);
  const nettoJaarBerekend = winstVoorBelasting - inkomstenbelasting - wwBuffer - zzpCalc.zvwPremie - vakantiegeld;
  
  // Employee calculations for comparison
  const pensionEmployee = (inputs as any).pensionEmployee ?? 7.5;
  const wgPensionEmployer = 14.31;
  
  // Employee calculations (used in breakdown components)
  const empCalc = calculateEmployee(inputs as any);
  // const brutoUurloonEmp = empCalc.brutoUurloon;
  // const brutoJaarloon = empCalc.brutoJaarloon;
  // const vakantiegeldEmp = empCalc.vakantiegeldEmp;
  const pensioenWerknemer = empCalc.pensioenWerknemer;
  const loonbelasting = empCalc.loonbelasting;

  return (
    <div className="w-full">
      {/* Resultaat vergelijking - groot en duidelijk */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Wat krijg je netto per maand?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* ZZP Result */}
          <div className={`rounded-xl p-6 border-2 ${
            data.zzp.nettoMaand > data.emp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als ZZP'er:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(data.zzp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(data.zzp.nettoJaar)} per jaar
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
            
            {showZzpBreakdown && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">ZZP opbouw van netto</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Af te trekken:</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Bedrijfskosten ({costsPct.toFixed(1)}%):</span>
                        <span className="text-gray-700">{formatCurrency(bedrijfskosten)}</span>
                      </div>
                      {heeftEchteAovVerzekering && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">• AOV (6.5%):</span>
                          <span className="text-gray-700">{formatCurrency(aov)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">• Pensioen ({pensionBasePct}% × {pensionTotalPct}%, max 30% jaarruimte):</span>
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
                        <span className="text-gray-700">{formatCurrency(pensioen)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-600">Winst voor belasting:</span>
                        <span className="font-medium text-gray-700">{formatCurrency(winstVoorBelasting)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Inkomstenbelasting:</span>
                        <span className="text-gray-700">{formatCurrency(inkomstenbelasting)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Zvw-premie (verplicht):</span>
                        <span className="text-gray-700">{formatCurrency(zzpCalc.zvwPremie)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• WW-buffer (reserve, niet verplicht):</span>
                        <span className="text-gray-700">{formatCurrency(wwBuffer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Vakantiegeld reserve (niet verplicht):</span>
                        <span className="text-gray-700">{formatCurrency(vakantiegeld)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Netto per jaar:</span>
                        <span className="font-semibold">{formatCurrency(nettoJaarBerekend)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Netto per maand:</span>
                        <span className="font-semibold">{formatCurrencyWithDecimals(data.zzp.nettoMaand)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Uitzenden Result */}
          <div className={`rounded-xl p-6 border-2 ${
            data.emp.nettoMaand > data.zzp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als uitzendkracht:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(data.emp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(data.emp.nettoJaar)} per jaar
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
            
            {showEmpBreakdown && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Uitzenden opbouw van netto</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium">Af te trekken:</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Pensioen werknemer ({inputs.pensionEmployee ?? 7.5}%):</span>
                        <span className="text-gray-700">{formatCurrency(pensioenWerknemer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">• Loonbelasting:</span>
                        <span className="text-gray-700">{formatCurrency(loonbelasting)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Netto per jaar:</span>
                        <span className="font-semibold">{formatCurrency(data.emp.nettoJaar)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Netto per maand:</span>
                        <span className="font-semibold">{formatCurrencyWithDecimals(data.emp.nettoMaand)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation - Mobile Only */}
      {/* <div className="mb-4 flex gap-2 bg-gray-100 p-1 rounded-lg md:hidden">
        <button
          onClick={() => setActiveTab("zzp")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "zzp"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ZZP Details
        </button>
        <button
          onClick={() => setActiveTab("uitzenden")}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "uitzenden"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Uitzenden Details
        </button>
      </div> */}

      {/* Tab Panels - Mobile: Single panel, Desktop: Both side by side */}
      {/* <div className="md:grid md:grid-cols-2 md:gap-6"> */}
        {/* ZZP Panel - Mobile: Show when active, Desktop: Always show */}
        {/* <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${activeTab !== "zzp" ? "hidden md:block" : ""}`}>
          <div className="space-y-6"> */}
            {/* Header */}
            {/* <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">ZZP</h2>
              <div className="text-sm text-gray-600">
                Netto per maand: <span className="font-semibold text-gray-900">{formatCurrencyWithDecimals(data.zzp.nettoMaand)}</span>
              </div>
            </div> */}

            {/* Uurtarief ZZP Section */}
            {/* <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Uurtarief ZZP</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarief per uur:</span>
                  <span className="font-semibold">{formatCurrencyWithDecimals(effectiveRateZzp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uren per week:</span>
                  <span className="font-semibold">{hoursPerWeek} uur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jaaruren (werkbaar):</span>
                  <span className="font-semibold">{annualHours.toLocaleString("nl-NL")} uur</span>
                </div>
              </div>
            </div> */}

            {/* Jaarinkomst Section */}
            {/* <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Jaarinkomst (Uurtarief)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bruto omzet per jaar:</span>
                  <span className="font-semibold">{formatCurrency(omzet)}</span>
                </div>
              </div>
            </div>
          </div>
        </div> */}

        {/* Uitzenden Panel - Mobile: Show when active, Desktop: Always show */}
        {/* <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${activeTab !== "uitzenden" ? "hidden md:block" : ""}`}>
          <div className="space-y-6"> */}
            {/* Header */}
            {/* <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Uitzenden</h2>
              <div className="text-sm text-gray-600">
                Netto per maand: <span className="font-semibold text-gray-900">{formatCurrencyWithDecimals(data.emp.nettoMaand)}</span>
              </div>
            </div> */}

            {/* Uurtarief Uitzenden Section */}
            {/* <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Uurtarief Uitzenden</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Effectief tarief per uur:</span>
                  <span className="font-semibold">{formatCurrencyWithDecimals(effectiveRateEmp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Werkgeverslasten ({employerTotal}%):</span>
                  <span className="font-semibold">{formatCurrencyWithDecimals(employerCostsPerHour)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bruto uurloon:</span>
                  <span className="font-semibold">{formatCurrencyWithDecimals(brutoUurloonEmp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uren per week:</span>
                  <span className="font-semibold">{hoursPerWeek} uur</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jaaruren (werkbaar):</span>
                  <span className="font-semibold">{annualHours.toLocaleString("nl-NL")} uur</span>
                </div>
              </div>
            </div> */}

            {/* Jaarinkomst Section */}
            {/* <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Jaarinkomst</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bruto jaarloon (basis):</span>
                  <span className="font-semibold">{formatCurrency(brutoUurloonEmp * annualHours)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vakantiegeld ({inputs.vacation ?? 8}%):</span>
                  <span className="font-semibold">{formatCurrency(vakantiegeldEmp)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100">
                  <span className="font-medium text-gray-700">Bruto jaarloon (totaal):</span>
                  <span className="font-semibold">{formatCurrency(brutoJaarloon)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* Parameters blok verwijderd op verzoek (dubbeling) */}
    </div>
  );
}

