"use client";

import React from 'react';
import { 
  Calculator as CalculatorIcon, 
  Briefcase, 
  PiggyBank, 
  TrendingUp,
  Building2,
  Receipt,
  Wallet
} from 'lucide-react';
import { type ValueBreakdown } from '@/lib/calculations';

// Value labels for breakdown categories
export const VALUE_LABELS: Record<keyof Omit<ValueBreakdown, 'total'>, string> = {
  marge: 'Marge',
  kosten: 'Bedrijfskosten',
  belasting: 'Belastingen Premies en afdrachten',
  pensioen: 'Pensioen',
  netto: 'Totaal te Ontvangen / te Besteden',
};

// Icons for each value type
export const VALUE_ICONS: Record<keyof Omit<ValueBreakdown, 'total'>, React.ComponentType<{ className?: string }>> = {
  marge: TrendingUp,
  kosten: Building2,
  pensioen: PiggyBank,
  belasting: Receipt,
  netto: Wallet,
};

// Colors for both Detacheren and ZZP (using CSS variables from globals.css)
export const VALUE_COLORS_ZZP = {
  marge: 'bg-marge-100 text-marge-text',
  kosten: 'bg-kosten-100 text-kosten-text',
  pensioen: 'bg-pensioen-100 text-pensioen-text',
  belasting: 'bg-belasting-100 text-belasting-text',
  netto: 'bg-netto-100 text-netto-text',
} as const;

// Use same light shades for Detacheren
export const VALUE_COLORS_DETACHEREN = VALUE_COLORS_ZZP;

interface ValueBlockProps {
  title: string;
  subtitle: string;
  total: number;
  totalLabel: string;
  breakdown: ValueBreakdown;
  formatCurrency: (n: number) => string;
  variant: 'detacheren' | 'zzp';
  baseTotal?: number;
  correction?: number;
}

