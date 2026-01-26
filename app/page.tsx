"use client";

import Calculator from "@/components/Calculator";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--color-foreground-default)] scroll-smooth pt-4" style={{ background: 'var(--color-surface-sunken)' }}>
      {/* Navigation - wrapper matches Calculator sections */}
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
        <nav className="bg-[var(--color-surface-hero)] rounded-[20px] mb-3 py-2.5 flex items-center transition-colors" style={{ boxShadow: 'var(--shadow-m)', height: '64px', paddingLeft: 'var(--spacing-xl)', paddingRight: 'var(--spacing-xl)' }}>
          <Logo />
        </nav>
      </div>
      
      {/* Calculator */}
      <Calculator />
    </div>
  );
}
