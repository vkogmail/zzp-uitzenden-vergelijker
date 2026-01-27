"use client";

import Calculator from "@/components/Calculator";
import { FeedbackButton } from "@/components/FeedbackButton";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-900 scroll-smooth pt-4">
      {/* Navigation - wrapper matches Calculator sections */}
      <div className="max-w-5xl mx-auto" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <nav className="bg-white rounded-[20px] mb-3 py-2.5 flex items-center" style={{ boxShadow: 'rgba(13, 13, 18, 0.05) 0px 2px 4px 0px', height: '72px', paddingLeft: '20px', paddingRight: '16px' }}>
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <FeedbackButton />
        </nav>
      </div>
      
      {/* Calculator */}
      <Calculator />
    </div>
  );
}
