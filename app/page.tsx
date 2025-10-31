"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Calculator from "@/components/Calculator";
import SimpleMode from "@/components/SimpleMode";
import ResultChart from "@/components/ResultChart";
import { CalculatorInputs, calculateAll, defaultInputs, formatCurrency, formatCurrencyWithDecimals, formatPercent } from "@/lib/calculations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
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
    <div className="min-h-screen bg-[#f8fafc] text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <h1 className="text-2xl md:text-3xl font-bold flex-1">
              ZZP vs Uitzenden Vergelijker
            </h1>
            <div className="flex-1 flex justify-end">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isSimpleMode}
                  onChange={(e) => setIsSimpleMode(!e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00B37E]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00B37E]"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {isSimpleMode ? 'Eenvoudig' : 'Expert'}
                </span>
              </label>
            </div>
          </div>
          <p className="mt-2 text-gray-600">
            {isSimpleMode 
              ? "Vergelijk snel je netto inkomen als ZZP'er vs uitzenden in loondienst."
              : "Vergelijk netto inkomen per maand met reële aannames (2026). Alle berekeningen gaan uit van 12 maanden (jaar)."}
          </p>
        </header>

        {isSimpleMode ? (
          <section className="mb-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <SimpleMode inputs={inputs} onInputChange={setValue as any} />
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <Calculator values={inputs as any} onChange={setValue as any} />
              </div>
            </section>

            <section ref={exportRef} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ZZP Column */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">ZZP</h2>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Netto per maand:</div>
                <div className="text-2xl font-bold">{formatCurrencyWithDecimals(result.zzp.nettoMaand)}</div>
              </div>
              <ResultChart data={result} type="zzp" />
            </div>
            
            {/* Uitzenden Column */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Uitzenden</h2>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Netto per maand:</div>
                <div className="text-2xl font-bold">{formatCurrencyWithDecimals(result.emp.nettoMaand)}</div>
              </div>
              <ResultChart data={result} type="uitzenden" />
            </div>
          </div>
        </section>
          </>
        )}

        {!isSimpleMode && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={exportPdf} className="rounded-lg bg-[#00B37E] px-4 py-2 text-white shadow hover:opacity-95">Export as PDF</button>
              <button onClick={copyResults} className="rounded-lg border border-gray-200 px-4 py-2 shadow-sm hover:bg-gray-50">Copy Results</button>
            </div>

            <footer className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
              {result.diffPercent >= 0 ? 'Verdient' : 'Krijgt'} een ZZP'er netto ongeveer {Math.abs(result.diffPercent * 100).toFixed(1)}% {result.diffPercent >= 0 ? 'meer' : 'minder'} dan bij uitzenden bij de huidige tarieven (ZZP: €{(inputs as any).clientRateZzp ?? inputs.rate}/uur, Uitzenden: €{(inputs as any).clientRateEmp ?? inputs.rate}/uur). Let op: pensioen percentages en marges kunnen verschillen. De echte verschillen zitten in zekerheid versus vrijheid.
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
