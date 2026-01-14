"use client";

import { useEffect } from 'react';

export default function FontTestPage() {
  useEffect(() => {
    // Log font info to console
    if (typeof window !== 'undefined') {
      const h1 = document.querySelector('h1');
      if (h1) {
        const computed = window.getComputedStyle(h1);
        console.log('H1 computed font-family:', computed.fontFamily);
        console.log('CSS variable --font-rebond:', getComputedStyle(document.documentElement).getPropertyValue('--font-rebond'));
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">Font Loading Test</h1>
        
        {/* Test Rebond Grotesque */}
        <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Rebond Grotesque Tests</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">H1 with text-4xl font-extrabold:</p>
              <h1 className="text-4xl font-extrabold text-gray-900">
                Van klanttarief naar jouw inkomen: helder en eerlijk
              </h1>
              <p className="text-xs text-gray-500 mt-2">
                Expected: Rebond Grotesque | CSS: var(--font-rebond) first
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">H1 with text-5xl font-bold:</p>
              <h1 className="text-5xl font-bold text-gray-900">
                Test Heading 5xl Bold
              </h1>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Text 3xl font-bold:</p>
              <div className="text-3xl font-bold text-gray-900">
                Large Currency Number: € 1.234,56
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Text 2xl font-bold:</p>
              <div className="text-2xl font-bold text-gray-900">
                Medium Currency: € 567,89
              </div>
            </div>
          </div>
        </section>

        {/* Test Geist Sans */}
        <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Geist Sans Tests</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">H2 (should use Geist):</p>
              <h2 className="text-3xl font-bold text-gray-900">
                This is an H2 heading
              </h2>
              <p className="text-xs text-gray-500 mt-2">
                Expected: Geist Sans
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Body text (default):</p>
              <p className="text-base text-gray-900">
                This is regular body text. It should use Geist Sans as the default font family.
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>
        </section>

        {/* Font Variable Debug */}
        <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Font Variable Debug</h2>
          
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-600">--font-rebond:</span>
              <span className="ml-2 text-gray-900" style={{ fontFamily: 'var(--font-rebond)' }}>
                Sample text with var(--font-rebond)
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">--font-geist-sans:</span>
              <span className="ml-2 text-gray-900" style={{ fontFamily: 'var(--font-geist-sans)' }}>
                Sample text with var(--font-geist-sans)
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Direct "Rebond Grotesque":</span>
              <span className="ml-2 text-gray-900" style={{ fontFamily: '"Rebond Grotesque", sans-serif' }}>
                Sample text with "Rebond Grotesque"
              </span>
            </div>
            
            <div>
              <span className="text-gray-600">Using rebondGrotesque directly:</span>
              <span className="ml-2 text-gray-900" style={{ fontFamily: 'rebondGrotesque, sans-serif' }}>
                Sample text with rebondGrotesque (no quotes)
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Font Loading API Check:</p>
              <button 
                onClick={async () => {
                  if ('fonts' in document) {
                    try {
                      const loaded = await (document as any).fonts.check('1em rebondGrotesque');
                      console.log('Font rebondGrotesque loaded:', loaded);
                      alert(`Font rebondGrotesque is ${loaded ? 'LOADED ✓' : 'NOT LOADED ✗'}`);
                    } catch (e) {
                      console.error('Font check error:', e);
                      alert('Error checking font: ' + e);
                    }
                  } else {
                    alert('Font Loading API not supported in this browser');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Check if rebondGrotesque is Loaded
              </button>
            </div>
          </div>
        </section>

        {/* Computed Styles Info */}
        <section className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Browser Info</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Check the browser DevTools to see computed font-family values</p>
            <p>In Safari: Right-click → Inspect Element → Computed tab → font-family</p>
            <p>In Chrome: Right-click → Inspect → Computed → font-family</p>
          </div>
        </section>
      </div>
    </div>
  );
}
