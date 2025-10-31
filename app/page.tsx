"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Calculator from "@/components/Calculator";
import ResultTable from "@/components/ResultTable";
import ResultChart from "@/components/ResultChart";
import { CalculatorInputs, calculateAll, defaultInputs, formatCurrency, formatPercent } from "@/lib/calculations";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
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
          <h1 className="text-2xl md:text-3xl font-bold">
            ZZP vs Uitzenden Vergelijker
          </h1>
          <p className="mt-2 text-gray-600">Vergelijk netto inkomen per maand met reële aannames (2026). Alle berekeningen gaan uit van 12 maanden (jaar).</p>
        </header>

        <section className="mb-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Calculator values={inputs as any} onChange={setValue as any} />
          </div>
        </section>

        <section ref={exportRef} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">Resultaten</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-sm text-gray-600">Netto per maand:</span>
                <span className="text-2xl font-bold text-[#00B37E]">{formatCurrency(result.zzp.nettoMaand)}</span>
                <span className="text-gray-400">vs</span>
                <span className="text-2xl font-bold">{formatCurrency(result.emp.nettoMaand)}</span>
              </div>
            </div>
            <ResultChart data={result} />
          </div>

          <ResultTable data={result} />
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={exportPdf} className="rounded-lg bg-[#00B37E] px-4 py-2 text-white shadow hover:opacity-95">Export as PDF</button>
          <button onClick={copyResults} className="rounded-lg border border-gray-200 px-4 py-2 shadow-sm hover:bg-gray-50">Copy Results</button>
        </div>

        <footer className="mt-8 rounded-2xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
          Bij gelijke voorwaarden (uurtarief €{inputs.rate}) {result.diffPercent >= 0 ? 'verdient' : 'krijgt'} een ZZP'er netto ongeveer {Math.abs(result.diffPercent * 100).toFixed(1)}% {result.diffPercent >= 0 ? 'meer' : 'minder'} dan bij uitzenden, mits vakantiegeld en pensioen eerlijk worden meegerekend. De echte verschillen zitten in zekerheid versus vrijheid.
        </footer>
      </div>
    </div>
  );
}
