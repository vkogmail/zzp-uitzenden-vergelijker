"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ComparisonResult } from "@/lib/calculations";

export default function ResultChart({ data }: { data: ComparisonResult }) {
  const chartData = [
    {
      name: "Netto p/m",
      ZZP: Math.round(data.zzp.nettoMaand),
      Uitzenden: Math.round(data.emp.nettoMaand),
    },
  ];

  return (
    <div className="h-64 w-full rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v: number) => `${new Intl.NumberFormat("nl-NL").format(v)} €`} />
          <Legend />
          <Bar dataKey="ZZP" fill="#00B37E" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Uitzenden" fill="#a1a1aa" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


