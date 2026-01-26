"use client";

import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--color-foreground-default)] scroll-smooth pt-4" style={{ background: 'var(--color-surface-sunken)' }}>
      {/* Navigation - wrapper matches Calculator sections */}
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
        <nav className="bg-[var(--color-surface-default)] rounded-[20px] mb-3 py-2.5 flex items-center" style={{ boxShadow: 'var(--shadow-m)', height: '64px', paddingLeft: 'var(--spacing-xl)', paddingRight: 'var(--spacing-xl)' }}>
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        </nav>
      </div>
      
      {/* Calculator */}
      <Calculator />
    </div>
  );
}
