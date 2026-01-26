"use client";

import React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'settings' | 'tab';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * Button component with exact production styling using CNDS tokens
 * 
 * Variants:
 * - primary: Blue background, white text (for main actions)
 * - secondary: White background, gray border (for secondary actions)
 * - text: Transparent background, text only (for text buttons)
 * - settings: Dark gray background (for settings button)
 * - tab: Tab navigation style (for tab buttons)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = `
    transition-colors
    cursor-pointer
    font-medium
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: `
      bg-[var(--color-brand-blue)]
      text-[var(--color-white)]
      hover:opacity-90
      focus:ring-[var(--color-brand-blue)]
      border
      border-[var(--color-brand-blue)]
    `,
    secondary: `
      bg-[var(--color-surface-default)]
      text-[var(--color-foreground-default)]
      border-2
      border-[var(--color-border-subtle)]
      hover:border-[var(--color-border-strong)]
      hover:text-[var(--color-foreground-default)]
      focus:ring-[var(--color-brand-blue)]
    `,
    text: `
      bg-transparent
      text-[var(--color-foreground-default)]
      hover:text-[var(--color-foreground-muted)]
      focus:ring-[var(--color-brand-blue)]
    `,
    settings: `
      bg-[var(--color-surface-dark)]
      text-[var(--color-white)]
      hover:opacity-90
      focus:ring-[var(--color-surface-dark)]
      shadow-lg
    `,
    tab: `
      bg-transparent
      text-[var(--color-foreground-muted)]
      hover:text-[var(--color-foreground-default)]
      focus:ring-[var(--color-brand-blue)]
      border-b-[3px]
      border-transparent
      data-[active=true]:border-[var(--color-foreground-default)]
      data-[active=true]:text-[var(--color-foreground-default)]
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Special handling for rounded-full (settings button)
  const roundedStyles = variant === 'settings' ? 'rounded-full' : 'rounded-lg';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
