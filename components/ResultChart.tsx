"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ComparisonResult, formatCurrencyWithDecimals } from "@/lib/calculations";

export default function ResultChart({ data, type }: { data: ComparisonResult; type: "zzp" | "detacheren" }) {
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    
    const container = containerRef.current;
    if (!container) return;
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    };
    
    // Use ResizeObserver for better dimension tracking
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    
    resizeObserver.observe(container);
    // Initial check after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 0);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate shared max value for Y-axis to ensure visual consistency
  const nettoMaand = type === "zzp" ? data.zzp.nettoMaand : data.emp.nettoMaand;
  const maxValue = Math.max(data.zzp.nettoMaand, data.emp.nettoMaand);
  const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% padding

  const chartData = [
    {
      name: "Netto p/m",
      value: nettoMaand, // Exact value, no rounding
      label: formatCurrencyWithDecimals(nettoMaand),
    },
  ];

  const shouldRender = isMounted && dimensions.width > 0 && dimensions.height > 0;

  return (
    <div 
      ref={containerRef}
      className="h-72 w-full min-h-[288px]"
    >
      {shouldRender ? (
        <ResponsiveContainer 
          width={dimensions.width || "100%"} 
          height={dimensions.height || 280} 
          minHeight={280} 
          minWidth={0}
        >
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, yAxisMax]} />
            <Tooltip formatter={(v: number) => formatCurrencyWithDecimals(v)} />
            <Bar dataKey="value" fill="#00B37E" radius={[6, 6, 0, 0]}>
              <LabelList 
                dataKey="label" 
                position="top" 
                style={{ fill: '#374151', fontSize: '14px', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Chart wordt geladen...</p>
        </div>
      )}
    </div>
  );
}


