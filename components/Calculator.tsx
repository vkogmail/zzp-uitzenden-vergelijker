"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { clsx } from 'clsx';
import { 
  Calculator as CalculatorIcon, 
  ShieldCheck, 
  Briefcase, 
  ChevronDown, 
  ChevronRight, 
  PiggyBank, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  Palmtree,
  Coins,
  Settings
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InfoTooltip } from '@/components/InfoTooltip';
import { ConfigInput } from '@/components/ConfigInput';
import { 
  calculateEmployeeDetailed,
  calculateZZPDetailed,
  calculateZZPTaxReservation,
  employeeResultToComparable,
  zzpResultToComparable,
  defaultCalculatorConfig, 
  type CalculatorConfig,
  type EmployeeResult,
  type ZZPResult,
  type ComparableOutcome
} from '@/lib/calculations';

// CalculatorConfig is imported from lib/calculations.ts

// CAO Presets
type CAOPreset = 'ABU' | 'NBBU' | 'Custom';

const CAOPresets: Record<CAOPreset, Partial<CalculatorConfig>> = {
  ABU: {
    // ABU CAO (Algemene Bond Uitzendondernemingen)
    azvRate: 0.003,
    pawwRate: 0.001,
    hasAZV: true,
    hasPAWW: true,
    holidayHoursRate: 0.1092, // 10.92%
    holidayAllowanceRate: 0.08, // 8%
    yearEndBonusRate: 0.045, // 4.5%
    hasYearEndBonus: true,
    ikbRate: 0.018, // 1.8%
    hasIKB: true,
    employerPensionRate: 0.159, // StiPP Plus
    employeePensionRate: 0.075,
    hourlyFranchise: 9.24, // StiPP 2026: €9,24 per uur
    // Oude implementatie (uitgecommentarieerd):
    // annualFranchise: 19554.24,
  },
  NBBU: {
    // NBBU CAO (Nederlandse Bond van Bemiddelings- en Uitzendondernemingen)
    azvRate: 0.003,
    pawwRate: 0.001,
    hasAZV: true,
    hasPAWW: true,
    holidayHoursRate: 0.1092,
    holidayAllowanceRate: 0.08,
    yearEndBonusRate: 0.0, // Often no year-end bonus in basic NBBU
    hasYearEndBonus: false,
    ikbRate: 0.0, // Often no IKB in basic NBBU
    hasIKB: false,
    employerPensionRate: 0.115, // StiPP Basis
    employeePensionRate: 0.055,
    hourlyFranchise: 9.24, // StiPP 2026: €9,24 per uur
    // Oude implementatie (uitgecommentarieerd):
    // annualFranchise: 19554.24,
  },
  Custom: {}
};

const defaultConfig: CalculatorConfig = defaultCalculatorConfig;

