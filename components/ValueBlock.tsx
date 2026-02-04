"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator as CalculatorIcon, 
  Briefcase, 
  PiggyBank, 
  TrendingUp,
  Building2,
  Receipt,
  Wallet,
  Pencil,
  X
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

type EditableKey = 'kosten' | 'pensioen';

// Hover background voor edit-knop: tint van de balkkleur (alleen voor bewerkbare keys)
const VALUE_EDIT_HOVER: Record<EditableKey, string> = {
  kosten: 'hover:bg-kosten-200',
  pensioen: 'hover:bg-pensioen-200',
};

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
  /** Keys that show an edit icon and open a popover to override the value (e.g. voor freelancers) */
  editableKeys?: EditableKey[];
  onEdit?: (key: EditableKey, value: number) => void;
  /** Called when user resets to calculated value */
  onClearEdit?: (key: EditableKey) => void;
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
  editableKeys = [],
  onEdit,
  onClearEdit,
}: ValueBlockProps) {
  const keys: (keyof Omit<ValueBreakdown, 'total'>)[] = ['marge', 'kosten', 'pensioen', 'belasting', 'netto'];
  const [editingKey, setEditingKey] = useState<EditableKey | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editingKeyRef = useRef<EditableKey | null>(null);
  const blurTimestampRef = useRef(0);
  editingKeyRef.current = editingKey;

  const isEditable = (k: string): k is EditableKey =>
    (k === 'kosten' || k === 'pensioen') && editableKeys.includes(k as EditableKey) && !!onEdit;

  const openPopover = (k: EditableKey, e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    setEditingKey(k);
    setEditInputValue(String(Math.round(breakdown[k])));
    setPopoverAnchor(rect);
  };

  const closePopover = () => {
    setEditingKey(null);
    setPopoverAnchor(null);
  };

  useEffect(() => {
    if (editingKey !== null && popoverAnchor) {
      inputRef.current?.focus();
    }
  }, [editingKey, popoverAnchor]);

  // Sluit popover bij scroll zodat hij niet op de verkeerde plek blijft staan.
  // Grace na open en na blur (keyboard dismiss op mobile) zodat scroll niet meteen sluit.
  useEffect(() => {
    if (editingKey === null) return;
    const openedAt = Date.now();
    const GRACE_AFTER_OPEN_MS = 600;
    const GRACE_AFTER_BLUR_MS = 800;
    const onScroll = () => {
      const now = Date.now();
      if (now - openedAt < GRACE_AFTER_OPEN_MS) return;
      if (now - blurTimestampRef.current < GRACE_AFTER_BLUR_MS) return;
      closePopover();
    };
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [editingKey]);

  const handleSaveEdit = () => {
    if (editingKey === null || !onEdit) return;
    const parsed = parseFloat(editInputValue.replace(',', '.'));
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onEdit(editingKey, Math.round(parsed * 100) / 100);
    }
    closePopover();
  };

  // Native keyboard "Done"/checkmark op iOS: blur eerst, dan na korte delay opslaan als popover nog open is.
  // Overlay-klik sluit eerder, dan is editingKeyRef al null en slaan we niet op.
  const handleInputBlur = () => {
    blurTimestampRef.current = Date.now();
    setTimeout(() => {
      if (editingKeyRef.current !== null && onEdit) handleSaveEdit();
    }, 150);
  };
  
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
          const editable = isEditable(k);
          if (v <= 0 && !editable) return null;
          const percentage = (v / percentageBase) * 100;
          const colorSet = variant === 'detacheren' ? VALUE_COLORS_DETACHEREN : VALUE_COLORS_ZZP;
          const bgColor = colorSet[k].split(' ')[0];
          const textColor = colorSet[k].split(' ')[1];
          const Icon = VALUE_ICONS[k];
          
          return (
            <div
              key={k}
              className={`${bgColor} flex flex-col justify-between px-3 pt-2 pb-2 transition-all duration-500 rounded relative`}
              style={{ flex: `${percentage} 0 0`, minHeight: '60px' }}
            >
              <span className={`text-xs font-medium ${textColor} leading-tight`}>
                {VALUE_LABELS[k]}
              </span>
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1">
                  <Icon className={`w-4 h-4 ${textColor} shrink-0`} />
                  {editable && (
                    <button
                      type="button"
                      onClick={(e) => openPopover(k as EditableKey, e)}
                      className={`p-0.5 rounded cursor-pointer ${textColor} ${VALUE_EDIT_HOVER[k as EditableKey]}`}
                      aria-label={`${VALUE_LABELS[k]} aanpassen`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
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
            <span className="text-xs font-medium text-gray-500 leading-tight min-h-[2.5em]">
              Reservering vakantie- en feestdagen
            </span>
            <div className="flex items-center justify-between shrink-0 mt-auto">
              <Receipt className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
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
          const editable = isEditable(k);
          if (v <= 0 && !editable) return null;
          const percentage = (v / percentageBase) * 100;
          const colorSet = variant === 'detacheren' ? VALUE_COLORS_DETACHEREN : VALUE_COLORS_ZZP;
          const bgColor = colorSet[k].split(' ')[0];
          const textColor = colorSet[k].split(' ')[1];
          const isSmallBar = percentage < 15;
          const Icon = VALUE_ICONS[k];
          
          return (
            <div
              key={k}
              className={`${bgColor} flex justify-between ${isSmallBar ? 'items-center' : 'items-start pt-3'} px-4 transition-all duration-500 rounded-lg relative`}
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
              <div className="flex items-center gap-2">
                {editable && (
                  <button
                    type="button"
                    onClick={(e) => openPopover(k as EditableKey, e)}
                    className={`p-1 rounded cursor-pointer ${textColor} ${VALUE_EDIT_HOVER[k as EditableKey]}`}
                    aria-label={`${VALUE_LABELS[k]} aanpassen`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <span className={`text-sm font-bold ${textColor}`}>
                  {formatCurrency(v)}
                </span>
              </div>
            </div>
          );
        })}
        {/* Hatched empty section for ZZP to show the correction difference */}
        {correction !== undefined && correction > 0 && (
          <div
            className="rounded-lg border border-gray-300 flex justify-between items-start gap-2 px-4 py-3 min-w-0 h-fit min-h-[40px]"
            style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(156, 163, 175, 0.1) 10px, rgba(156, 163, 175, 0.1) 12px)'
            }}
          >
            <span className="text-sm font-semibold text-gray-500 min-w-0 break-words h-fit">Reservering vakantiedagen en feestdagen</span>
            <span className="text-sm font-bold text-gray-600 whitespace-nowrap shrink-0">- {formatCurrency(correction)}</span>
          </div>
        )}
      </div>

      {/* Popover in portal op body, direct onder edit-knop (fixed = viewport) */}
      {editingKey !== null && onEdit && popoverAnchor && typeof document !== 'undefined' && createPortal(
        (() => {
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          const pw = 176;
          const ph = 160;
          const gap = 6;
          const buttonCenter = popoverAnchor.left + popoverAnchor.width / 2;
          const left = Math.max(8, Math.min(buttonCenter - pw / 2, vw - pw - 8));
          const arrowLeft = pw / 2 - 6;
          const spaceBelow = vh - (popoverAnchor.bottom + gap);
          const showAbove = spaceBelow < ph && popoverAnchor.top > ph + 12;
          return (
            <>
              <div className="fixed inset-0 z-40" aria-hidden onClick={closePopover} />
              <div
                className="fixed z-50 bg-white rounded-lg border border-gray-200 shadow-lg p-3 w-44 min-w-0"
                style={{
                  left: `${left}px`,
                  ...(showAbove
                    ? { bottom: `${vh - popoverAnchor.top + gap}px` }
                    : { top: `${popoverAnchor.bottom + gap}px` }),
                }}
              >
                <div
                  className={`absolute w-3 h-3 bg-white border-gray-200 rotate-45 ${showAbove ? 'border-r border-b -bottom-1.5' : 'border-l border-t -top-1.5'}`}
                  style={{ left: Math.max(12, Math.min(arrowLeft, pw - 12)) }}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-medium text-gray-700 leading-tight">
                    {VALUE_LABELS[editingKey]}
                  </label>
                  <button
                    type="button"
                    onClick={closePopover}
                    className="flex items-center justify-center p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer shrink-0"
                    aria-label="Sluiten"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  min={0}
                  step={10}
                  value={editInputValue}
                  onChange={(e) => setEditInputValue(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') closePopover(); }}
                  className="w-full min-w-0 box-border px-2.5 py-1.5 text-base border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                />
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-full h-fit py-2 text-xs font-medium bg-gray-900 text-white rounded hover:bg-gray-800 cursor-pointer"
                >
                  Opslaan
                </button>
              </div>
            </>
          );
        })(),
        document.body
      )}
    </div>
  );
}
