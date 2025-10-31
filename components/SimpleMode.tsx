"use client";

import { CalculatorInputs, calculateAll, formatCurrency, formatCurrencyWithDecimals } from "@/lib/calculations";
import ResultChart from "./ResultChart";

interface SimpleModeProps {
  inputs: CalculatorInputs;
  onInputChange: (key: keyof CalculatorInputs, value: number) => void;
}

export default function SimpleMode({ inputs, onInputChange }: SimpleModeProps) {
  const result = calculateAll(inputs);
  const marginZzp = (inputs as any).marginZzp ?? 0;
  const marginEmp = (inputs as any).marginEmp ?? 0;
  
  // In simple mode werken we met effectieve rates (wat je krijgt)
  // We moeten de client rates berekenen uit de effectieve rates
  // Voor display gebruiken we de huidige clientRate waarde en berekenen we effectieve rate
  // Maar voor input gebruiken we effectieve rate en berekenen we client rate
  
  // Haal de huidige client rates op
  const currentClientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
  const currentClientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
  
  // Bereken wat de effectieve rates nu zijn (voor display/input waarde)
  const currentEffectiveRateZzp = currentClientRateZzp * (1 - marginZzp / 100);
  const currentEffectiveRateEmp = currentClientRateEmp * (1 - marginEmp / 100);
  
  // Functie om klanttarief te berekenen uit effectieve rate
  const calculateClientRate = (effectiveRate: number, margin: number) => {
    if (margin === 0) return effectiveRate;
    return effectiveRate / (1 - margin / 100);
  };

  return (
    <div className="space-y-6">
      {/* Eenvoudige inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wat moet ik vragen als ZZP'er?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={300}
              step={0.5}
              value={Math.round(currentEffectiveRateZzp * 100) / 100}
              onChange={(e) => {
                const newEffectiveRate = Number(e.target.value);
                // Bereken klanttarief uit effectieve rate
                const newClientRate = calculateClientRate(newEffectiveRate, marginZzp);
                onInputChange("clientRateZzp" as any, newClientRate);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-[#00B37E] focus:border-[#00B37E]"
            />
            <span className="text-lg font-medium text-gray-600">€/uur</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Dit is wat je krijgt. Klant betaalt: {formatCurrencyWithDecimals(calculateClientRate(currentEffectiveRateZzp, marginZzp))}/uur (inclusief {marginZzp}% marge)
          </p>
        </div>

        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wat zou ik krijgen bij uitzenden?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={300}
              step={0.5}
              value={Math.round(currentEffectiveRateEmp * 100) / 100}
              onChange={(e) => {
                const newEffectiveRate = Number(e.target.value);
                // Bereken klanttarief uit effectieve rate
                const newClientRate = calculateClientRate(newEffectiveRate, marginEmp);
                onInputChange("clientRateEmp" as any, newClientRate);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-[#00B37E] focus:border-[#00B37E]"
            />
            <span className="text-lg font-medium text-gray-600">€/uur</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Dit is wat je krijgt. Klant betaalt: {formatCurrencyWithDecimals(calculateClientRate(currentEffectiveRateEmp, marginEmp))}/uur (inclusief {marginEmp}% marge)
          </p>
        </div>
      </div>

      {/* Resultaat vergelijking - groot en duidelijk */}
      <div className="rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Wat krijg je netto per maand?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* ZZP Result */}
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Als ZZP'er:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(result.zzp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500">
              per maand • {formatCurrency(result.zzp.nettoJaar)} per jaar
            </div>
          </div>

          {/* Uitzenden Result */}
          <div className={`bg-white rounded-xl p-6 border-2 ${result.emp.nettoMaand > result.zzp.nettoMaand ? 'border-[#00B37E]' : 'border-gray-200'}`}>
            <div className="text-sm text-gray-600 mb-1">Als uitzendkracht:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(result.emp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500">
              per maand • {formatCurrency(result.emp.nettoJaar)} per jaar
            </div>
          </div>
        </div>

        {/* Verschil - duidelijk */}
        <div className={`text-center p-5 rounded-lg ${result.diffPercent >= 0 ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
          <div className="text-sm font-medium text-gray-700 mb-2">Het verschil:</div>
          <div className={`text-3xl font-bold mb-2 ${result.diffPercent >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
            {result.diffPercent >= 0 ? '+' : ''}{formatCurrency(result.diffMonthly)} per maand
          </div>
          <div className="text-sm text-gray-700 font-medium">
            Als ZZP'er krijg je {Math.abs(result.diffPercent * 100).toFixed(1)}% {result.diffPercent >= 0 ? 'meer' : 'minder'} dan bij uitzenden
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">ZZP</h3>
          <ResultChart data={result} type="zzp" />
        </div>
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Uitzenden</h3>
          <ResultChart data={result} type="uitzenden" />
        </div>
      </div>

      {/* Korte uitleg */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Hoe werkt dit?</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Bij ZZP moet je zelf pensioen regelen, verzekeringen betalen en reserves aanleggen</li>
          <li>• Bij uitzenden regelt het uitzendbureau dit allemaal voor je</li>
          <li>• Daarom kan je als uitzendkracht soms netto meer overhouden, ondanks een lager tarief</li>
          <li>• De keuze gaat vooral om zekerheid (uitzenden) versus vrijheid (ZZP)</li>
        </ul>
      </div>
    </div>
  );
}

