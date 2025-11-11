"use client";

import { ComparisonResult, formatCurrency, formatCurrencyWithDecimals } from "@/lib/calculations";

export default function ResultTable({ data }: { data: ComparisonResult }) {
  const { zzp, emp } = data;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Post</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ZZP</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Uitzenden</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-4 py-3 text-sm text-gray-600">Netto per maand</td>
            <td className="px-4 py-3 font-semibold">{formatCurrencyWithDecimals(zzp.nettoMaand)}</td>
            <td className="px-4 py-3 font-semibold">{formatCurrencyWithDecimals(emp.nettoMaand)}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-600">Netto per jaar</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(zzp.nettoJaar)}</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(emp.nettoJaar)}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-600">Vakantiegeld (in netto inbegrepen)</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(zzp.vakantiegeld)}</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(emp.vakantiegeldEmp)}</td>
          </tr>
          <tr>
            <td className="px-4 py-3 text-sm text-gray-600">Pensioen (werknemer)</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(zzp.pensioen)}</td>
            <td className="px-4 py-3">{formatCurrencyWithDecimals(emp.pensioenWerknemer)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


