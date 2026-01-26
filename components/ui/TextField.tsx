"use client";

import React from 'react';
import { cn } from './utils';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * TextField component with exact production styling using CNDS tokens
 * 
 * Matches the production input styling:
 * - Border, padding, font styling
 * - Focus states (ring and border)
 * - Hover states
 * - Disabled states
 */
export function TextField({
  label,
  error,
  helperText,
  className,
  ...props
}: TextFieldProps) {
  const baseStyles = `
    w-full
    px-[var(--spacing-l)]
    py-[var(--spacing-m)]
    text-sm
    font-bold
    border
    border-[var(--color-border-subtle)]
    rounded-[var(--radius-m)]
    focus:outline-none
    focus:ring-2
    focus:ring-[var(--color-brand-blue)]
    focus:border-[var(--color-brand-blue)]
    hover:border-[var(--color-border-strong)]
    transition-colors
    cursor-text
    disabled:cursor-not-allowed
    disabled:opacity-50
    disabled:bg-[var(--color-surface-sunken)]
  `;

  const errorStyles = error ? `
    border-[var(--color-status-error)]
    focus:ring-[var(--color-status-error)]
    focus:border-[var(--color-status-error)]
  ` : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-foreground-default)]">
          {label}
        </label>
      )}
      <input
        type="text"
        className={cn(baseStyles, errorStyles, className)}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--color-status-error)]">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-[var(--color-foreground-muted)]">{helperText}</p>
      )}
    </div>
  );
}
