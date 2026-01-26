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
    <div className="flex justify-between items-center gap-2" style={{ fontSize: 'var(--font-size-sm)' }}>
      <span className="flex items-center gap-1.5" style={{ color: 'var(--color-foreground-muted)' }}>
        {label}
        {tooltip && <InfoTooltip content={tooltip} side="right" />}
      </span>
      <div className="text-right">
        <span className="block" style={{ 
          fontWeight: 'var(--font-weight-medium)', 
          color: 'var(--color-foreground-default)' 
        }}>
          {formatCurrencyDecimals(value)}
        </span>
        <span className="block" style={{ 
          fontSize: '10px', 
          color: 'var(--color-foreground-muted-on-dark)' 
        }}>
          {formatHourlyRate(value, monthlyHours)} /u
        </span>
      </div>
    </div>
  );
}