export function ValueBlock({
  title,
  subtitle,
  total,
  totalLabel,
  breakdown,
  formatCurrency,
  variant,
  baseTotal,
  correction,
}: ValueBlockProps) {
  const keys: (keyof Omit<ValueBreakdown, 'total'>)[] = ['marge', 'kosten', 'pensioen', 'belasting', 'netto'];
  
  // Calculate percentages for vertical bar chart
  // Use baseTotal for percentage calculation if provided (to align charts)
  const totalValue = keys.reduce((sum, k) => sum + Math.max(0, breakdown[k]), 0);
  const percentageBase = baseTotal ?? totalValue;
  
  // Total height for the vertical bar chart (in pixels)
  const CHART_HEIGHT = 500;
  
  // Use baseTotal if provided, otherwise use total
  const displayTotal = baseTotal ?? total;
  
  return (
    <div className="flex flex-col h-full">
      {/* Header - compact on mobile */}
      <div className="flex items-start gap-2 mb-2 mobile:mb-4">
        {variant === 'detacheren' ? (
          <Briefcase className="w-4 h-4 mobile:w-5 mobile:h-5 text-blue-600 mt-0.5 mobile:mt-1" />
        ) : (
          <CalculatorIcon className="w-4 h-4 mobile:w-5 mobile:h-5 text-green-600 mt-0.5 mobile:mt-1" />
        )}
        <div>
          <h3 className="text-sm mobile:text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-xs mobile:text-sm text-gray-500 hidden mobile:block">{subtitle}</p>
        </div>
      </div>
      
      {/* Total - compact on mobile */}
      <div className="mb-2 mobile:mb-4">
        <div className="flex flex-col mobile:flex-row mobile:justify-between mobile:items-start">
          <div className="hidden mobile:block">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{totalLabel}</div>
            <div className="text-xs text-gray-400">
              {variant === 'detacheren' 
                ? 'Inclusief vakantiedagen en feestdagen' 
                : 'Exclusief vakantiedagen en feestdagen'}
            </div>
          </div>
          <div className="text-2xl mobile:text-2xl font-bold text-gray-900 leading-none">{formatCurrency(displayTotal)}</div>
        </div>
      </div>
      
      {/* Mobile: Vertical Stacked Bar Chart (label top, icon+amount bottom) */}
      <div className="mobile:hidden flex flex-col gap-0.5 flex-1">
        {keys.map((k) => {
          const v = breakdown[k];
          if (v <= 0) return null;
          const percentage = (v / percentageBase) * 100;
          const colorSet = variant === 'detacheren' ? VALUE_COLORS_DETACHEREN : VALUE_COLORS_ZZP;
          const bgColor = colorSet[k].split(' ')[0];
          const textColor = colorSet[k].split(' ')[1];
          const Icon = VALUE_ICONS[k];
          
          return (
            <div
              key={k}
              className={`${bgColor} flex flex-col justify-between px-3 pt-2 pb-2 transition-all duration-500 rounded`}
              style={{ flex: `${percentage} 0 0`, minHeight: '60px' }}
            >
              <span className={`text-xs font-medium ${textColor} leading-tight`}>
                {VALUE_LABELS[k]}
              </span>
              <div className="flex items-center justify-between shrink-0">
                <Icon className={`w-4 h-4 ${textColor} shrink-0`} />
                <span className={`text-sm font-bold ${textColor}`}>
                  {formatCurrency(v)}
                </span>
              </div>
            </div>
          );
        })}
        {correction !== undefined && correction > 0 && (
          <div
            className="rounded border border-gray-300 flex flex-col justify-between px-3 py-2 overflow-visible"
            style={{ 
              flex: `${(correction / percentageBase) * 100} 0 0`,
              minHeight: '70px',
              background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(156, 163, 175, 0.15) 4px, rgba(156, 163, 175, 0.15) 5px)'
            }}
          >
            <span className="text-[10px] font-medium text-gray-500 leading-tight">
              Reservering vakantie- en feestdagen
            </span>
            <div className="flex items-center justify-between shrink-0 mt-auto">
              <Receipt className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs font-bold text-gray-500">
                - {formatCurrency(correction)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop: Vertical Stacked Bar Chart */}
      <div className="hidden mobile:flex flex-col gap-1" style={{ height: CHART_HEIGHT }}>
        {keys.map((k) => {
          const v = breakdown[k];
          if (v <= 0) return null;
          const percentage = (v / percentageBase) * 100;
          const colorSet = variant === 'detacheren' ? VALUE_COLORS_DETACHEREN : VALUE_COLORS_ZZP;
          const bgColor = colorSet[k].split(' ')[0];
          const textColor = colorSet[k].split(' ')[1];
          
          // Use center alignment for small bars, top alignment for larger ones
          const isSmallBar = percentage < 15;
          const Icon = VALUE_ICONS[k];
          
          return (
            <div
              key={k}
              className={`${bgColor} flex justify-between ${isSmallBar ? 'items-center' : 'items-start pt-3'} px-4 transition-all duration-500 rounded-lg`}
              style={{ height: `${percentage}%`, minHeight: '40px' }}
            >
              <div className="flex flex-col">
                <span className={`text-sm font-semibold ${textColor} flex items-center gap-1.5`}>
                  <Icon className="w-4 h-4" />
                  {VALUE_LABELS[k]}
                </span>
                {k === 'netto' && variant === 'detacheren' && (
                  <span className={`text-xs ${textColor} opacity-75 mt-0.5`}>
                    inclusief reservering voor vakantiedagen en feestdagen
                  </span>
                )}
              </div>
              <span className={`text-sm font-bold ${textColor}`}>
                {formatCurrency(v)}
              </span>
            </div>
          );
        })}
        {/* Hatched empty section for ZZP to show the correction difference */}
        {correction !== undefined && correction > 0 && (
          <div
            className="rounded-lg border border-gray-300 flex justify-between items-center px-4"
            style={{ 
              height: `${(correction / percentageBase) * 100}%`,
              minHeight: '40px',
              background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(156, 163, 175, 0.1) 10px, rgba(156, 163, 175, 0.1) 12px)'
            }}
          >
            <span className="text-sm font-semibold text-gray-500">Reservering vakantiedagen en feestdagen</span>
            <span className="text-sm font-bold text-gray-600">- {formatCurrency(correction)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