export default function Calculator() {
  const [hourlyRate, setHourlyRate] = useState([93.5]);
  const [hoursPerWeek, setHoursPerWeek] = useState([40]);
  const [config, setConfig] = useState<CalculatorConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedCAO, setSelectedCAO] = useState<CAOPreset>('ABU');
  const [settingsEnabled, setSettingsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'detacheren' | 'zzp'>('comparison');
  
  const applyCAOPreset = (cao: CAOPreset) => {
    setSelectedCAO(cao);
    if (cao !== 'Custom') {
      setConfig({ ...config, ...CAOPresets[cao] });
    }
  };
  
  // Helper function to update config and switch to Custom
  const updateConfig = (updates: Partial<CalculatorConfig>) => {
    setConfig({ ...config, ...updates });
    setSelectedCAO('Custom');
  };

  // Keyboard shortcut to enable/disable settings panel (Cmd+Option+S or Ctrl+Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Option+S (Mac) or Ctrl+Alt+S (Windows/Linux)
      // Check both lowercase and uppercase, and also check keyCode for compatibility
      const isSKey = e.key === 's' || e.key === 'S' || e.keyCode === 83 || e.code === 'KeyS';
      if ((e.metaKey || e.ctrlKey) && e.altKey && isSKey) {
        e.preventDefault();
        e.stopPropagation();
        setSettingsEnabled(prev => !prev);
      }
    };

    // Use capture phase to catch the event earlier
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // --- Calculation Logic ---
  const result = useMemo(() => {
    return calculateEmployeeDetailed(
      hourlyRate[0],
      hoursPerWeek[0],
      config
    );
  }, [hourlyRate, hoursPerWeek, config]);

  const zzpResult = useMemo(() => {
    return calculateZZPDetailed(
      hourlyRate[0],
      hoursPerWeek[0],
      config
    );
  }, [hourlyRate, hoursPerWeek, config]);

  // Comparison mappers (ONLY for comparison header view)
  const detacherenComparable = useMemo(() => employeeResultToComparable(result), [result]);
  const zzpComparable = useMemo(() => zzpResultToComparable(zzpResult, config), [zzpResult, config]);

  // Temporary ZZP tax reservation for comparison (UX bridge, not real tax model)
  // Used for display in comparison view - zzpComparable.netNow already includes this
  const zzpTaxReservation = useMemo(() => calculateZZPTaxReservation(zzpResult, config), [zzpResult, config]);
  const zzpTaxReserve = zzpTaxReservation.taxReserve;
  const zzpNetAfterTaxIndicative = zzpTaxReservation.netAfterTaxIndicative;

  const {
    clientTotal,
    companyTotal,
    candidateTotal,
    grossTotal,
    reservationsTotal,
    taxableTotal,
    taxesTotal,
    netTotal,
    monthlyHours,
    marginBreakdown,
    reservationBreakdown,
    pensionableWage,
    employerPension,
    taxBreakdown,
    additionalBenefits
  } = result;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };
  
  const formatHourly = (val: number, hours: number = monthlyHours) => {
     return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val / hours);
  };

  return (
      <TooltipProvider>
      <div className="min-h-screen bg-gray-50 font-[var(--font-geist-sans)] text-gray-900 pb-20">
      
      {/* Settings Panel - Only visible when enabled via keyboard shortcut (Cmd+Option+S / Ctrl+Alt+S) */}
      {settingsEnabled && (
        <>
          {/* Fixed Configuration Button */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-all z-50 flex items-center gap-2"
            title="Configuratie aanpassen"
          >
            <Settings className="w-6 h-6" />
            {showConfig && <span className="text-sm font-medium pr-2">Sluiten</span>}
          </button>

          {/* Configuration Panel */}
          {showConfig && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-start justify-end p-4 overflow-y-auto" onClick={() => setShowConfig(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gray-800 text-white p-6 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Calculator Configuratie</h2>
                </div>
                <button
                  onClick={() => setConfig(defaultConfig)}
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                >
                  Reset naar standaard
                </button>
              </div>
              <p className="text-gray-300 text-sm mt-2">Pas percentages, CAO-instellingen en berekeningsparameters aan</p>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Berekeningen Uitleg */}
              <div className="space-y-4 bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-lg text-green-900 flex items-center gap-2">
                  <CalculatorIcon className="w-5 h-5" />
                  Hoe werken de berekeningen?
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="detacheren-berekening" className="border-0">
                    <AccordionTrigger className="text-sm font-semibold text-green-800 hover:no-underline py-2">
                      Detacheren Berekening
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-green-700 space-y-3 pt-2">
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 1: Klanttarief → Bruto uurtarief</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Het klanttarief wordt omgezet naar bruto uurtarief via de conversiefactor (standaard 1.9776).
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Bruto uurtarief = Klanttarief × Conversiefactor
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 2: Bedrijfsmarge</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Het bedrijf houdt een marge in (standaard 15%): 5% winst + 10% kosten/risico.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Netto uurtarief = Bruto uurtarief × (1 - Bedrijfsmarge)
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 3: Bruto maandsalaris</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Maandelijkse uren: 52 weken ÷ 12 maanden × uren per week.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Bruto maandsalaris = Netto uurtarief × Maanduren
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 4: Pensioen (StiPP)</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Pensioen wordt berekend op pensioengevend loon (bruto minus franchise van €9,24/uur).
                          Werkgever en werknemer betalen beide een percentage.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Pensioengrondslag = Bruto - (Franchise × Maanduren)<br/>
                          Pensioen = Pensioengrondslag × (Werkgever% + Werknemer%)
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 5: Belastingberekening</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Progressieve belastingschijven (2026): Schijf 1 (35,75%), Schijf 2 (37,56%), Schijf 3 (49,50%).
                          Loonheffingskortingen (arbeidskorting + algemene heffingskorting) worden afgetrokken.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Belastbaar loon = Bruto - Pensioen - AZV - PAWW<br/>
                          Belasting = Progressief berekend per schijf<br/>
                          Netto = Belastbaar - Belasting + Kortingen
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 6: Extra uitkeringen</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Vakantiedagen (10,92%), vakantiegeld (8%), eindejaarsuitkering (4,5%), IKB (1,8%).
                          Deze komen bovenop het netto loon.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="zzp-berekening" className="border-0">
                    <AccordionTrigger className="text-sm font-semibold text-green-800 hover:no-underline py-2">
                      ZZP Berekening
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-green-700 space-y-3 pt-2">
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 1: Bruto omzet</p>
                        <p className="text-xs text-gray-600 mb-2">
                          We gaan uit van 80% factureerbare tijd (vakantie, feestdagen, ziekte, gaten tussen klussen).
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Bruto omzet = Uurtarief × Maanduren × 0.80
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 2: Kosten & Risico</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Ondernemersrisico (10%), overhead (8%: AOV, boekhouder, software, opleiding), buffer (5%: ziekte/gaten).
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Kosten = Omzet × (Risico% + Overhead% + Buffer%)
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 3: Omzet na kosten</p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Omzet na kosten = Bruto omzet - Kosten
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 4: Pensioen (StiPP)</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Zelfde systeem als detacheren: franchise €9,24/uur, werkgever + werknemer percentages.
                          Berekeningsbasis is omzet na kosten (niet bruto).
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Pensioengrondslag = (Omzet na kosten) - (Franchise × Maanduren)<br/>
                          Pensioen = Pensioengrondslag × (Werkgever% + Werknemer%)
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 5: Netto vóór belasting</p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Netto vóór belasting = Omzet na kosten - Pensioen
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 6: Belastingreservering (indicatief)</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Voor vergelijking met detacheren reserveren we 40% voor belasting.
                          Dit is indicatief - exacte belasting hangt af van je situatie.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Belastingreservering = Netto vóór belasting × 40%<br/>
                          Netto op rekening (indicatief) = Netto vóór belasting - Belastingreservering
                        </code>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="vergelijking" className="border-0">
                    <AccordionTrigger className="text-sm font-semibold text-green-800 hover:no-underline py-2">
                      Vergelijking Detacheren vs ZZP
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-green-700 space-y-3 pt-2">
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">"Dit ontvang je elke maand op je rekening"</p>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li><strong>Detacheren:</strong> Netto na belasting (echte uitbetaling)</li>
                          <li><strong>ZZP:</strong> Netto na belastingreservering (indicatief, 40% gereserveerd)</li>
                        </ul>
                        <p className="text-xs text-gray-600 mt-2">
                          Dit maakt de vergelijking eerlijk: beide kanten tonen wat je daadwerkelijk op je rekening ontvangt.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Pensioen</p>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li><strong>Detacheren:</strong> Automatisch opgebouwd, verplicht</li>
                          <li><strong>ZZP:</strong> Eigen pensioenopbouw (vrijwillig), zelfde StiPP-structuur</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Kosten & Risico</p>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                          <li><strong>Detacheren:</strong> Bedrijfsmarge (10%) + extra uitkeringen in loonstructuur</li>
                          <li><strong>ZZP:</strong> Ondernemersrisico (10%) + overhead (8%) + buffer (5%) + belastingreservering (40%)</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <p className="text-xs text-green-600 italic mt-3">
                  Deze uitleg is bedoeld voor admin/beheer doeleinden. Eindgebruikers zien alleen de resultaten.
                </p>
              </div>
              
              {/* CAO Preset Selector */}
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-lg text-blue-900">CAO Selectie</h3>
                <p className="text-sm text-blue-700">Kies een CAO-profiel om de juiste percentages en regelingen te laden</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['ABU', 'NBBU', 'Custom'] as CAOPreset[]).map((cao) => (
                    <button
                      key={cao}
                      onClick={() => applyCAOPreset(cao)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        selectedCAO === cao
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {cao}
                    </button>
                  ))}
                </div>
                {selectedCAO === 'ABU' && (
                  <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    ABU: StiPP Plus pensioen (23.4%), inclusief AZV, PAWW, IKB en eindejaarsuitkering
                  </p>
                )}
                {selectedCAO === 'NBBU' && (
                  <p className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    NBBU: StiPP Basis pensioen (17%), inclusief AZV en PAWW, geen IKB of eindejaarsuitkering
                  </p>
                )}
                {selectedCAO === 'Custom' && (
                  <p className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
                    Aangepast: Pas hieronder alle waarden handmatig aan
                  </p>
                )}
              </div>
              
              {/* CAO Toggles */}
              <div className="space-y-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-bold text-lg text-amber-900">CAO-Specifieke Regelingen</h3>
                <p className="text-sm text-amber-700">Schakel optionele arbeidsvoorwaarden aan of uit</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                    <span className="text-sm font-medium text-gray-700">AZV (Aanvullende Ziektekostenverzekering)</span>
                    <input
                      type="checkbox"
                      checked={config.hasAZV}
                      onChange={(e) => {
                        setConfig({...config, hasAZV: e.target.checked});
                        setSelectedCAO('Custom');
                      }}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                    <span className="text-sm font-medium text-gray-700">PAWW (Premie Aanvullende Werknemersverzekeringen)</span>
                    <input
                      type="checkbox"
                      checked={config.hasPAWW}
                      onChange={(e) => {
                        setConfig({...config, hasPAWW: e.target.checked});
                        setSelectedCAO('Custom');
                      }}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                    <span className="text-sm font-medium text-gray-700">Eindejaarsuitkering (13e maand)</span>
                    <input
                      type="checkbox"
                      checked={config.hasYearEndBonus}
                      onChange={(e) => {
                        setConfig({...config, hasYearEndBonus: e.target.checked});
                        setSelectedCAO('Custom');
                      }}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-white rounded border border-amber-200">
                    <span className="text-sm font-medium text-gray-700">IKB (Individueel Keuze Budget)</span>
                    <input
                      type="checkbox"
                      checked={config.hasIKB}
                      onChange={(e) => {
                        setConfig({...config, hasIKB: e.target.checked});
                        setSelectedCAO('Custom');
                      }}
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>
                </div>
              </div>
              
              {/* Disclaimer in config */}
              <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <strong>Let op:</strong> Wijzigingen aan deze instellingen zijn bedoeld voor het aanpassen aan verschillende CAO's en scenario's. 
                  De standaardwaarden zijn gebaseerd op gangbare praktijken in de uitzendbranche (2026). 
                  Raadpleeg altijd je eigen CAO-afspraken voor exacte percentages.
                </p>
              </div>
              
              {/* Company Margin */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Bedrijfsmarge</h3>
                <ConfigInput
                  label="Totale marge (%)"
                  value={config.companyMarginTotal * 100}
                  onChange={(val) => updateConfig({companyMarginTotal: val / 100})}
                  min={0}
                  max={30}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Winst gedeelte (%)"
                  value={config.companyMarginProfit * 100}
                  onChange={(val) => updateConfig({companyMarginProfit: val / 100})}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Kosten gedeelte (%)"
                  value={config.companyMarginCosts * 100}
                  onChange={(val) => updateConfig({companyMarginCosts: val / 100})}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
              </div>

              {/* Conversion */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Conversie</h3>
                <ConfigInput
                  label="Conversiefactor (kandidaat → bruto)"
                  value={config.conversionFactor}
                  onChange={(val) => updateConfig({conversionFactor: val})}
                  min={1.5}
                  max={2.5}
                  step={0.0001}
                />
              </div>

              {/* Pension */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Pensioen (StiPP)</h3>
                <ConfigInput
                  label="Franchise per uur (€) - StiPP 2026: €9,24"
                  value={config.hourlyFranchise}
                  onChange={(val) => updateConfig({hourlyFranchise: val})}
                  min={0}
                  max={50}
                  step={0.01}
                  prefix="€"
                />
                <ConfigInput
                  label="Werkgever pensioen (%)"
                  value={config.employerPensionRate * 100}
                  onChange={(val) => updateConfig({employerPensionRate: val / 100})}
                  min={0}
                  max={30}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Werknemer pensioen (%)"
                  value={config.employeePensionRate * 100}
                  onChange={(val) => updateConfig({employeePensionRate: val / 100})}
                  min={0}
                  max={30}
                  step={0.1}
                  suffix="%"
                />
              </div>

              {/* Reservations */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Overige Reserveringen</h3>
                <ConfigInput
                  label="AZV (%)"
                  value={config.azvRate * 100}
                  onChange={(val) => updateConfig({azvRate: val / 100})}
                  min={0}
                  max={5}
                  step={0.01}
                  suffix="%"
                />
                <ConfigInput
                  label="PAWW (%)"
                  value={config.pawwRate * 100}
                  onChange={(val) => updateConfig({pawwRate: val / 100})}
                  min={0}
                  max={5}
                  step={0.01}
                  suffix="%"
                />
              </div>

              {/* Tax Brackets */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Belastingschijven 2026</h3>
                <ConfigInput
                  label="Schijf 1 limiet (€)"
                  value={config.taxBracket1Limit}
                  onChange={(val) => updateConfig({taxBracket1Limit: val})}
                  min={0}
                  max={100000}
                  step={1}
                  prefix="€"
                />
                <ConfigInput
                  label="Schijf 2 limiet (€)"
                  value={config.taxBracket2Limit}
                  onChange={(val) => updateConfig({taxBracket2Limit: val})}
                  min={0}
                  max={150000}
                  step={1}
                  prefix="€"
                />
                <ConfigInput
                  label="Tarief schijf 1 (%)"
                  value={config.taxRate1 * 100}
                  onChange={(val) => updateConfig({taxRate1: val / 100})}
                  min={0}
                  max={100}
                  step={0.01}
                  suffix="%"
                />
                <ConfigInput
                  label="Tarief schijf 2+ (%)"
                  value={config.taxRate2 * 100}
                  onChange={(val) => updateConfig({taxRate2: val / 100})}
                  min={0}
                  max={100}
                  step={0.01}
                  suffix="%"
                />
                <ConfigInput
                  label="Sociale premies (%)"
                  value={config.socialPremiumRate * 100}
                  onChange={(val) => updateConfig({socialPremiumRate: val / 100})}
                  min={0}
                  max={50}
                  step={0.01}
                  suffix="%"
                />
              </div>

              {/* Tax Credits */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Heffingskortingen</h3>
                <ConfigInput
                  label="Arbeidskorting max (€)"
                  value={config.arbeidsKortingMax}
                  onChange={(val) => updateConfig({arbeidsKortingMax: val})}
                  min={0}
                  max={10000}
                  step={1}
                  prefix="€"
                />
                <ConfigInput
                  label="Algemene heffingskorting max (€)"
                  value={config.algemeenHeffingsKortingMax}
                  onChange={(val) => updateConfig({algemeenHeffingsKortingMax: val})}
                  min={0}
                  max={10000}
                  step={1}
                  prefix="€"
                />
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Extra Uitkeringen</h3>
                <ConfigInput
                  label="Vakantiedagen (%)"
                  value={config.holidayHoursRate * 100}
                  onChange={(val) => updateConfig({holidayHoursRate: val / 100})}
                  min={0}
                  max={20}
                  step={0.01}
                  suffix="%"
                />
                <ConfigInput
                  label="Vakantiegeld (%)"
                  value={config.holidayAllowanceRate * 100}
                  onChange={(val) => updateConfig({holidayAllowanceRate: val / 100})}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Eindejaarsuitkering (%)"
                  value={config.yearEndBonusRate * 100}
                  onChange={(val) => updateConfig({yearEndBonusRate: val / 100})}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="IKB bijdrage (%)"
                  value={config.ikbRate * 100}
                  onChange={(val) => updateConfig({ikbRate: val / 100})}
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
              </div>
            </div>
          </div>
        </div>
          )}
        </>
      )}
      
      {/* SECTION 1: Intro */}
      <section className="bg-white border-b border-gray-100 pt-16 pb-12 px-4 w-full h-fit max-w-container-max rounded-2xl mx-auto" style={{ boxShadow: 'rgba(13, 13, 18, 0.05) 0px 2px 4px 0px' }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl mobile:text-5xl font-extrabold tracking-tight text-gray-900">
            Je inkomen is meer dan je maandbedrag
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Zie wat je direct ontvangt en wat je opbouwt voor later.
          </p>
        </div>

        {/* Explainer Cards */}
        {/* <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mt-16 text-left">
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
              <CardTitle className="text-lg">Bedrijf & bemiddeling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                  Wij regelen opdrachten, contracten en administratie. Ook dekken we risico's bij ziekte of geen opdracht.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <ShieldCheck className="w-8 h-8 text-teal-500 mb-2" />
              <CardTitle className="text-lg">Zekerheid & opbouw</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                  Alles voor je gemoedsrust: verzekeringen, doorbetaald vrij zijn en inkomen voor later.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow bg-blue-50/50 border-blue-100">
            <CardHeader>
              <CalculatorIcon className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg text-blue-900">Jouw inkomen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800/80 leading-relaxed">
                  Wat je direct ontvangt: je bruto maandsalaris en je netto uitbetaling.
              </p>
            </CardContent>
          </Card>
        </div> */}
      </section>

      {/* SECTION 2: Tab Navigation */}
      <section className="py-8 px-4 max-w-5xl mx-auto">
        <div className="flex justify-center border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('comparison')}
              className={clsx(
                "px-6 py-3 font-medium transition-colors",
                activeTab === 'comparison'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Vergelijking
            </button>
            <button
              onClick={() => setActiveTab('detacheren')}
              className={clsx(
                "px-6 py-3 font-medium transition-colors",
                activeTab === 'detacheren'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Berekening Detacheren
            </button>
            <button
              onClick={() => setActiveTab('zzp')}
              className={clsx(
                "px-6 py-3 font-medium transition-colors",
                activeTab === 'zzp'
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Berekening ZZP
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: Comparison View (when activeTab === 'comparison') */}
      {activeTab === 'comparison' && (
        <section className="py-16 px-4 max-w-container-max mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Vergelijking: Detacheren vs ZZP</h2>
            <p className="text-gray-500">Vergelijk je inkomen, opbouw en kosten tussen beide modellen.</p>
          </div>

          {/* Controls */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
            {/* CAO Indicator */}
            <div className="mb-6 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Actieve CAO:</span>
                <span className="text-sm font-bold text-blue-700">{selectedCAO}</span>
              </div>
              {settingsEnabled && (
                <button
                  onClick={() => setShowConfig(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Wijzig CAO
                </button>
              )}
            </div>
            
            <div className="grid mobile:grid-cols-2 mobile:gap-6 gap-6">
              <div className="space-y-3 flex flex-col">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Uurtarief Opdrachtgever
                  </label>
                  <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                    <span className="text-3xl font-bold text-gray-900">
                      € {hourlyRate[0].toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-gray-400 font-medium text-base whitespace-nowrap">/ uur</span>
                  </div>
                </div>
                <Slider
                  value={hourlyRate}
                  onValueChange={setHourlyRate}
                  min={30}
                  max={200}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="space-y-3 flex flex-col">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Uren Per Week
                  </label>
                  <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                    <span className="text-3xl font-bold text-gray-900">{hoursPerWeek[0]}</span>
                    <span className="text-gray-400 font-medium text-base whitespace-nowrap">uren</span>
                  </div>
                </div>
                <Slider
                  value={hoursPerWeek}
                  onValueChange={setHoursPerWeek}
                  min={16}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Comparison Blocks - Detailed Netto Loon Blocks */}
          <div className="grid mobile:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Detacheren Block */}
            <div className="p-8 bg-blue-600 text-white space-y-6 rounded-2xl">
              <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5" />
                    Detacheren
                  </h3>
                  <p className="text-blue-100 text-sm">Dit ontvang je elke maand op je rekening</p>
                  <p className="text-blue-200 text-xs mt-2 max-w-md">
                    Dit bedrag kan iets afwijken van je echte loonstrook, maar geeft een realistische indicatie
                  </p>
                </div>
                <div className="text-left mobile:text-right">
                  <div className="text-3xl font-bold">
                    {formatCurrency(result.netTotal)}
                  </div>
                  <div className="text-blue-200 text-sm font-medium">
                    {formatHourly(result.netTotal)} per uur
                  </div>
                </div>
              </div>
              
              {/* Additional Benefits Box */}
              <div className="bg-blue-700/50 rounded-lg p-4 border border-blue-400/30">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-5 h-5 text-amber-300" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Plus: Extra uitkeringen die je ontvangt</h4>
                    <p className="text-blue-200 text-[10px] mt-0.5">Deze extra's zijn in je loonstructuur verwerkt</p>
                  </div>
                </div>
                <div className="grid mobile:grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded p-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-blue-100">Vakantiedagen ({(config.holidayHoursRate * 100).toFixed(2)}%)</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.holidayDaysEquivalent)}</div>
                  </div>
                  <div className="bg-white/10 rounded p-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-blue-100">Vakantiegeld ({(config.holidayAllowanceRate * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.holidayAllowance)}</div>
                  </div>
                  {config.hasYearEndBonus && additionalBenefits.yearEndBonus > 0 && (
                    <div className="bg-white/10 rounded p-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-blue-100">Eindejaarsuitkering ({(config.yearEndBonusRate * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.yearEndBonus)}</div>
                    </div>
                  )}
                  {config.hasIKB && additionalBenefits.ikbContribution > 0 && (
                    <div className="bg-white/10 rounded p-3">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-blue-100">IKB bijdrage ({(config.ikbRate * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.ikbContribution)}</div>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-blue-400/30 flex justify-between items-center">
                  <span className="text-sm text-blue-100">Totaal extra per maand</span>
                  <span className="text-xl font-bold text-amber-300">{formatCurrency(additionalBenefits.totalAdditionalBenefits)}</span>
                </div>
                
                {/* Pension */}
                <div className="mt-4 pt-4 border-t border-blue-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="w-4 h-4 text-violet-300" />
                    <h5 className="font-bold text-white text-xs">Opbouw voor later (pensioen)</h5>
                  </div>
                  <div className="bg-violet-900/30 rounded p-3 border border-violet-400/30">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-blue-100">Totale pensioen inleg ({((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}%)</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(employerPension + reservationBreakdown.employeePension)}</div>
                    <div className="text-[10px] text-violet-200 mt-1">wordt elke maand voor je opgebouwd</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ZZP Block */}
            <div className="p-8 bg-green-600 text-white space-y-6 rounded-2xl">
              <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <CalculatorIcon className="w-5 h-5" />
                    ZZP
                  </h3>
                  <p className="text-green-100 text-sm">Dit ontvang je elke maand op je rekening (indicatief)</p>
                  <p className="text-green-200 text-xs mt-2 max-w-md">
                    We reserveren tijdelijk 40% voor belasting, exacte belasting hangt af van je situatie
                  </p>
                </div>
                <div className="text-left mobile:text-right">
                  <div className="text-3xl font-bold">
                    {formatCurrency(zzpNetAfterTaxIndicative)}
                  </div>
                  <div className="text-green-200 text-sm font-medium">
                    {formatHourly(zzpNetAfterTaxIndicative, zzpResult.monthlyHours)} per uur
                  </div>
                </div>
              </div>
              
              {/* Costs & Pension Box */}
              <div className="bg-green-700/50 rounded-lg p-4 border border-green-400/30">
                <div className="space-y-3">
                  <div className="bg-white/10 rounded p-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-green-100">Belastingreservering ({(config.zzpTaxReserveRate * 100).toFixed(0)}%)</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(zzpTaxReserve)}</div>
                    <div className="text-[10px] text-green-200 mt-1">
                      Dit zetten veel zzp'ers apart om belasting te betalen
                    </div>
                  </div>
                  
                  {/* Kosten & onzekerheid ZZP - Clustered */}
                  <div className="bg-white/10 rounded p-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs text-green-100 font-semibold">Kosten & onzekerheid ZZP</span>
                    </div>
                    <div className="text-lg font-bold text-white">{formatCurrency(zzpResult.costsTotal)}</div>
                    <div className="text-[10px] text-green-200 mt-1">
                      Ondernemersrisico, overhead, buffer. Meer tariefvrijheid, meer eigen verantwoordelijkheid.
                    </div>
                    <details className="mt-2">
                      <summary className="text-[10px] text-green-300 cursor-pointer hover:text-green-200">
                        Bekijk uitsplitsing
                      </summary>
                      <div className="mt-2 space-y-1.5 text-[10px] text-green-200/80 pl-2 border-l border-green-400/30">
                        <div>• Ondernemersrisico ({(config.zzpEntrepreneurRiskRate * 100).toFixed(0)}%): {formatCurrency(zzpResult.costsBreakdown.entrepreneurRisk)}</div>
                        <div>• Overhead ({(config.zzpOverheadRate * 100).toFixed(0)}%): {formatCurrency(zzpResult.costsBreakdown.overheadCosts)}</div>
                        <div>• Buffer ({(config.zzpBufferRate * 100).toFixed(0)}%): {formatCurrency(zzpResult.costsBreakdown.bufferCosts)}</div>
                      </div>
                    </details>
                  </div>
                  
                  {/* Pension - Less dominant, labeled as voluntary/own build-up */}
                  <div className="mt-3 pt-3 border-t border-green-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <PiggyBank className="w-3 h-3 text-violet-300 opacity-75" />
                      <h5 className="font-medium text-white text-xs">Eigen pensioenopbouw (vrijwillig)</h5>
                    </div>
                    <div className="bg-violet-900/20 rounded p-2.5 border border-violet-400/20">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs text-green-200">Pensioen inleg ({((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}%)</span>
                      </div>
                      <div className="text-base font-semibold text-white">{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</div>
                      <div className="text-[10px] text-violet-200/80 mt-1">Je bepaalt zelf hoeveel je opbouwt</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: Calculator + Simple Flow (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <section className="py-16 px-4 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Inzicht in je totale beloning</h2>
          <p className="text-gray-500">Een compleet beeld van je maandinkomen, extra's en opbouw voor later.</p>
        </div>

        {/* Controls */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
             {/* CAO Indicator */}
             <div className="mb-6 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
               <div className="flex items-center gap-2">
                 <Briefcase className="w-4 h-4 text-blue-600" />
                 <span className="text-sm font-medium text-blue-900">Actieve CAO:</span>
                 <span className="text-sm font-bold text-blue-700">{selectedCAO}</span>
               </div>
               {settingsEnabled && (
                 <button
                   onClick={() => setShowConfig(true)}
                   className="text-xs text-blue-600 hover:text-blue-800 underline"
                 >
                   Wijzig CAO
                 </button>
               )}
             </div>
             
             <div className="grid mobile:grid-cols-2 mobile:gap-6 gap-6">
                  <div className="space-y-3 flex flex-col">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Uurtarief Opdrachtgever
                      </label>
                      <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                        <span className="text-3xl font-bold text-gray-900">
                          € {hourlyRate[0].toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-gray-400 font-medium text-base whitespace-nowrap">/ uur</span>
                      </div>
                    </div>
                    <Slider
                      value={hourlyRate}
                      min={60}
                      max={150}
                      step={0.5}
                      onValueChange={setHourlyRate}
                      className="py-4"
                    />
                  </div>
                  
                  <div className="space-y-3 flex flex-col">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Uren per week
                      </label>
                      <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                        <span className="text-3xl font-bold text-gray-900">
                          {hoursPerWeek[0]}
                        </span>
                        <span className="text-gray-400 font-medium text-base whitespace-nowrap">uren</span>
                      </div>
                    </div>
                    <Slider
                      value={hoursPerWeek}
                      min={20}
                      max={40}
                      step={1}
                      onValueChange={setHoursPerWeek}
                      className="py-4"
                    />
                  </div>
             </div>
        </div>

        {/* Visual Flow */}
        <div className="grid mobile:grid-cols-2 tablet:grid-cols-4 gap-4 items-stretch">
            {/* Step 1: Client Pays */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 relative group">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Wat de klant betaalt</div>
                <div className="flex flex-col">
                     <span className="text-2xl font-bold text-gray-900">{formatCurrency(clientTotal)}</span>
                     <span className="text-sm font-medium text-gray-400">{formatHourly(clientTotal)} /uur</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">Het volledige maandbedrag</div>
                <ChevronRight className="hidden tablet:block absolute -right-6 top-1/2 -trangray-y-1/2 text-gray-300 w-8 h-8 z-10" />
            </div>

            {/* Step 2: Company Share */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-2 relative">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Bedrijfskosten & marge</div>
                <div className="flex flex-col mb-3">
                     <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs text-gray-500">Winst (5%)</span>
                          <span className="text-2xl font-bold text-gray-900">{formatCurrency(marginBreakdown.profit)}</span>
                     </div>
                     <div className="flex items-baseline gap-2">
                          <span className="text-[10px] text-gray-400">Kosten (10%)</span>
                          <span className="text-sm font-medium text-gray-600">{formatCurrency(marginBreakdown.admin)}</span>
                     </div>
                </div>
                <div className="text-xs text-gray-500 mt-auto">Totaal: {formatCurrency(companyTotal)}</div>
                 <div className="hidden tablet:block absolute -right-4 top-1/2 -trangray-y-1/2 border-t-2 border-gray-200 w-8 z-0"></div>
            </div>

            {/* Step 3: Candidate Total */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-2 relative col-span-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Jouw totale beloning</div>
                <div className="flex items-end justify-between mb-2 gap-4">
                     <div className="flex flex-col">
                          <span className="text-3xl font-bold text-blue-900">{formatCurrency(candidateTotal)}</span>
                          <span className="text-sm font-medium text-blue-600/60">{formatHourly(candidateTotal)} /uur</span>
                     </div>
                     <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Jouw totale opbrengst</span>
                          <span className="text-2xl font-bold text-green-700">{formatCurrency(netTotal + additionalBenefits.totalAdditionalBenefits + employerPension + reservationBreakdown.employeePension)}</span>
                          <span className="text-xs text-green-600/70">Direct + later</span>
                     </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-blue-200/50">
                    <div className="bg-white/50 rounded-lg p-3">
                        <div className="text-base font-bold text-gray-900">{formatCurrency(netTotal)}</div>
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Netto loon</div>
                        <div className="text-[10px] text-gray-400">{formatHourly(netTotal)}/u</div>
                    </div>
                    <div className="bg-amber-50/80 rounded-lg p-3">
                        <div className="text-base font-bold text-amber-900">{formatCurrency(additionalBenefits.totalAdditionalBenefits)}</div>
                        <div className="text-[10px] text-amber-700 font-medium uppercase tracking-wide">Extra per maand</div>
                        <div className="text-[10px] text-amber-600/70">Uitkeringen</div>
                    </div>
                    <div className="bg-violet-50/80 rounded-lg p-3">
                        <div className="text-base font-bold text-violet-700">{formatCurrency(employerPension + reservationBreakdown.employeePension)}</div>
                        <div className="text-[10px] text-violet-600/80 font-medium uppercase tracking-wide flex items-center gap-1">
                             <PiggyBank className="w-3 h-3" /> Pensioen inleg
                        </div>
                        <div className="text-[10px] text-violet-600/60">Voor later</div>
                    </div>
                </div>
            </div>
        </div>

      </section>
      )}

      {/* SECTION 3: Detailed Breakdown (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="breakdown" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-start text-left">
                        <span className="text-lg font-bold text-gray-900">Volledige opbouw van jouw tarief</span>
                        <span className="text-sm text-gray-500 font-normal">Zo wordt elke stap van tarief naar netto loon berekend</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                    <div className="divide-y divide-gray-100">
                        
                        {/* Group A: Company Share */}
                        <div className="p-6 bg-gray-50/50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Kosten en marge</h3>
                                <span className="text-[10px] text-gray-500 max-w-[50%] text-right leading-tight">
                                    Dit deel gaat naar kosten, risico en het draaiend houden van het platform
                                </span>
                            </div>
                            <BreakdownRow 
                                label="Bedrijfskosten & Risico (10%)" 
                                value={marginBreakdown.admin} 
                                monthlyHours={monthlyHours}
                                tooltip="Deze 10% dekken alle bedrijfskosten: verzekeringen tijdens ziekte, doorbetaling tussen opdrachten, administratie, HR-ondersteuning, salarisverwerking en juridische bescherming."
                            />
                            <BreakdownRow 
                                label="Winst (5%)" 
                                value={marginBreakdown.profit} 
                                monthlyHours={monthlyHours}
                                tooltip="Dit is de marge van het detacheringsbureau. Deze winst maakt het mogelijk om te investeren in betere dienstverlening, opdrachtenwerving en innovatie."
                            />
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-gray-500 text-sm font-medium">
                                <span>Totaal inhouding bedrijf</span>
                                <span>{formatCurrency(companyTotal)} <span className="text-xs font-normal">({formatHourly(companyTotal)})</span></span>
                            </div>
                        </div>

                        {/* Group B: Conversion to Gross */}
                        <div className="p-6 bg-white space-y-4 relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400"></div>
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Van kandidaat tarief naar bruto loon</h3>
                                <span className="text-[10px] text-teal-700/80 max-w-[50%] text-right leading-tight">
                                    Van uurtarief naar salaris, inclusief wettelijke werkgeverslasten
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-medium text-gray-900 pb-2 border-b border-gray-100">
                                 <span>Kandidatentarief (Beschikbaar)</span>
                                 <span>{formatCurrency(candidateTotal)} <span className="text-xs font-normal text-gray-500">({formatHourly(candidateTotal)})</span></span>
                            </div>
                            <BreakdownRow 
                                label="Werkgeverslasten, Premies, Verzekeringen, Vakantiegeld & Reserveringen" 
                                value={candidateTotal - grossTotal - employerPension} 
                                monthlyHours={monthlyHours}
                                tooltip="Dit bedrag dekt alle wettelijke werkgeverskosten: sociale premies (Werknemersverzekeringen, ZVW), arbeidsongeschiktheidsverzekering, vakantiegeld (8%), en vormt de financiële buffer voor werknemersreserveringen. Dit is geen bedrijfswinst, maar wettelijk verplichte en gebruikelijke arbeidsvoorwaarden."
                            />
                            <BreakdownRow 
                                label={`Pensioen (werkgeversdeel, ${(config.employerPensionRate * 100).toFixed(1)}%)`}
                                value={employerPension} 
                                monthlyHours={monthlyHours}
                                tooltip={`Het werkgeversdeel van de pensioenopbouw (${(config.employerPensionRate * 100).toFixed(1)}% van je pensioengevend loon). Dit is een extra bijdrage bovenop je bruto salaris die direct naar je pensioen gaat. Je bouwt hiermee aanvullend pensioen op bovenop je AOW.`}
                            />
                            
                            <div className="mt-6 p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-600">Bruto Maandsalaris</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-gray-900">{formatCurrency(grossTotal)} <span className="text-xs font-normal text-gray-500">({formatHourly(grossTotal)})</span></span>
                            </div>
                        </div>

                        {/* Group C+D: From Gross to Net (Combined like payslip) */}
                        <div className="p-6 bg-white space-y-4 relative overflow-hidden">
                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-red-400"></div>
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-700">Van bruto naar netto</h3>
                                <span className="text-[10px] text-gray-600/80 max-w-[50%] text-right leading-tight">
                                    Net als op je loonstrook: wat er van je bruto salaris afgaat
                                </span>
                            </div>
                            
                            {/* Starting point: Gross Salary */}
                            <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm border border-gray-200">
                                <span className="font-medium text-gray-600">Bruto Maandsalaris</span>
                                <span className="font-bold text-gray-900">{formatCurrency(grossTotal)} <span className="text-xs font-normal text-gray-500">({formatHourly(grossTotal)})</span></span>
                            </div>
                            
                            <div className="pl-4 space-y-4 border-l-2 border-gray-200">
                                {/* Reservations Section */}
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-2">
                                        <PiggyBank className="w-3 h-3" />
                                        Reserveringen voor jou (niet belast)
                                    </div>
                                    
                                    {/* Pensionable Wage Explanation */}
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-indigo-900 font-medium">Pensioengevend loon (na franchise)</span>
                                            <span className="font-bold text-indigo-900">{formatCurrency(pensionableWage)}</span>
                                        </div>
                                        <p className="text-[10px] text-indigo-700 leading-relaxed">
                                            Niet je volledige salaris telt mee voor pensioenopbouw. We trekken een vast bedrag (franchise) af van je bruto salaris.
                                        </p>
                                    </div>
                                    
                                    <BreakdownRow 
                                        label={`Pensioen (werknemersdeel, ${(config.employeePensionRate * 100).toFixed(1)}%)`}
                                        value={reservationBreakdown.employeePension} 
                                        highlight 
                                        monthlyHours={monthlyHours}
                                        tooltip={`Dit is jouw eigen bijdrage aan je pensioen (${(config.employeePensionRate * 100).toFixed(1)}% van je pensioengevend loon). Deze wordt ingehouden vóór belasting, dus je bespaart belasting over dit bedrag. Samen met het werkgeversdeel (${(config.employerPensionRate * 100).toFixed(1)}%) bouw je zo ${((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}% pensioen op.`}
                                    />
                                    <p className="text-[10px] text-teal-600 leading-tight pl-4 -mt-2">
                                        Werknemersdeel wordt voor jou apart gezet, vóór belasting
                                    </p>
                                    {config.hasAZV && reservationBreakdown.azv > 0 && (
                                        <BreakdownRow 
                                            label={`AZV (${(config.azvRate * 100).toFixed(2)}%)`}
                                            value={reservationBreakdown.azv} 
                                            highlight 
                                            monthlyHours={monthlyHours}
                                            tooltip="Aanvullende Ziektekostenverzekering. Dit is een kleine premie die wordt ingehouden voor aanvullende zorgdekking bovenop de basisverzekering. Ook dit wordt vóór belasting ingehouden."
                                        />
                                    )}
                                    {config.hasPAWW && reservationBreakdown.paww > 0 && (
                                        <BreakdownRow 
                                            label={`PAWW (${(config.pawwRate * 100).toFixed(2)}%)`}
                                            value={reservationBreakdown.paww} 
                                            highlight 
                                            monthlyHours={monthlyHours}
                                            tooltip="Premie Aanvullende Werknemersverzekeringen voor Werktijd. Dit dekt extra arbeidsvoorwaarden zoals een aanvulling op je WW-uitkering bij werkloosheid. Ook deze premie wordt vóór belasting ingehouden."
                                        />
                                    )}
                                </div>
                                
                                {/* Intermediate: Taxable Wage */}
                                <div className="p-3 bg-amber-50 rounded-lg flex justify-between items-center text-sm border border-amber-200">
                                    <span className="font-medium text-amber-900">Loon voor loonbelasting</span>
                                    <span className="font-bold text-amber-900">{formatCurrency(taxableTotal)}</span>
                                </div>
                                
                                {/* Taxes Section */}
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-red-700 uppercase tracking-wide">
                                        Belastingen en premies
                                    </div>
                                    
                                    {/* Tax Breakdown with Credits */}
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-red-900 font-medium">Belasting vóór heffingskorting</span>
                                            <span className="font-bold text-red-900">{formatCurrency(taxBreakdown.wageTaxBeforeCredits)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-green-700">
                                            <span className="font-medium">− Heffingskortingen</span>
                                            <span className="font-bold">− {formatCurrency(taxBreakdown.taxCredits)}</span>
                                        </div>
                                        <p className="text-[10px] text-red-700 leading-relaxed">
                                            Heffingskortingen verlagen de belasting die je betaalt
                                        </p>
                                    </div>
                                    
                                    <BreakdownRow 
                                        label="Belasting over je salaris (na korting)" 
                                        value={taxBreakdown.incomeTax} 
                                        monthlyHours={monthlyHours}
                                        tooltip="Dit is de 'echte' inkomstenbelasting die naar de algemene staatskas gaat. Dit geld wordt gebruikt voor onderwijs, infrastructuur, defensie, politie, en algemeen overheidsbeleid. Dit is ongeveer 18.75% van je belastbaar loon."
                                    />
                                    <BreakdownRow 
                                        label="Bijdragen aan sociale zekerheid" 
                                        value={taxBreakdown.socialPremiums} 
                                        monthlyHours={monthlyHours}
                                        tooltip="Dit zijn premies voor je volksverzekeringen: AOW (staatspensioen vanaf ~67 jaar), Anw (nabestaandenuitkering), en WLZ (langdurige zorg). Deze ~18.22% betaal je voor voorzieningen waar je (of je nabestaanden) later gebruik van kunt maken. Dit is eigenlijk een verzekeringspremie, geen belasting."
                                    />
                                </div>
                                
                                {/* Total Deductions */}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-gray-700 text-sm font-semibold">
                                    <span>Totaal ingehouden (reserveringen + belasting)</span>
                                    <span>{formatCurrency(reservationsTotal + taxBreakdown.totalDeductions)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Group E: Netto Result */}
                        <div className="p-8 bg-blue-600 text-white space-y-6">
                            <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold">Netto loon</h3>
                                    <p className="text-blue-100 text-sm">Dit ontvang je elke maand op je rekening</p>
                                    <p className="text-blue-200 text-xs mt-2 max-w-md">
                                        Dit bedrag kan iets afwijken van je echte loonstrook, maar geeft een realistische indicatie
                                    </p>
                                </div>
                                <div className="text-left mobile:text-right">
                                    <div className="text-3xl font-bold">
                                        {formatCurrency(netTotal)}
                                    </div>
                                    <div className="text-blue-200 text-sm font-medium">
                                        {formatHourly(netTotal)} per uur
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional Benefits Box */}
                            <div className="bg-blue-700/50 rounded-lg p-4 border border-blue-400/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins className="w-5 h-5 text-amber-300" />
                                    <div>
                                      <h4 className="font-bold text-white text-sm">Plus: Extra uitkeringen die je ontvangt</h4>
                                      <p className="text-blue-200 text-[10px] mt-0.5">Deze extra's zijn in je loonstructuur verwerkt</p>
                                    </div>
                                </div>
                                <div className="grid mobile:grid-cols-2 gap-3">
                                    <div className="bg-white/10 rounded p-3">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-blue-100">Vakantiedagen ({(config.holidayHoursRate * 100).toFixed(2)}%)</span>
                                            <InfoTooltip content={
                                                <div>
                                                    <p className="mb-1">Dit is de geldelijke waarde van je wettelijke vakantiedagen.</p>
                                                    <p className="mb-1">Berekening: {(config.holidayHoursRate * 100).toFixed(2)}% van je werkuren ({(monthlyHours * config.holidayHoursRate).toFixed(1)} uur/maand) × je netto uurtarief ({new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(netTotal/monthlyHours)}).</p>
                                                    <p>Deze uren worden voor je gereserveerd zodat je betaald vrij kunt zijn!</p>
                                                </div>
                                            } side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.holidayDaysEquivalent)}</div>
                                        <div className="text-[10px] text-blue-200 mt-1">{(monthlyHours * config.holidayHoursRate).toFixed(1)} uur/maand</div>
                                    </div>
                                    <div className="bg-white/10 rounded p-3">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-blue-100">Vakantiegeld ({(config.holidayAllowanceRate * 100).toFixed(0)}%)</span>
                                            <InfoTooltip content="Ieder jaar in mei of juni ontvang je 8% van je jaarsalaris als vakantiegeld. Dit is wettelijk verplicht en staat los van je normale maandloon. Perfect voor een mooie vakantie!" side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.holidayAllowance)}</div>
                                    </div>
                                    {config.hasYearEndBonus && additionalBenefits.yearEndBonus > 0 && (
                                        <div className="bg-white/10 rounded p-3">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs text-blue-100">Eindejaarsuitkering ({(config.yearEndBonusRate * 100).toFixed(1)}%)</span>
                                                <InfoTooltip content="Ook wel '13e maand' genoemd. Dit is een extra uitkering van 4.5% van je jaarsalaris die je vaak in december ontvangt. Dit is geen wettelijke verplichting, maar een veel voorkomende arbeidsvoorwaarde." side="left" />
                                            </div>
                                            <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.yearEndBonus)}</div>
                                        </div>
                                    )}
                                    {config.hasIKB && additionalBenefits.ikbContribution > 0 && (
                                        <div className="bg-white/10 rounded p-3">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs text-blue-100">IKB bijdrage ({(config.ikbRate * 100).toFixed(1)}%)</span>
                                                <InfoTooltip content="Individueel Keuze Budget. Dit is een flexibel budget dat je kunt inzetten voor extra verlof, extra pensioen, of uitbetaling. Jij kiest zelf waar je het voor gebruikt!" side="left" />
                                            </div>
                                            <div className="text-lg font-bold text-white">{formatCurrency(additionalBenefits.ikbContribution)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-blue-400/30 flex justify-between items-center">
                                    <span className="text-sm text-blue-100">Totaal extra per maand</span>
                                    <span className="text-xl font-bold text-amber-300">{formatCurrency(additionalBenefits.totalAdditionalBenefits)}</span>
                                </div>
                                
                                {/* Pension - separate section for long-term */}
                                <div className="mt-4 pt-4 border-t border-blue-400/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PiggyBank className="w-4 h-4 text-violet-300" />
                                        <h5 className="font-bold text-white text-xs">Opbouw voor later (pensioen)</h5>
                                    </div>
                                    <div className="bg-violet-900/30 rounded p-3 border border-violet-400/30">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-blue-100">Totale pensioen inleg ({((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}%)</span>
                                            <InfoTooltip content={
                                                <div>
                                                    <p className="mb-2">Dit is de totale pensioenbijdrage die elke maand voor jou wordt opgebouwd:</p>
                                                    <p className="mb-1">• Werkgeversdeel: {(config.employerPensionRate * 100).toFixed(1)}% ({formatCurrency(employerPension)})</p>
                                                    <p className="mb-2">• Werknemersdeel: {(config.employeePensionRate * 100).toFixed(1)}% ({formatCurrency(reservationBreakdown.employeePension)})</p>
                                                    <p>Dit geld krijg je pas later uitgekeerd, vanaf je pensioenleeftijd. Het wordt belegd en groeit mee, zodat je een goed aanvullend pensioen opbouwt bovenop je AOW.</p>
                                                </div>
                                            } side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-white">{formatCurrency(employerPension + reservationBreakdown.employeePension)}</div>
                                        <div className="text-[10px] text-violet-200 mt-1">wordt elke maand voor je opgebouwd</div>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-blue-200 mt-3 leading-relaxed">
                                    💡 Deze bedragen komen bovenop je netto loon. Je echte inkomen is dus: {formatCurrency(netTotal)} + {formatCurrency(additionalBenefits.totalAdditionalBenefits)} = <span className="font-bold text-white">{formatCurrency(netTotal + additionalBenefits.totalAdditionalBenefits)}</span> per maand!
                                </p>
                                <p className="text-xs text-violet-200 mt-2 leading-relaxed">
                                    🏦 Plus {formatCurrency(employerPension + reservationBreakdown.employeePension)} aan pensioen per maand voor later!
                                </p>
                            </div>
                        </div>

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </section>
      )}

      {/* Disclaimer (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg max-w-3xl mx-auto">
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
      )}

      {/* SECTION 5: ZZP Tab */}
      {activeTab === 'zzp' && (
      <section className="py-16 px-4 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">ZZP Berekening</h2>
          <p className="text-gray-500">Berekening van je inkomen als zelfstandige zonder personeel.</p>
        </div>

        {/* Controls */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
          <div className="grid mobile:grid-cols-2 mobile:gap-6 gap-6">
            <div className="space-y-3 flex flex-col">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Uurtarief
                </label>
                <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                  <span className="text-3xl font-bold text-gray-900">
                    € {hourlyRate[0].toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-400 font-medium text-base whitespace-nowrap">/ uur</span>
                </div>
              </div>
              <Slider
                value={hourlyRate}
                onValueChange={setHourlyRate}
                min={30}
                max={200}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-3 flex flex-col">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Uren Per Week
                </label>
                <div className="flex items-baseline gap-1 min-h-[2.5rem]">
                  <span className="text-3xl font-bold text-gray-900">{hoursPerWeek[0]}</span>
                  <span className="text-gray-400 font-medium text-base whitespace-nowrap">uren</span>
                </div>
              </div>
              <Slider
                value={hoursPerWeek}
                onValueChange={setHoursPerWeek}
                min={16}
                max={60}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Visual Flow for ZZP */}
        <div className="grid mobile:grid-cols-2 tablet:grid-cols-4 gap-4 items-stretch">
          {/* Step 1: Revenue */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col gap-2 relative group">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Bruto omzet</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(zzpResult.revenueTotal)}</span>
              <span className="text-sm font-medium text-gray-400">{formatHourly(zzpResult.revenueTotal, zzpResult.monthlyHours)} /uur</span>
            </div>
            <div className="text-sm text-gray-500 mt-1">Uurtarief × uren</div>
            <ChevronRight className="hidden tablet:block absolute -right-6 top-1/2 -trangray-y-1/2 text-gray-300 w-8 h-8 z-10" />
          </div>

          {/* Step 2: Costs */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col gap-2 relative">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Kosten & Risico</div>
            <div className="flex flex-col mb-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs text-gray-500">Ondernemersrisico (10%)</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(zzpResult.costsBreakdown.entrepreneurRisk)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500">Overhead ({(config.zzpOverheadRate * 100).toFixed(0)}%)</span>
                <span className="text-sm font-medium text-gray-600">{formatCurrency(zzpResult.costsBreakdown.overheadCosts)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-gray-500">Buffer ({(config.zzpBufferRate * 100).toFixed(0)}%)</span>
                <span className="text-sm font-medium text-gray-600">{formatCurrency(zzpResult.costsBreakdown.bufferCosts)}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-auto">Totaal: {formatCurrency(zzpResult.costsTotal)}</div>
            <div className="hidden tablet:block absolute -right-4 top-1/2 -trangray-y-1/2 border-t-2 border-gray-200 w-8 z-0"></div>
          </div>

          {/* Step 3: Revenue After Costs */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col gap-2 relative col-span-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Omzet na kosten</div>
            <div className="flex items-end justify-between mb-2 gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-blue-900">{formatCurrency(zzpResult.revenueAfterCosts)}</span>
                <span className="text-sm font-medium text-blue-600/60">{formatHourly(zzpResult.revenueAfterCosts, zzpResult.monthlyHours)} /uur</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-blue-200/50">
              <div className="bg-white/50 rounded-lg p-3">
                <div className="text-base font-bold text-gray-900">{formatCurrency(zzpResult.netBeforeTax)}</div>
                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Netto vóór belasting</div>
                <div className="text-[10px] text-gray-400">{formatHourly(zzpResult.netBeforeTax, zzpResult.monthlyHours)}/u</div>
              </div>
              <div className="bg-violet-50/80 rounded-lg p-3">
                <div className="text-base font-bold text-violet-700">{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</div>
                <div className="text-[10px] text-violet-600/80 font-medium uppercase tracking-wide flex items-center gap-1">
                  <PiggyBank className="w-3 h-3" /> Pensioen inleg
                </div>
                <div className="text-[10px] text-violet-600/60">Voor later</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown for ZZP */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="breakdown" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold text-gray-900">Volledige opbouw van je ZZP-inkomen</span>
                  <span className="text-sm text-gray-500 font-normal">Zo wordt elke stap van omzet naar netto berekend</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-gray-100">
                  {/* Group A: Revenue */}
                  <div className="p-6 bg-gray-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-700">Bruto omzet</h3>
                    </div>
                    <BreakdownRow 
                      label="Uurtarief × uren" 
                      value={zzpResult.revenueTotal} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Het totale bedrag dat je factureert: uurtarief vermenigvuldigd met het aantal uren per maand."
                    />
                  </div>

                  {/* Group B: Costs */}
                  <div className="p-6 bg-amber-50/30 space-y-4">
                    <h3 className="font-semibold text-gray-700">Kosten</h3>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                      <p className="text-xs text-blue-900 leading-relaxed">
                        <strong>We gaan uit van {(config.zzpBillableRate * 100).toFixed(0)}% factureerbare tijd over het jaar.</strong> Dit betekent dat 20% van je tijd niet facturabel is: vakantie, feestdagen, ziekte, en gaten tussen klussen.
                      </p>
                    </div>
                    <BreakdownRow 
                      label={`Ondernemersrisico (${(config.zzpEntrepreneurRiskRate * 100).toFixed(0)}%)`}
                      value={zzpResult.costsBreakdown.entrepreneurRisk} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Het risico dat je draagt als zelfstandige: geen doorbetaling bij ziekte, geen opdracht, etc."
                    />
                    <BreakdownRow 
                      label={`Overhead (${(config.zzpOverheadRate * 100).toFixed(0)}%)`}
                      value={zzpResult.costsBreakdown.overheadCosts} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="AOV, boekhouder, software, opleiding, apparatuur en andere zakelijke kosten."
                    />
                    <BreakdownRow 
                      label={`Buffer (${(config.zzpBufferRate * 100).toFixed(0)}%)`}
                      value={zzpResult.costsBreakdown.bufferCosts} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Reserve voor ziekte en gaten tussen opdrachten."
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-gray-700 text-sm font-semibold">
                      <span>Totaal kosten</span>
                      <span>{formatCurrency(zzpResult.costsTotal)}</span>
                    </div>
                  </div>

                  {/* Group C: Revenue After Costs */}
                  <div className="p-6 bg-blue-50/30 space-y-4">
                    <h3 className="font-semibold text-gray-700">Omzet na kosten</h3>
                    <BreakdownRow 
                      label="Bruto omzet - Kosten" 
                      value={zzpResult.revenueAfterCosts} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Het bedrag dat overblijft na aftrek van alle kosten."
                    />
                  </div>

                  {/* Group D: Pension */}
                  <div className="p-6 bg-violet-50/30 space-y-4">
                    <h3 className="font-semibold text-gray-700">Pensioen (StiPP-structuur)</h3>
                    <BreakdownRow 
                      label="Basis pensioengrondslag (na franchise)" 
                      value={zzpResult.basePensionableWage} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="De pensioengrondslag na aftrek van de franchise (€9,24 per uur). Dit is dezelfde berekening als bij detacheren."
                    />
                    {zzpResult.pensionCompensation > 0 && (
                      <BreakdownRow 
                        label="Pensioencompensatie" 
                        value={zzpResult.pensionCompensation} 
                        monthlyHours={zzpResult.monthlyHours}
                        tooltip="Compensatie die wordt toegevoegd aan de basis pensioengrondslag."
                      />
                    )}
                    <BreakdownRow 
                      label="Herrekende pensioengrondslag" 
                      value={zzpResult.pensionableWage} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="De pensioengrondslag waarover pensioen wordt berekend."
                    />
                    <BreakdownRow 
                      label="Werknemerspensioen ({(config.employeePensionRate * 100).toFixed(1)}%)" 
                      value={zzpResult.reservationBreakdown.employeePension} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Het percentage van de pensioengrondslag dat jij als werknemer betaalt."
                    />
                    <BreakdownRow 
                      label="Werkgeverspensioen ({(config.employerPensionRate * 100).toFixed(1)}%)" 
                      value={zzpResult.employerPension} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Het percentage van de pensioengrondslag dat als werkgeversdeel wordt opgebouwd."
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-300 text-gray-700 text-sm font-semibold">
                      <span>Totaal pensioen inleg</span>
                      <span>{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</span>
                    </div>
                  </div>

                  {/* Group E: Net Result */}
                  <div className="p-6 bg-green-600 text-white space-y-6">
                    <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold">Netto vóór belasting</h3>
                        <p className="text-green-100 text-sm">Dit is je netto inkomen vóór belasting</p>
                        <p className="text-green-200 text-xs mt-2 max-w-md">
                          Belastingberekening wordt in een latere fase toegevoegd
                        </p>
                      </div>
                      <div className="text-left mobile:text-right">
                        <div className="text-3xl font-bold">
                          {formatCurrency(zzpResult.netBeforeTax)}
                        </div>
                        <div className="text-green-200 text-sm font-medium">
                          {formatHourly(zzpResult.netBeforeTax, zzpResult.monthlyHours)} per uur
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </section>
      )}

      {/* SECTION 6: Detacheren vs ZZP (old comparison - can be removed or kept) */}
      {/* <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Wat is het verschil met ZZP?</h2>
        </div>

        <div className="grid mobile:grid-cols-2 gap-8">
            {/* Detacheren Column */}
            {/* <div className="bg-white border border-blue-100 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-500" /> Detacheren
                </h3>
                <ul className="space-y-4">
                    <ComparisonPoint text="Voorspelbaar inkomen elke maand" check />
                    <ComparisonPoint text="Altijd verzekerd bij ziekte" check />
                    <ComparisonPoint text="Geen omkijken naar pensioen" check />
                    <ComparisonPoint text="Geen administratieve zorgen" check />
                </ul>
            </div> */}

            {/* ZZP Column */}
            {/* <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-400"></div>
                 <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-500" /> ZZP
                </h3>
                 <ul className="space-y-4">
                    <ComparisonPoint text="Meer vrijheid in tarief" check />
                    <ComparisonPoint text="Zelf risico dragen bij ziekte" cross />
                    <ComparisonPoint text="Zelf pensioen regelen" cross />
                    <ComparisonPoint text="Meer verantwoordelijkheid" cross />
                </ul>
            </div>
        </div>
        


      </section> */}

    </div>
    </TooltipProvider>
  );
}

function BreakdownRow({ label, value, highlight = false, monthlyHours, tooltip }: { label: string, value: number, highlight?: boolean, monthlyHours: number, tooltip?: string | React.ReactNode }) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(val);
    };
    
    const formatHourly = (val: number, hours: number = monthlyHours) => {
        return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val / hours);
    };

    return (
        <div className="flex justify-between items-center text-sm gap-2">
            <span className={clsx("text-gray-600 flex items-center gap-1.5", highlight && "text-teal-700 font-medium")}>
                {label}
                {tooltip && <InfoTooltip content={tooltip} side="right" />}
            </span>
            <div className="text-right">
                <span className={clsx("font-medium block", highlight ? "text-teal-700" : "text-gray-900")}>
                    {formatCurrency(value)}
                </span>
                 <span className="text-[10px] text-gray-400 block">
                    {formatHourly(value, monthlyHours)} /u
                </span>
            </div>
        </div>
    )
}

function ComparisonPoint({ text, check, cross }: { text: string, check?: boolean, cross?: boolean }) {
    return (
        <li className="flex items-center gap-3">
            {check && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
            {cross && <XCircle className="w-5 h-5 text-amber-500 shrink-0" />}
            <span className="text-gray-700">{text}</span>
        </li>
    )
}