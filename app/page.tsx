"use client";

import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-900 scroll-smooth" style={{ paddingTop: '16px' }}>
      <div className="mx-auto max-w-4xl px-4">
        {/* Navigation */}
        <nav className="bg-white rounded-[20px] mb-6" style={{ boxShadow: 'rgba(13, 13, 18, 0.05) 0px 2px 4px 0px', paddingTop: '12px', paddingBottom: '12px', paddingLeft: '12px', paddingRight: '12px', height: '56px', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        </nav>
      </div>
      
      {/* Calculator */}
      <Calculator />
    </div>
  );
}
