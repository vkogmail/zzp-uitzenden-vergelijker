"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calculator from "@/components/Calculator";
import SimpleMode from "@/components/SimpleMode";
import DetailedResults from "@/components/DetailedResults";
import StickyComparisonFooter from "@/components/StickyComparisonFooter";
import { CalculatorInputs, calculateAll, defaultInputs, formatCurrency, formatCurrencyWithDecimals, formatPercent, getWorkableAnnualHours, setActivePresetConfig, getActivePresetConfig } from "@/lib/calculations";
import BASELINE from "@/data/presets/current_2025_baseline.json";
import STIPP_BASIS_2026 from "@/data/presets/stipp_basis_2026_draft.json";
import STIPP_PLUS_2026 from "@/data/presets/stipp_plus_2026_draft.json";
import GEMEENTEN_2026 from "@/data/presets/gemeenten_2026_draft.json";
import GENERIEK_2026 from "@/data/presets/generiek_2026_draft.json";
import BANKEN_2026 from "@/data/presets/banken_2026_draft.json";
import RABOBANK_2025 from "@/data/presets/cao_rabobank_2025.json";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [preset, setPreset] = useState<string>("baseline");
  const [showPresetOverlay, setShowPresetOverlay] = useState<boolean>(false);
  const presets = {
    baseline: { label: "Baseline (huidig)", config: BASELINE },
    stipp_basis_2026: { label: "ABU/NBBU • StiPP Basis 2026 (draft)", config: STIPP_BASIS_2026 },
    stipp_plus_2026: { label: "ABU/NBBU • StiPP Plus 2026 (draft)", config: STIPP_PLUS_2026 },
    gemeenten_2026: { label: "Gemeenten 2026 (draft)", config: GEMEENTEN_2026 },
    banken_2026: { label: "Banken 2026 (draft)", config: BANKEN_2026 },
    generiek_2026: { label: "Generiek 2026 (draft)", config: GENERIEK_2026 },
    rabobank_2025: { label: "Rabobank cao 2024–2025", config: RABOBANK_2025 },
  } as const;

  // Initialize active preset (and update when preset changes)
  useEffect(() => {
    const cfg = (presets as any)[preset]?.config ?? BASELINE;
    setActivePresetConfig(cfg);
    // Sync visible inputs for labels that depend on config (vakantiegeld%, wg%)
    const vg = ((cfg as any)?.emp?.employer?.vacationPct as number | undefined) ?? ((cfg as any)?.vakantiegeldPct as number | undefined);
    const wg = (cfg as any)?.emp?.employer?.employerTotalPct as number | undefined;
    setInputs((prev) => ({
      ...prev,
      ...(vg != null ? { vacation: vg } : {}),
      ...(wg != null ? { employerTotalPct: wg } : {}),
    }));
  }, [preset]);
  const [isSimpleMode, setIsSimpleMode] = useState(true); // Default: simple mode
  const result = useMemo(() => calculateAll(inputs), [inputs, preset]);
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
    <div className="min-h-screen text-gray-900 scroll-smooth" style={{ paddingTop: '16px' }}>
      <div className="mx-auto max-w-4xl px-4">
        {/* Navigation */}
        <nav className="bg-white rounded-[20px] mb-6" style={{ boxShadow: 'rgba(13, 13, 18, 0.05) 0px 2px 4px 0px', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', height: '56px', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        </nav>
      </div>
      
      <div className={`mx-auto max-w-4xl px-4 py-10 ${isSimpleMode ? 'pb-10' : 'pb-72'}`}>
        <header className="mb-4">
          <h1 className="ty-h1 text-center mb-3">
            ZZP vs Uitzenden Vergelijker
          </h1>
          <p className="ty-body-lg text-center mb-4">
            Vergelijk netto inkomen per maand met reële aannames (2026). Alle berekeningen gaan uit van 12 maanden (jaar).
          </p>
        </header>

        {/* Preset selector */}
        <section className="mb-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">
              <span className="inline-flex items-center gap-1">
                Kies je CAO
                <span className="group relative inline-flex align-middle">
                  <svg className="w-4 h-4 cursor-help text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute z-10 -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded">
                    Keuze bepaalt percentages (vakantiegeld, Zvw, WKR, pensioen e.d.).
                  </span>
                </span>
              </span>
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="shrink min-w-0 max-w-[280px] rounded-lg border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '12px',
                  paddingRight: '2.5rem'
                }}
              >
                {Object.entries(presets).map(([key, v]) => (
                  <option key={key} value={key}>{v.label}</option>
                ))}
              </select>
              {/* uitleg verplaatst naar tooltip bij label */}
              <button
                type="button"
                onClick={() => setShowPresetOverlay(true)}
                className="ml-auto flex-shrink-0 whitespace-nowrap rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                aria-label="Toon preset JSON"
              >
                Toon preset JSON
              </button>
            </div>
          </div>
        </section>
        {/* Actieve CAO banner (altijd zichtbaar, ook als dropdown straks verdwijnt) */}
        <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs md:text-sm text-blue-900">
          We vergelijken op basis van de cao "{(presets as any)[preset]?.label ?? '—'}"
          {(() => { const cfg = (presets as any)[preset]?.config as any; return cfg?.peildatum ? ` (peildatum ${cfg.peildatum})` : ''; })()}
          .
        </div>

        {/* Hours Input, Rate Input and Toggle Switch - Unified design for both mobile and desktop */}
        <section className="mb-4 space-y-4">
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
          <section className="mb-4 mt-0">
            <SimpleMode inputs={inputs} onInputChange={setValue as any} />
          </section>
        ) : (
          <>
            {/* Calculator Section - Visible on both Mobile and Desktop */}
            <section className="mb-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Calculator values={inputs as any} onChange={setValue as any} />
              </div>
            </section>

            {/* Detailed Results with Tabs */}
            <section ref={exportRef} className="space-y-4">
              <DetailedResults data={result} inputs={inputs} />
            </section>
          </>
        )}

        {!isSimpleMode && (
          <>
            {/* <div className="mt-6 flex flex-wrap items-center gap-3">
              <button 
                onClick={exportPdf} 
                className="flex-1 md:flex-none rounded-lg bg-[#00B37E] px-6 py-3 text:white shadow-md hover:opacity-95 active:opacity-90 font-medium touch-manipulation transition-opacity"
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
            <h3 className="ty-h3 text-blue-900 mb-2">💡 Hoe werkt dit?</h3>
            <ul className="text-xs md:text-sm font-normal text-blue-900 leading-relaxed">
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

      {showPresetOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPresetOverlay(false)} />
          <div className="relative z-[101] w-[min(92vw,900px)] max-h-[80vh] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-semibold text-gray-800">Geselecteerde preset (JSON)</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const cfg = (presets as any)[preset]?.config ?? BASELINE;
                      await navigator.clipboard.writeText(JSON.stringify(cfg, null, 2));
                    } catch {}
                  }}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                >
                  Kopieer
                </button>
                <button
                  type="button"
                  onClick={() => setShowPresetOverlay(false)}
                  className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                  aria-label="Sluiten"
                >
                  Sluiten
                </button>
              </div>
            </div>
            <div className="p-0 overflow-auto" style={{ maxHeight: 'calc(80vh - 44px)' }}>
              <pre className="text-xs m-0 p-4 whitespace-pre-wrap break-words leading-relaxed">
{JSON.stringify(((presets as any)[preset]?.config ?? BASELINE), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
