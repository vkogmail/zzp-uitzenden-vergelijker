import React from 'react';

export function Disclaimer() {
  return (
    <section className="pb-8 mt-3">
      <div className="bg-amber-50 p-4 rounded-lg" style={{ borderWidth: '1px 1px 1px 4px', borderStyle: 'solid', borderColor: 'rgba(251, 191, 36, 1)' }}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-amber-900 mb-1">Indicatieve berekening</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              Deze calculator geeft een <strong>realistische indicatie</strong> van je netto inkomen en arbeidsvoorwaarden. 
              De exacte bedragen op je loonstrook kunnen afwijken door individuele omstandigheden, 
              verschillende CAO-afspraken, loonheffingskortingen, en andere persoonlijke factoren. 
              Gebruik deze tool als richtlijn, niet als definitieve berekening. 
              <strong> En er kunnen geen rechten aan worden ontleend.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
