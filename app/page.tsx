"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Calculator from "@/components/Calculator";
import SimpleMode from "@/components/SimpleMode";
import DetailedResults from "@/components/DetailedResults";
import StickyComparisonFooter from "@/components/StickyComparisonFooter";
import { CalculatorInputs, calculateAll, defaultInputs, formatCurrency, formatCurrencyWithDecimals, formatPercent, getWorkableAnnualHours, setActivePresetConfig } from "@/lib/calculations";
import BASELINE from "@/data/presets/current_2025_baseline.json";
import STIPP_BASIS_2026 from "@/data/presets/stipp_basis_2026_draft.json";
import STIPP_PLUS_2026 from "@/data/presets/stipp_plus_2026_draft.json";
import GEMEENTEN_2026 from "@/data/presets/gemeenten_2026_draft.json";
import GENERIEK_2026 from "@/data/presets/generiek_2026_draft.json";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [preset, setPreset] = useState<string>("baseline");
  const presets = {
    baseline: { label: "Baseline (huidig)", config: BASELINE },
    stipp_basis_2026: { label: "ABU/NBBU • StiPP Basis 2026 (draft)", config: STIPP_BASIS_2026 },
    stipp_plus_2026: { label: "ABU/NBBU • StiPP Plus 2026 (draft)", config: STIPP_PLUS_2026 },
    gemeenten_2026: { label: "Gemeenten 2026 (draft)", config: GEMEENTEN_2026 },
    generiek_2026: { label: "Generiek 2026 (draft)", config: GENERIEK_2026 },
  } as const;

  // Initialize active preset (and update when preset changes)
  useMemo(() => {
    const cfg = (presets as any)[preset]?.config ?? BASELINE;
    setActivePresetConfig(cfg);
    return cfg;
  }, [preset]);
  const [isSimpleMode, setIsSimpleMode] = useState(true); // Default: simple mode
  const result = useMemo(() => calculateAll(inputs), [inputs]);
  const exportRef = useRef<HTMLDivElement>(null);

  const setValue = useCallback((key: keyof CalculatorInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const copyResults = async () => {
    const text = `ZZP vs Uitzenden Vergelijker\n\nNetto per maand (ZZP): ${formatCurrency(result.zzp.nettoMaand)}\nNetto per maand (Uitzenden): ${formatCurrency(result.emp.nettoMaand)}\nVerschil: ${formatCurrency(result.diffMonthly)} (${formatPercent(result.diffPercent, 1)})`;
    await navigator.clipboard.writeText(text);
  };

  const exportPdf = async () => {
    const node = exportRef.current;
    if (!node) return;
    const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
    pdf.save("zzp-vs-uitzenden.pdf");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 scroll-smooth">
      <div className={`mx-auto max-w-4xl px-4 py-10 ${isSimpleMode ? 'pb-10' : 'pb-72'}`}>
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            ZZP vs Uitzenden Vergelijker
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6">
            Vergelijk netto inkomen per maand met reële aannames (2026). Alle berekeningen gaan uit van 12 maanden (jaar).
          </p>
        </header>

        {/* Preset selector */}
        <section className="mb-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">CAO/preset</label>
            <div className="flex items-center gap-3">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {Object.entries(presets).map(([key, v]) => (
                  <option key={key} value={key}>{v.label}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">Keuze bepaalt percentages (vakantiegeld, Zvw, WKR, pensioen e.d.).</span>
            </div>
          </div>
        </section>

        {/* Hours Input, Rate Input and Toggle Switch - Unified design for both mobile and desktop */}
        <section className="mb-6 space-y-4">
          {/* Hours per week and Rate inputs - side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hourly rate input - what you want to get per hour */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <label className="text-sm text-gray-600 mb-3 block font-medium">Wat wil je per uur krijgen?</label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={10}
                  max={300}
                  step={1}
                  value={(() => {
                    // Calculate effective rate from current client rates and margins
                    const marginZzp = (inputs as any).marginZzp ?? 0;
                    const marginEmp = (inputs as any).marginEmp ?? 0;
                    const clientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
                    const clientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
                    const effectiveZzp = clientRateZzp * (1 - marginZzp / 100);
                    const effectiveEmp = clientRateEmp * (1 - marginEmp / 100);
                    // Use average or prefer ZZP if available
                    return Math.round(effectiveZzp);
                  })()}
                  onChange={(e) => {
                    const desiredEffectiveRate = Number(e.target.value);
                    const marginZzp = (inputs as any).marginZzp ?? 0;
                    const marginEmp = (inputs as any).marginEmp ?? 0;
                    // Calculate client rates from desired effective rate
                    const clientRateZzp = marginZzp === 0 ? desiredEffectiveRate : desiredEffectiveRate / (1 - marginZzp / 100);
                    const clientRateEmp = marginEmp === 0 ? desiredEffectiveRate : desiredEffectiveRate / (1 - marginEmp / 100);
                    setValue("clientRateZzp" as any, clientRateZzp);
                    setValue("clientRateEmp" as any, clientRateEmp);
                  }}
                  className="flex-1 accent-[#00B37E]"
                />
                <input
                  type="number"
                  min={10}
                  max={300}
                  step={1}
                  value={(() => {
                    const marginZzp = (inputs as any).marginZzp ?? 0;
                    const marginEmp = (inputs as any).marginEmp ?? 0;
                    const clientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
                    const clientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
                    const effectiveZzp = clientRateZzp * (1 - marginZzp / 100);
                    const effectiveEmp = clientRateEmp * (1 - marginEmp / 100);
                    return Math.round(effectiveZzp);
                  })()}
                  onChange={(e) => {
                    const desiredEffectiveRate = Number(e.target.value);
                    const marginZzp = (inputs as any).marginZzp ?? 0;
                    const marginEmp = (inputs as any).marginEmp ?? 0;
                    const clientRateZzp = marginZzp === 0 ? desiredEffectiveRate : desiredEffectiveRate / (1 - marginZzp / 100);
                    const clientRateEmp = marginEmp === 0 ? desiredEffectiveRate : desiredEffectiveRate / (1 - marginEmp / 100);
                    setValue("clientRateZzp" as any, clientRateZzp);
                    setValue("clientRateEmp" as any, clientRateEmp);
                  }}
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-right focus:ring-2 focus:ring-[#00B37E] focus:border-[#00B37E]"
                />
                <span className="text-sm text-gray-500 font-medium">€/uur</span>
              </div>
              <div className="flex items-start justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="space-y-1">
                  <div>Klant betaalt ZZP: {formatCurrencyWithDecimals((() => {
                    const marginZzp = (inputs as any).marginZzp ?? 0;
                    const clientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
                    return clientRateZzp;
                  })())} €/uur</div>
                  <div>Klant betaalt Uitzenden: {formatCurrencyWithDecimals((() => {
                    const marginEmp = (inputs as any).marginEmp ?? 0;
                    const clientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
                    return clientRateEmp;
                  })())} €/uur</div>
                </div>
              </div>
            </div>
            
            {/* Hours per week input */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <label className="text-sm text-gray-600 mb-3 block font-medium">Uren per week</label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min={24}
                  max={40}
                  step={1}
                  value={(inputs as any).hoursPerWeek ?? 36}
                  onChange={(e) => setValue("hoursPerWeek" as any, Number(e.target.value))}
                  className="flex-1 accent-[#00B37E]"
                />
                <input
                  type="number"
                  min={24}
                  max={40}
                  step={1}
                  value={(inputs as any).hoursPerWeek ?? 36}
                  onChange={(e) => setValue("hoursPerWeek" as any, Number(e.target.value))}
                  className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-right focus:ring-2 focus:ring-[#00B37E] focus:border-[#00B37E]"
                />
                <span className="text-sm text-gray-500 font-medium">uur</span>
              </div>
              <div className="flex items-end justify-between text-xs text-gray-500">
                <span>Jaaruren (werkbaar):</span>
                <span className="font-semibold text-gray-700">{getWorkableAnnualHours((inputs as any).hoursPerWeek ?? 36).toLocaleString("nl-NL")} uur</span>
              </div>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className={`text-sm md:text-base font-medium transition-colors ${isSimpleMode ? 'text-gray-900' : 'text-gray-500'}`}>
                Eenvoudig
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isSimpleMode}
                  onChange={(e) => setIsSimpleMode(!e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00B37E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B37E]"></div>
              </label>
              <span className={`text-sm md:text-base font-medium transition-colors ${!isSimpleMode ? 'text-gray-900' : 'text-gray-500'}`}>
                Gedetailleerd
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {isSimpleMode 
                ? "Snelle vergelijking met basisinstellingen - zie alleen het belangrijkste verschil"
                : "Uitgebreide vergelijking met alle berekeningen, marges, werkgeverslasten en gedetailleerde breakdowns"}
            </p>
          </div>
        </section>

        {isSimpleMode ? (
          <section className="mb-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SimpleMode inputs={inputs} onInputChange={setValue as any} />
            </div>
          </section>
        ) : (
          <>
            {/* Calculator Section - Visible on both Mobile and Desktop */}
            <section className="mb-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Calculator values={inputs as any} onChange={setValue as any} />
              </div>
            </section>

            {/* Detailed Results with Tabs */}
            <section ref={exportRef} className="space-y-6">
              <DetailedResults data={result} inputs={inputs} />
            </section>
          </>
        )}

        {!isSimpleMode && (
          <>
            {/* <div className="mt-6 flex flex-wrap items-center gap-3">
              <button 
                onClick={exportPdf} 
                className="flex-1 md:flex-none rounded-lg bg-[#00B37E] px-6 py-3 text-white shadow-md hover:opacity-95 active:opacity-90 font-medium touch-manipulation transition-opacity"
              >
                Export as PDF
              </button>
              <button 
                onClick={copyResults} 
                className="flex-1 md:flex-none rounded-lg border border-gray-200 px-6 py-3 shadow-sm hover:bg-gray-50 active:bg-gray-100 font-medium touch-manipulation transition-colors"
              >
                Copy Results
              </button>
            </div> */}

            {/* <footer className="mt-8 rounded-2xl border border-gray-100 bg-white p-4 md:p-5 text-xs md:text-sm text-gray-600 shadow-sm leading-relaxed">
              {result.diffPercent >= 0 ? 'Verdient' : 'Krijgt'} een ZZP'er netto ongeveer {Math.abs(result.diffPercent * 100).toFixed(1)}% {result.diffPercent >= 0 ? 'meer' : 'minder'} dan bij uitzenden bij de huidige tarieven (ZZP: {formatCurrencyWithDecimals((inputs as any).clientRateZzp ?? inputs.rate)}/uur, Uitzenden: {formatCurrencyWithDecimals((inputs as any).clientRateEmp ?? inputs.rate)}/uur). Let op: pensioen percentages en marges kunnen verschillen. De echte verschillen zitten in zekerheid versus vrijheid.
            </footer> */}
          </>
        )}

        {/* Informatie blok - Altijd zichtbaar */}
        <section className="mb-6">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Hoe werkt dit?</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Bij ZZP moet je zelf pensioen regelen, verzekeringen betalen en reserves aanleggen</li>
              <li>• Bij uitzenden regelt het uitzendbureau dit allemaal voor je</li>
              <li>• Daarom kan je als uitzendkracht soms netto meer overhouden, ondanks een lager tarief</li>
              <li>• De keuze gaat vooral om zekerheid (uitzenden) versus vrijheid (ZZP)</li>
            </ul>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="mb-6 mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 leading-relaxed">
            <p className="font-medium text-gray-600 mb-2">Disclaimer</p>
            <p className="mb-2">
              Deze calculator is uitsluitend bedoeld als indicatief hulpmiddel. De berekeningen zijn gebaseerd op algemene aannames en standaard tarieven voor 2026. Werkelijke bedragen kunnen afwijken door individuele omstandigheden, wijzigingen in wetgeving, specifieke arbeidsvoorwaarden en andere factoren.
            </p>
            <p className="mb-2">
              Aan de resultaten van deze calculator kunnen geen rechten worden ontleend. Wij aanvaarden geen aansprakelijkheid voor beslissingen die worden genomen op basis van deze berekeningen. Raadpleeg altijd een belastingadviseur, accountant of andere deskundige voor persoonlijk advies.
            </p>
            <p>
              De maker van deze tool is niet verantwoordelijk voor eventuele fouten of onjuistheden in de berekeningen of voor schade die voortvloeit uit het gebruik van deze calculator.
            </p>
          </div>
        </section>
      </div>
      
      {/* Sticky Comparison Footer - Only in Expert Mode */}
      {!isSimpleMode && <StickyComparisonFooter data={result} inputs={inputs} />}
    </div>
  );
}
