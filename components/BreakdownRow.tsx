"use client";

import React from 'react';
import { InfoTooltip } from '@/components/InfoTooltip';
import { formatCurrencyDecimals, formatHourlyRate } from '@/lib/formatters';

interface BreakdownRowProps {
  label: string;
  value: number;
  highlight?: boolean;
  monthlyHours: number;
  tooltip?: string | React.ReactNode;
}

export function BreakdownRow({ label, value, highlight = false, monthlyHours, tooltip }: BreakdownRowProps) {
  return (
    <div className="flex justify-between items-center text-sm gap-2">
      <span className="text-gray-600 flex items-center gap-1.5">
        {label}
        {tooltip && <InfoTooltip content={tooltip} side="right" />}
      </span>
      <div className="text-right">
        <span className="font-medium block text-gray-900">
          {formatCurrencyDecimals(value)}
        </span>
        <span className="text-[10px] text-gray-400 block">
          {formatHourlyRate(value, monthlyHours)} /u
        </span>
      </div>
    </div>
  );
}
