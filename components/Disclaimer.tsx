import React from 'react';

export function Disclaimer() {
  // Amber color palette matching the border color rgba(251, 191, 36, 1) = #fbbf24 (amber-400)
  // Using shades that match the amber background and border
  const amberColors = {
    background: '#fffbeb', // amber-50
    border: '#fbbf24', // amber-400 (matches current border)
    icon: '#d97706', // amber-600 (darker for icon)
    heading: '#92400e', // amber-800 (dark for heading)
    text: '#78350f', // amber-900 (darkest for body text, good contrast)
    strong: '#92400e', // amber-800 (for strong text)
  };

  return (
    <section className="pb-8 mt-3">
      <div 
        className="p-4 rounded-2xl" 
        style={{ 
          background: amberColors.background,
          borderWidth: '1px 1px 1px 4px', 
          borderStyle: 'solid', 
          borderColor: amberColors.border 
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg 
              className="w-5 h-5 mt-0.5" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              style={{ color: amberColors.icon }}
            >
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="cnds-label-small mb-1" style={{ color: amberColors.heading }}>
              Indicatieve berekening
            </h3>
            <p className="cnds-body-small" style={{ color: amberColors.text }}>
              Deze calculator geeft een <strong style={{ color: amberColors.strong }}>realistische indicatie</strong> van je netto inkomen en arbeidsvoorwaarden. 
              De exacte bedragen op je loonstrook kunnen afwijken door individuele omstandigheden, 
              verschillende CAO-afspraken, loonheffingskortingen, en andere persoonlijke factoren. 
              Gebruik deze tool als richtlijn, niet als definitieve berekening. 
              <strong style={{ color: amberColors.strong }}> En er kunnen geen rechten aan worden ontleend.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
