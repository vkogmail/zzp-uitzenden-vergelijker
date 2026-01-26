"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { 
  Calculator as CalculatorIcon, 
  Briefcase, 
  PiggyBank, 
  ArrowRight,
  Coins,
  Settings,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InfoTooltip } from '@/components/InfoTooltip';
import { ConfigInput } from '@/components/ConfigInput';
import { ValueBlock } from '@/components/ValueBlock';
import { BreakdownRow } from '@/components/BreakdownRow';
import { Disclaimer } from '@/components/Disclaimer';
import { formatCurrencyWhole, formatHourlyRate } from '@/lib/formatters';
import { 
  calculateEmployeeDetailed,
  calculateZZPDetailed,
  calculateZZPTaxReservation,
  employeeResultToComparable,
  zzpResultToComparable,
  getDetacherenValueBreakdown,
  getZZPValueBreakdown,
  defaultCalculatorConfig, 
  type CalculatorConfig,
} from '@/lib/calculations';

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
  const [hourlyRate, setHourlyRate] = useState([100]);
  const [hoursPerWeek, setHoursPerWeek] = useState([40]);
  const [config, setConfig] = useState<CalculatorConfig>(defaultConfig);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedCAO, setSelectedCAO] = useState<CAOPreset>('ABU');
  const [settingsEnabled, setSettingsEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<'comparison' | 'detacheren' | 'zzp'>('comparison');
  
  // Local state for input values to allow free typing
  const [hourlyRateInput, setHourlyRateInput] = useState('100');
  const [hoursPerWeekInput, setHoursPerWeekInput] = useState('40');
  
  // Refs for measuring text width (mobile: text-2xl, desktop: text-3xl)
  const hourlyRateMeasureRefMobile = useRef<HTMLSpanElement>(null);
  const hourlyRateMeasureRefDesktop = useRef<HTMLSpanElement>(null);
  const hoursPerWeekMeasureRefMobile = useRef<HTMLSpanElement>(null);
  const hoursPerWeekMeasureRefDesktop = useRef<HTMLSpanElement>(null);
  const [hourlyRateWidthMobile, setHourlyRateWidthMobile] = useState(120);
  const [hourlyRateWidthDesktop, setHourlyRateWidthDesktop] = useState(120);
  const [hoursPerWeekWidthMobile, setHoursPerWeekWidthMobile] = useState(90);
  const [hoursPerWeekWidthDesktop, setHoursPerWeekWidthDesktop] = useState(90);
  
  // Measure text width for hourly rate (mobile)
  useEffect(() => {
    const measure = () => {
      if (hourlyRateMeasureRefMobile.current) {
        const width = hourlyRateMeasureRefMobile.current.offsetWidth;
        if (width > 0) {
          setHourlyRateWidthMobile(Math.max(width + 40, 90));
        }
      }
    };
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [hourlyRateInput]);
  
  // Measure text width for hourly rate (desktop)
  useEffect(() => {
    const measure = () => {
      if (hourlyRateMeasureRefDesktop.current) {
        const width = hourlyRateMeasureRefDesktop.current.offsetWidth;
        if (width > 0) {
          setHourlyRateWidthDesktop(Math.max(width + 32, 90));
        }
      }
    };
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [hourlyRateInput]);
  
  // Measure text width for hours per week (mobile)
  useEffect(() => {
    const measure = () => {
      if (hoursPerWeekMeasureRefMobile.current) {
        const width = hoursPerWeekMeasureRefMobile.current.offsetWidth;
        if (width > 0) {
          setHoursPerWeekWidthMobile(Math.max(width + 40, 70));
        }
      }
    };
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [hoursPerWeekInput]);
  
  // Measure text width for hours per week (desktop)
  useEffect(() => {
    const measure = () => {
      if (hoursPerWeekMeasureRefDesktop.current) {
        const width = hoursPerWeekMeasureRefDesktop.current.offsetWidth;
        if (width > 0) {
          setHoursPerWeekWidthDesktop(Math.max(width + 32, 70));
        }
      }
    };
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [hoursPerWeekInput]);
  
  // Initial measurement on mount
  useEffect(() => {
    const measureAll = () => {
      if (hourlyRateMeasureRefMobile.current) {
        const width = hourlyRateMeasureRefMobile.current.offsetWidth;
        if (width > 0) {
          setHourlyRateWidthMobile(width + 32);
        }
      }
      if (hourlyRateMeasureRefDesktop.current) {
        const width = hourlyRateMeasureRefDesktop.current.offsetWidth;
        if (width > 0) {
          setHourlyRateWidthDesktop(width + 32);
        }
      }
      if (hoursPerWeekMeasureRefMobile.current) {
        const width = hoursPerWeekMeasureRefMobile.current.offsetWidth;
        if (width > 0) {
          setHoursPerWeekWidthMobile(width + 32);
        }
      }
      if (hoursPerWeekMeasureRefDesktop.current) {
        const width = hoursPerWeekMeasureRefDesktop.current.offsetWidth;
        if (width > 0) {
          setHoursPerWeekWidthDesktop(width + 32);
        }
      }
    };
    setTimeout(() => {
      requestAnimationFrame(measureAll);
    }, 0);
  }, []);
  
  // Sync local input state with actual state
  useEffect(() => {
    setHourlyRateInput(hourlyRate[0].toString());
  }, [hourlyRate]);
  
  useEffect(() => {
    setHoursPerWeekInput(hoursPerWeek[0].toString());
  }, [hoursPerWeek]);
  
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
    // Gebruik pensioen uit detacheren berekening (volgens Excel: "Pensioen (uit deta calc)")
    return calculateZZPDetailed(
      hourlyRate[0],
      hoursPerWeek[0],
      config,
      result.reservationBreakdown.employeePension, // Pensioen uit detacheren
      result.employerPension // Werkgeverspensioen uit detacheren
    );
  }, [hourlyRate, hoursPerWeek, config, result.reservationBreakdown.employeePension, result.employerPension]);

  // Comparison mappers (ONLY for comparison header view)
  const detacherenComparable = useMemo(() => employeeResultToComparable(result), [result]);
  const zzpComparable = useMemo(() => zzpResultToComparable(zzpResult, config), [zzpResult, config]);

  // Temporary ZZP tax reservation for comparison (UX bridge, not real tax model)
  // Used for display in comparison view - zzpComparable.netNow already includes this
  const zzpTaxReservation = useMemo(() => calculateZZPTaxReservation(zzpResult, config), [zzpResult, config]);
  const zzpTaxReserve = zzpTaxReservation.taxReserve;
  const zzpNetAfterTaxIndicative = zzpTaxReservation.netAfterTaxIndicative;

  // Value breakdown voor "Vergelijk de Waarde" (marge, kosten, belasting, pensioen, netto)
  const detacherenValueBreakdown = useMemo(() => getDetacherenValueBreakdown(result), [result]);
  const zzpValueBreakdown = useMemo(() => getZZPValueBreakdown(zzpResult, config), [zzpResult, config]);

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

  const formatCurrency = formatCurrencyWhole;
  
  const formatHourly = (val: number, hours: number = monthlyHours) => formatHourlyRate(val, hours);

  return (
      <TooltipProvider>
      <div className="min-h-screen pb-20" style={{ background: 'var(--color-surface-sunken)', fontFamily: 'var(--font-family-sans)', color: 'var(--color-foreground-default)' }}>
      
      {/* Settings Panel - Only visible when enabled via keyboard shortcut (Cmd+Option+S / Ctrl+Alt+S) */}
      {settingsEnabled && (
        <>
          {/* Fixed Configuration Button */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="fixed bottom-8 right-8 bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition-all z-50 flex items-center gap-2 cursor-pointer"
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
                  className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors cursor-pointer"
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
                <Accordion type="multiple" defaultValue={["detacheren-berekening", "zzp-berekening", "vergelijking"]} className="w-full">
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
                        <p className="font-semibold mb-2">Stap 2: Marge CreateNew</p>
                        <p className="text-xs text-gray-600 mb-2">
                          CreateNew houdt een marge in (standaard 15%): 5% winst + 10% kosten/risico.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Netto uurtarief = Bruto uurtarief × (1 - Marge CreateNew)
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
                        <p className="font-semibold mb-2">Stap 1: Uren berekening</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Uren per jaar = uren per week × 52. Onwerkbaar (vakantie/feestdagen) en ziekte correctie worden afgetrokken.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Uren per jaar = Uren/week × 52<br/>
                          Onwerkbaar uren = Uren per jaar × Onwerkbaar%<br/>
                          Netto uren = Uren per jaar - Onwerkbaar uren<br/>
                          Ziekte correctie = Uren per jaar × Ziekte%<br/>
                          Netto met correctie = Netto uren - Ziekte correctie<br/>
                          Effectief per maand = Netto met correctie ÷ 12
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 2: Effectieve omzet</p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Effectieve omzet = Effectief uren/maand × Uurtarief
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 3: Marge CreateNew en kosten</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Marge CreateNew (5%) en kosten freelance bv (10%: incl verzekeringen).
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Marge CreateNew = Omzet × 5%<br/>
                          Inkomen na marge CreateNew = Omzet - Marge CreateNew<br/>
                          Kosten = Omzet × 10%<br/>
                          Inkomen na marge CreateNew en kosten = Inkomen na marge CreateNew - Kosten
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 4: Pensioen (StiPP)</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Zelfde systeem als detacheren: franchise €9,24/uur, werkgever + werknemer percentages.
                          Berekeningsbasis is inkomen na marge en kosten.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Pensioengrondslag = (Inkomen na marge en kosten) - (Franchise × Maanduren)<br/>
                          Pensioen = Pensioengrondslag × (Werkgever% + Werknemer%)
                        </code>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-200">
                        <p className="font-semibold mb-2">Stap 5: ZZP Belasting</p>
                        <p className="text-xs text-gray-600 mb-2">
                          Belastbaar inkomen (jaar) = inkomen na marge CreateNew × 12. Aftrekposten = (pensioen + kosten) × 12.
                          Winst voor belasting - MKB-vrijstelling (13.31%) = belastbaar inkomen.
                          Inkomstenbelasting + ZVW - kortingen = totale belasting.
                        </p>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          Belastbaar inkomen (jaar) = Inkomen na marge CreateNew × 12<br/>
                          Aftrekposten = (Pensioen + Kosten) × 12<br/>
                          Winst voor belasting = Belastbaar inkomen - Aftrekposten<br/>
                          MKB-vrijstelling = Winst × 13.31%<br/>
                          Belastbaar inkomen = Winst - MKB-vrijstelling<br/>
                          Netto per jaar = Belastbaar inkomen - Totale belasting<br/>
                          Netto per maand = Netto per jaar ÷ 12
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
                          <li><strong>Detacheren:</strong> Marge CreateNew (15%) + extra uitkeringen in loonstructuur</li>
                          <li><strong>ZZP:</strong> Marge CreateNew (5%) + kosten freelance bv (10%) + belasting (volgens ZZP tarieven met MKB-vrijstelling)</li>
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
                      className={`p-3 rounded-lg border-2 font-medium transition-all cursor-pointer ${
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
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">Marge CreateNew</h3>
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

              {/* ZZP Settings */}
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2">ZZP Instellingen</h3>
                <ConfigInput
                  label="Onwerkbaar percentage (%) - vakantie/feestdagen"
                  value={config.zzpUnworkableRate * 100}
                  onChange={(val) => updateConfig({zzpUnworkableRate: val / 100})}
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Ziekte correctie (%) - korte termijn ziekte"
                  value={config.zzpSicknessCorrectionRate * 100}
                  onChange={(val) => updateConfig({zzpSicknessCorrectionRate: val / 100})}
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Marge CreateNew (%)"
                  value={config.zzpCompanyMarginRate * 100}
                  onChange={(val) => updateConfig({zzpCompanyMarginRate: val / 100})}
                  min={0}
                  max={20}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Kosten freelance bv (%) - incl verzekeringen"
                  value={config.zzpBusinessCostsRate * 100}
                  onChange={(val) => updateConfig({zzpBusinessCostsRate: val / 100})}
                  min={0}
                  max={10}
                  step={0.1}
                  suffix="%"
                />
                <ConfigInput
                  label="Belastingreservering (%) - voor indicatief netto"
                  value={config.zzpTaxReserveRate * 100}
                  onChange={(val) => updateConfig({zzpTaxReserveRate: val / 100})}
                  min={0}
                  max={50}
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
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
        <section className="border-b pt-12 pb-12 rounded-2xl" style={{ background: 'var(--color-surface-default)', borderColor: 'var(--color-border-subtle)', boxShadow: 'var(--shadow-m)' }}>
          <div className="text-center space-y-6 px-6">
            <h1 className="cnds-heading-1" style={{ color: 'var(--color-foreground-default)' }}>
              Je inkomen is meer<br />dan je maandbedrag
            </h1>
            <p className="cnds-body-large max-w-2xl mx-auto" style={{ color: 'var(--color-foreground-muted)' }}>
              Zie wat je direct ontvangt en wat je opbouwt voor later.
            </p>
          </div>
        </section>
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

      {/* SECTION 2: Controls (shared across all tabs) */}
      <div className="mx-auto px-4 mt-3" style={{ maxWidth: '1200px' }}>
        <div className="p-4 mobile:p-8 rounded-2xl border" style={{ background: 'var(--color-surface-default)', borderColor: 'var(--color-border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="grid mobile:grid-cols-2 mobile:gap-6 gap-4">
            {/* Hourly Rate */}
            <div className="space-y-2 mobile:space-y-3">
              <label className="cnds-label-small uppercase tracking-wider pb-0 block" style={{ color: 'var(--color-foreground-muted)' }}>
                Uurtarief Opdrachtgever
              </label>
              {/* Mobile: input + slider inline */}
              <div className="flex items-center gap-2 mobile:hidden">
                <div className="relative inline-block shrink-0">
                  <span
                    ref={hourlyRateMeasureRefMobile}
                    className="text-2xl font-bold whitespace-pre opacity-0 pointer-events-none absolute"
                    aria-hidden="true"
                    style={{ visibility: 'hidden', position: 'absolute' }}
                  >
                    {hourlyRateInput || '0'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={hourlyRateInput}
                    onChange={(e) => setHourlyRateInput(e.target.value.replace(',', '.'))}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value.replace(',', '.'));
                      if (isNaN(value) || value < 30) {
                        setHourlyRate([30]);
                      } else if (value > 200) {
                        setHourlyRate([200]);
                      } else {
                        setHourlyRate([value]);
                      }
                    }}
                    style={{ width: `${hourlyRateWidthMobile}px` }}
                    className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                  />
                </div>
                <Slider
                  value={hourlyRate}
                  onValueChange={setHourlyRate}
                  min={30}
                  max={200}
                  step={0.5}
                  className="flex-1"
                />
              </div>
              {/* Desktop: input with suffix, slider below */}
              <div className="hidden mobile:block space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative inline-block">
                    <span
                      ref={hourlyRateMeasureRefDesktop}
                      className="text-3xl font-bold whitespace-pre opacity-0 pointer-events-none absolute"
                      aria-hidden="true"
                      style={{ visibility: 'hidden', position: 'absolute' }}
                    >
                      {hourlyRateInput || '0'}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={hourlyRateInput}
                      onChange={(e) => setHourlyRateInput(e.target.value.replace(',', '.'))}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value.replace(',', '.'));
                        if (isNaN(value) || value < 30) {
                          setHourlyRate([30]);
                        } else if (value > 200) {
                          setHourlyRate([200]);
                        } else {
                          setHourlyRate([value]);
                        }
                      }}
                      style={{ width: `${hourlyRateWidthDesktop}px` }}
                      className="text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                    />
                  </div>
                  <span className="text-gray-400 font-medium text-base whitespace-nowrap">€/uur</span>
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
            </div>

            {/* Hours Per Week */}
            <div className="space-y-2 mobile:space-y-3">
              <label className="cnds-label-small uppercase tracking-wider text-gray-500 pb-0 block">
                Uren Per Week
              </label>
              {/* Mobile: input + slider inline */}
              <div className="flex items-center gap-2 mobile:hidden">
                <div className="relative inline-block shrink-0">
                  <span
                    ref={hoursPerWeekMeasureRefMobile}
                    className="text-2xl font-bold whitespace-pre opacity-0 pointer-events-none absolute"
                    aria-hidden="true"
                    style={{ visibility: 'hidden', position: 'absolute' }}
                  >
                    {hoursPerWeekInput || '0'}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={hoursPerWeekInput}
                    onChange={(e) => setHoursPerWeekInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (isNaN(value) || value < 16) {
                        setHoursPerWeek([16]);
                      } else if (value > 40) {
                        setHoursPerWeek([40]);
                      } else {
                        setHoursPerWeek([value]);
                      }
                    }}
                    style={{ width: `${hoursPerWeekWidthMobile}px` }}
                    className="text-2xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                  />
                </div>
                <Slider
                  value={hoursPerWeek}
                  onValueChange={setHoursPerWeek}
                  min={16}
                  max={40}
                  step={1}
                  className="flex-1"
                />
              </div>
              {/* Desktop: input with suffix, slider below */}
              <div className="hidden mobile:block space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative inline-block">
                    <span
                      ref={hoursPerWeekMeasureRefDesktop}
                      className="text-3xl font-bold whitespace-pre opacity-0 pointer-events-none absolute"
                      aria-hidden="true"
                      style={{ visibility: 'hidden', position: 'absolute' }}
                    >
                      {hoursPerWeekInput || '0'}
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={hoursPerWeekInput}
                      onChange={(e) => setHoursPerWeekInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                      onBlur={(e) => {
                        const value = parseInt(e.target.value);
                        if (isNaN(value) || value < 16) {
                          setHoursPerWeek([16]);
                        } else if (value > 40) {
                          setHoursPerWeek([40]);
                        } else {
                          setHoursPerWeek([value]);
                        }
                      }}
                      style={{ width: `${hoursPerWeekWidthDesktop}px` }}
                      className="text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-md px-4 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                    />
                  </div>
                  <span className="text-gray-400 font-medium text-base whitespace-nowrap">uren</span>
                </div>
                <Slider
                  value={hoursPerWeek}
                  onValueChange={setHoursPerWeek}
                  min={16}
                  max={40}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Tab Navigation */}
      <section className="pt-8 pb-4 px-4 mx-auto" style={{ maxWidth: '1200px' }}>
        <div className="flex justify-center border-b border-gray-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('comparison')}
              className={clsx(
                "px-3 py-2 cnds-nav-label transition-colors cursor-pointer",
                activeTab === 'comparison'
                  ? "border-b-[3px] border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Vergelijking
            </button>
            <button
              onClick={() => setActiveTab('detacheren')}
              className={clsx(
                "px-3 py-2 cnds-nav-label transition-colors cursor-pointer",
                activeTab === 'detacheren'
                  ? "border-b-[3px] border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Detacheren
            </button>
            <button
              onClick={() => setActiveTab('zzp')}
              className={clsx(
                "px-3 py-2 cnds-nav-label transition-colors cursor-pointer",
                activeTab === 'zzp'
                  ? "border-b-[3px] border-gray-900 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              Freelance
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: Comparison View (when activeTab === 'comparison') */}
      {activeTab === 'comparison' && (
        <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
        <section className="space-y-3">

          {/* Vergelijk de Waarde – Verdeling marge, kosten, belasting, pensioen, netto */}
          <div className="mx-auto space-y-6" style={{ maxWidth: '1200px' }}>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mobile:p-10 space-y-6">
              <div className="grid grid-cols-2 gap-4 mobile:gap-10 min-h-[70vh] mobile:min-h-0 mb-0">
                {/* Detacheren – Waarde-blok */}
                <ValueBlock
                  title="Detacheren"
                  subtitle="Flexwerk"
                  total={detacherenValueBreakdown.total}
                  totalLabel="Factuurbedrag"
                  breakdown={detacherenValueBreakdown}
                  formatCurrency={formatCurrency}
                  variant="detacheren"
                />
                {/* ZZP – Waarde-blok */}
                <ValueBlock
                  title="Freelance"
                  subtitle="Ondernemerschap"
                  total={zzpValueBreakdown.total}
                  totalLabel="Factuurbedrag"
                  breakdown={zzpValueBreakdown}
                  formatCurrency={formatCurrency}
                  variant="zzp"
                  baseTotal={detacherenValueBreakdown.total}
                  correction={detacherenValueBreakdown.total - zzpValueBreakdown.total}
                />
              </div>

            </div>
          </div>
        </section>

        <Disclaimer />
        </div>
      )}

      {/* SECTION 4: Calculator + Simple Flow (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <div className="mx-auto" style={{ maxWidth: '1200px', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
      <section className="space-y-3">
        {/* Visual Flow */}
        <div className="flex flex-col md:flex-row gap-2 items-stretch">
            {/* First two cards side by side on mobile */}
            <div className="flex flex-row gap-2 items-stretch flex-[2]">
                {/* Step 1: Client Pays */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col relative group flex-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">WAT DE KLANT BETAALT</div>
                    <div className="flex flex-col mt-2">
                         <span className="text-2xl font-bold text-gray-900">{formatCurrency(clientTotal)}</span>
                         <span className="text-sm font-medium text-gray-400">{formatHourly(clientTotal)} /uur</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-3">Het volledige maandbedrag</div>
                </div>

                {/* Step 2: Company Share - Match Marge color from bar chart */}
                <div className="bg-marge-100 p-6 rounded-xl border border-marge-400/20 flex flex-col relative flex-[0.67]">
                    <div className="text-xs font-bold uppercase tracking-wider text-marge-text whitespace-nowrap">MARGE CREATENEW</div>
                    <div className="flex flex-col mt-2">
                         <div className="flex flex-col mb-2">
                              <span className="text-2xl font-bold text-marge-text">{formatCurrency(marginBreakdown.profit)}</span>
                              <span className="text-xs text-marge-text">Winst (5%)</span>
                         </div>
                         <div className="flex flex-col">
                              <span className="text-sm font-medium text-marge-text">{formatCurrency(marginBreakdown.admin)}</span>
                              <span className="text-[10px] text-marge-text/70">Kosten (10%)</span>
                         </div>
                    </div>
                    <div className="text-xs text-marge-text mt-auto">Totaal: {formatCurrency(companyTotal)}</div>
                </div>
            </div>

            {/* Step 3: Candidate Total */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col relative flex-[2]">
                <div className="flex items-start justify-between gap-4">
                     <div className="flex flex-col">
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">JOUW TOTALE BELONING</div>
                          <span className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(candidateTotal)}</span>
                          <span className="text-sm font-medium text-gray-500">{formatHourly(candidateTotal)} /uur</span>
                     </div>
                     <div className="flex flex-col items-end">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">JOUW TOTALE OPBRENGST</span>
                          <span className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(netTotal + additionalBenefits.totalAdditionalBenefits + employerPension + reservationBreakdown.employeePension)}</span>
                          <span className="text-xs text-gray-500">Direct + later</span>
                     </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-gray-200">
                    <div className="bg-netto-100 rounded-lg p-3 border border-netto-400/20">
                        <div className="text-base font-bold text-netto-text">{formatCurrency(netTotal)}</div>
                        <div className="text-[10px] text-netto-text/80 font-medium uppercase tracking-wide">NETTO LOON</div>
                        <div className="text-[10px] text-netto-text/60">{formatHourly(netTotal)}/u</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="text-base font-bold text-gray-900">{formatCurrency(additionalBenefits.totalAdditionalBenefits)}</div>
                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">EXTRA PER MAAND</div>
                        <div className="text-[10px] text-gray-400">Uitkeringen</div>
                    </div>
                    <div className="bg-pensioen-100 rounded-lg p-3 border border-pensioen-400/20">
                        <div className="text-base font-bold text-pensioen-text">{formatCurrency(employerPension + reservationBreakdown.employeePension)}</div>
                        <div className="text-[10px] text-pensioen-text font-medium uppercase tracking-wide flex items-center gap-1">
                             <PiggyBank className="w-3 h-3" /> PENSIOEN INLEG
                        </div>
                        <div className="text-[10px] text-pensioen-text/70">Voor later</div>
                    </div>
                </div>
            </div>
        </div>

      </section>
      </div>
      )}

      {/* SECTION 3: Detailed Breakdown (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <div className="mx-auto mt-3" style={{ maxWidth: 'var(--breakpoint-container-max)', paddingLeft: 'var(--spacing-l)', paddingRight: 'var(--spacing-l)' }}>
      <section>
        <Accordion type="single" collapsible defaultValue="" className="w-full">
            <AccordionItem value="breakdown" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-start text-left">
                        <span className="text-lg font-bold text-gray-900">Volledige opbouw van jouw tarief</span>
                        <span className="text-sm text-gray-500 font-normal">Zo wordt elke stap van tarief naar netto loon berekend</span>
                    </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                    <div className="divide-y divide-gray-200">
                        
                        {/* Group A: Company Share */}
                        <div className="p-6 space-y-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Marge CreateNew (15%)</h3>
                                <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
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
                                tooltip="Dit is de marge van CreateNew. Deze winst maakt het mogelijk om te investeren in betere dienstverlening, opdrachtenwerving en innovatie."
                            />
                            <div className="flex justify-between items-center pt-2 text-gray-600 text-sm font-medium border-t border-gray-300">
                                <span>Totaal inhouding bedrijf</span>
                                <span>{formatCurrency(companyTotal)} <span className="text-xs font-normal">({formatHourly(companyTotal)})</span></span>
                            </div>
                        </div>

                        {/* Group B: Conversion to Gross */}
                        <div className="p-6 bg-white space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Van kandidaat tarief naar bruto loon</h3>
                                <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
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
                        <div className="p-6 bg-white space-y-4">
                             <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900">Van bruto naar netto</h3>
                                <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
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
                                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                        <PiggyBank className="w-3 h-3" />
                                        Reserveringen voor jou (niet belast)
                                    </div>
                                    
                                    {/* Pensionable Wage Explanation */}
                                    <div className="p-3 rounded-lg space-y-2 bg-gray-100 border border-gray-200">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-gray-700">Pensioengevend loon (na franchise)</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(pensionableWage)}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-gray-500">
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
                                    <p className="text-xs text-gray-500 leading-tight pl-4 -mt-2">
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
                                <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center text-sm border border-gray-200">
                                    <span className="font-medium text-gray-700">Loon voor loonbelasting</span>
                                    <span className="font-bold text-gray-900">{formatCurrency(taxableTotal)}</span>
                                </div>
                                
                                {/* Taxes Section */}
                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                        Belastingen en premies
                                    </div>
                                    
                                    {/* Tax Breakdown with Credits */}
                                    <div className="p-3 rounded-lg space-y-2 bg-gray-100 border border-gray-200">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-gray-700">Belasting vóór heffingskorting</span>
                                            <span className="font-bold text-gray-900">{formatCurrency(taxBreakdown.wageTaxBeforeCredits)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-600">
                                            <span className="font-medium">− Heffingskortingen</span>
                                            <span className="font-bold">− {formatCurrency(taxBreakdown.taxCredits)}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed text-gray-500">
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
                        <div className="p-8 bg-netto-100 text-netto-text space-y-6 rounded-b-lg">
                            <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-netto-text">Netto loon</h3>
                                    <p className="text-netto-text/80 text-sm">Dit ontvang je elke maand op je rekening</p>
                                    <p className="text-netto-text/60 text-xs mt-2 max-w-md">
                                        Dit bedrag kan iets afwijken van je echte loonstrook, maar geeft een realistische indicatie
                                    </p>
                                </div>
                                <div className="text-left mobile:text-right">
                                    <div className="text-3xl font-bold text-netto-text">
                                        {formatCurrency(netTotal)}
                                    </div>
                                    <div className="text-netto-text/70 text-sm font-medium">
                                        {formatHourly(netTotal)} per uur
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional Benefits Box */}
                            <div className="rounded-lg p-4 border bg-white/50 border-netto-400/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins className="w-5 h-5 text-netto-text/80" />
                                    <div>
                                      <h4 className="font-bold text-netto-text text-sm">Plus: Extra uitkeringen die je ontvangt</h4>
                                      <p className="text-netto-text/60 text-[10px] mt-0.5">Deze extra's zijn in je loonstructuur verwerkt</p>
                                    </div>
                                </div>
                                <div className="grid mobile:grid-cols-2 gap-3">
                                    <div className="bg-white rounded p-3 border border-netto-400/20">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-netto-text/80">Vakantiedagen ({(config.holidayHoursRate * 100).toFixed(2)}%)</span>
                                            <InfoTooltip content={
                                                <div>
                                                    <p className="mb-1">Dit is de geldelijke waarde van je wettelijke vakantiedagen.</p>
                                                    <p className="mb-1">Berekening: {(config.holidayHoursRate * 100).toFixed(2)}% van je werkuren ({(monthlyHours * config.holidayHoursRate).toFixed(1)} uur/maand) × je netto uurtarief ({new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(netTotal/monthlyHours)}).</p>
                                                    <p>Deze uren worden voor je gereserveerd zodat je betaald vrij kunt zijn!</p>
                                                </div>
                                            } side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-netto-text">{formatCurrency(additionalBenefits.holidayDaysEquivalent)}</div>
                                        <div className="text-[10px] text-netto-text/60 mt-1">{(monthlyHours * config.holidayHoursRate).toFixed(1)} uur/maand</div>
                                    </div>
                                    <div className="bg-white rounded p-3 border border-netto-400/20">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-netto-text/80">Vakantiegeld ({(config.holidayAllowanceRate * 100).toFixed(0)}%)</span>
                                            <InfoTooltip content="Ieder jaar in mei of juni ontvang je 8% van je jaarsalaris als vakantiegeld. Dit is wettelijk verplicht en staat los van je normale maandloon. Perfect voor een mooie vakantie!" side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-netto-text">{formatCurrency(additionalBenefits.holidayAllowance)}</div>
                                    </div>
                                    {config.hasYearEndBonus && additionalBenefits.yearEndBonus > 0 && (
                                        <div className="bg-white rounded p-3 border border-netto-400/20">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs text-netto-text/80">Eindejaarsuitkering ({(config.yearEndBonusRate * 100).toFixed(1)}%)</span>
                                                <InfoTooltip content="Ook wel '13e maand' genoemd. Dit is een extra uitkering van 4.5% van je jaarsalaris die je vaak in december ontvangt. Dit is geen wettelijke verplichting, maar een veel voorkomende arbeidsvoorwaarde." side="left" />
                                            </div>
                                            <div className="text-lg font-bold text-netto-text">{formatCurrency(additionalBenefits.yearEndBonus)}</div>
                                        </div>
                                    )}
                                    {config.hasIKB && additionalBenefits.ikbContribution > 0 && (
                                        <div className="bg-white rounded p-3 border border-netto-400/20">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-xs text-netto-text/80">IKB bijdrage ({(config.ikbRate * 100).toFixed(1)}%)</span>
                                                <InfoTooltip content="Individueel Keuze Budget. Dit is een flexibel budget dat je kunt inzetten voor extra verlof, extra pensioen, of uitbetaling. Jij kiest zelf waar je het voor gebruikt!" side="left" />
                                            </div>
                                            <div className="text-lg font-bold text-netto-text">{formatCurrency(additionalBenefits.ikbContribution)}</div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 pt-3 border-t border-netto-400/30 flex justify-between items-center">
                                    <span className="text-sm text-netto-text/80">Totaal extra per maand</span>
                                    <span className="text-xl font-bold text-netto-text">{formatCurrency(additionalBenefits.totalAdditionalBenefits)}</span>
                                </div>
                                
                                {/* Pension - separate section for long-term */}
                                <div className="mt-4 pt-4 border-t border-netto-400/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PiggyBank className="w-4 h-4 text-netto-text/70" />
                                        <h5 className="font-bold text-netto-text text-xs">Opbouw voor later (pensioen)</h5>
                                    </div>
                                    <div className="bg-white rounded p-3 border border-netto-400/20">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <span className="text-xs text-netto-text/80">Totale pensioen inleg ({((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}%)</span>
                                            <InfoTooltip content={
                                                <div>
                                                    <p className="mb-2">Dit is de totale pensioenbijdrage die elke maand voor jou wordt opgebouwd:</p>
                                                    <p className="mb-1">• Werkgeversdeel: {(config.employerPensionRate * 100).toFixed(1)}% ({formatCurrency(employerPension)})</p>
                                                    <p className="mb-2">• Werknemersdeel: {(config.employeePensionRate * 100).toFixed(1)}% ({formatCurrency(reservationBreakdown.employeePension)})</p>
                                                    <p>Dit geld krijg je pas later uitgekeerd, vanaf je pensioenleeftijd. Het wordt belegd en groeit mee, zodat je een goed aanvullend pensioen opbouwt bovenop je AOW.</p>
                                                </div>
                                            } side="left" />
                                        </div>
                                        <div className="text-lg font-bold text-netto-text">{formatCurrency(employerPension + reservationBreakdown.employeePension)}</div>
                                        <div className="text-[10px] text-netto-text/60 mt-1">wordt elke maand voor je opgebouwd</div>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-netto-text/70 mt-3 leading-relaxed">
                                    Je echte inkomen is dus: {formatCurrency(netTotal)} + {formatCurrency(additionalBenefits.totalAdditionalBenefits)} = <span className="font-bold text-netto-text">{formatCurrency(netTotal + additionalBenefits.totalAdditionalBenefits)}</span> per maand!
                                </p>
                                <p className="text-xs text-netto-text/60 mt-2 leading-relaxed">
                                    Plus {formatCurrency(employerPension + reservationBreakdown.employeePension)} aan pensioen per maand voor later!
                                </p>
                            </div>

                            {/* CAO Indicator */}
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-netto-400/30 mt-4">
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-netto-text" />
                                <span className="text-sm font-medium text-netto-text">Actieve CAO:</span>
                                <span className="text-sm font-bold text-netto-text">{selectedCAO}</span>
                              </div>
                              {settingsEnabled && (
                                <button
                                  onClick={() => setShowConfig(true)}
                                  className="text-xs text-netto-text hover:text-netto-text/80 underline cursor-pointer"
                                >
                                  Wijzig CAO
                                </button>
                              )}
                            </div>
                        </div>

                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </section>
      </div>
      )}

      {/* Disclaimer (Detacheren Tab) */}
      {activeTab === 'detacheren' && (
      <div className="mx-auto px-4" style={{ maxWidth: '1200px' }}>
        <Disclaimer />
      </div>
      )}

      {/* SECTION 5: ZZP Tab */}
      {activeTab === 'zzp' && (
      <div className="max-w-5xl mx-auto" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
      <section className="space-y-3">
        {/* Visual Flow for ZZP */}
        <div className="flex flex-col md:flex-row gap-2 items-stretch">
          {/* First two cards side by side on mobile */}
          <div className="flex flex-row gap-2 items-stretch flex-[2]">
            {/* Step 1: Revenue */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col relative group flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">BRUTO OMZET</div>
              <div className="flex flex-col mt-2">
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(zzpResult.revenueTotal)}</span>
                <span className="text-sm font-medium text-gray-400">{formatHourly(zzpResult.revenueTotal, zzpResult.monthlyHours)} /uur</span>
              </div>
              <div className="text-sm text-gray-500 mt-3">Uurtarief × uren</div>
            </div>

            {/* Step 2: Costs - Match Marge color from bar chart */}
            <div className="bg-marge-100 p-6 rounded-xl border border-marge-400/20 flex flex-col relative flex-[0.67]">
              <div className="text-xs font-bold uppercase tracking-wider text-marge-text whitespace-nowrap">KOSTEN & RISICO</div>
              <div className="flex flex-col mt-2">
                <div className="flex flex-col mb-2">
                  <span className="text-2xl font-bold text-marge-text">{formatCurrency(zzpResult.costsBreakdown.entrepreneurRisk)}</span>
                  <span className="text-xs text-marge-text">Marge CreateNew ({(config.zzpCompanyMarginRate * 100).toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Revenue After Costs */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col relative flex-[2]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">JOUW TOTALE BELONING</div>
                <span className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(zzpResult.revenueAfterCosts)}</span>
                <span className="text-sm font-medium text-gray-500">{formatHourly(zzpResult.revenueAfterCosts, zzpResult.monthlyHours)} /uur</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-wide">JOUW TOTALE OPBRENGST</span>
                <span className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(zzpNetAfterTaxIndicative + zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</span>
                <span className="text-xs text-gray-500">Direct + later</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-auto pt-4 border-t border-gray-200">
              <div className="bg-netto-100 rounded-lg p-3 border border-netto-400/20">
                <div className="text-base font-bold text-netto-text">{formatCurrency(zzpNetAfterTaxIndicative)}</div>
                <div className="text-[10px] text-netto-text/80 font-medium uppercase tracking-wide md:whitespace-nowrap">besteedbaar inkomen</div>
                <div className="text-[10px] text-netto-text/60">{formatHourly(zzpNetAfterTaxIndicative, zzpResult.monthlyHours)}/u</div>
              </div>
              <div className="bg-kosten-100 rounded-lg p-3 border border-kosten-400/20">
                <div className="text-base font-bold text-kosten-text">{formatCurrency(zzpResult.costsBreakdown.overheadCosts)}</div>
                <div className="text-[10px] text-kosten-text/80 font-medium uppercase tracking-wide">BEDRIJFSKOSTEN</div>
                <div className="text-[10px] text-kosten-text/60">{formatHourly(zzpResult.costsBreakdown.overheadCosts, zzpResult.monthlyHours)}/u</div>
              </div>
              <div className="bg-pensioen-100 rounded-lg p-3 border border-pensioen-400/20">
                <div className="text-base font-bold text-pensioen-text">{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</div>
                <div className="text-[10px] text-pensioen-text font-medium uppercase tracking-wide">
                  PENSIOEN INLEG
                </div>
                <div className="text-[10px] text-pensioen-text/70">Voor later</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown for ZZP */}
        <section>
          <Accordion type="single" collapsible defaultValue="" className="w-full">
            <AccordionItem value="breakdown" className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-start text-left">
                  <span className="text-lg font-bold text-gray-900">Volledige opbouw van je ZZP-inkomen</span>
                  <span className="text-sm text-gray-500 font-normal">Zo wordt elke stap van omzet naar netto berekend</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-gray-200">
                  {/* Group A: Revenue */}
                  <div className="p-6 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Bruto omzet</h3>
                      <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
                        Het totale bedrag dat je factureert op basis van je uurtarief en uren
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-gray-900 pb-2 border-b border-gray-200">
                      <span>Uurtarief × uren per maand</span>
                      <span>{formatCurrency(zzpResult.revenueTotal)} <span className="text-xs font-normal text-gray-500">({formatHourly(zzpResult.revenueTotal, zzpResult.monthlyHours)})</span></span>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 mt-3">
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong>Let op:</strong> Niet alle uren zijn factureerbaar. <strong>Onwerkbaar: {(config.zzpUnworkableRate * 100).toFixed(0)}%</strong> (vakantie/feestdagen) + <strong>Ziekte correctie: {(config.zzpSicknessCorrectionRate * 100).toFixed(0)}%</strong>. Dit bepaalt je effectieve factureerbare uren per maand: {zzpResult.monthlyHours.toFixed(1)} uur.
                      </p>
                    </div>
                  </div>

                  {/* Group B: Costs */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Kosten & Risico</h3>
                      <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
                        Kosten die worden ingehouden van je bruto omzet
                      </span>
                    </div>
                    <BreakdownRow 
                      label={`Marge CreateNew (${(config.zzpCompanyMarginRate * 100).toFixed(0)}%)`}
                      value={zzpResult.costsBreakdown.entrepreneurRisk} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Dit is de marge van CreateNew voor het platform. Deze marge (5%) is lager dan bij detacheren (15%) omdat je als ZZP'er meer risico en verantwoordelijkheid draagt. Deze winst maakt het mogelijk om te investeren in betere dienstverlening en opdrachtenwerving."
                    />
                    <BreakdownRow 
                      label={`Kosten ${(config.zzpBusinessCostsRate * 100).toFixed(0)}%`}
                      value={zzpResult.costsBreakdown.overheadCosts} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip="Alle bedrijfskosten die je als ZZP'er hebt: verzekeringen (aansprakelijkheid, rechtsbijstand), administratie, boekhouding, en andere operationele kosten. Deze 10% dekt alle overhead die nodig is om als zelfstandige te opereren."
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-gray-500 text-sm font-medium">
                      <span>Totaal kosten</span>
                      <span>{formatCurrency(zzpResult.costsTotal)} <span className="text-xs font-normal">({formatHourly(zzpResult.costsTotal, zzpResult.monthlyHours)})</span></span>
                    </div>
                  </div>

                  {/* Group C: Revenue After Costs */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Omzet na kosten</h3>
                      <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
                        Het bedrag dat overblijft na aftrek van alle kosten
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm border border-gray-200">
                      <span className="font-medium text-gray-600">Bruto omzet - Kosten</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-bold text-gray-900">{formatCurrency(zzpResult.revenueAfterCosts)} <span className="text-xs font-normal text-gray-500">({formatHourly(zzpResult.revenueAfterCosts, zzpResult.monthlyHours)})</span></span>
                    </div>
                  </div>

                  {/* Group D: Pension */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Pensioenopbouw</h3>
                      <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
                        Zelfde pensioen als bij detacheren
                      </span>
                    </div>
                    
                    {/* Pensionable Wage Explanation */}
                    <div className="p-3 rounded-lg space-y-2 bg-gray-100 border border-gray-200">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-gray-700">Pensioengevend loon (na franchise)</span>
                        <span className="font-bold text-gray-900">{formatCurrency(zzpResult.pensionableWage)}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-500">
                        Niet je volledige omzet telt mee voor pensioenopbouw. We trekken een vast bedrag (franchise) af van je omzet na kosten.
                      </p>
                      <p className="text-xs leading-relaxed text-gray-600 font-medium mt-2">
                        Dit pensioen is vergelijkbaar gemaakt met de wettelijke pensioenverplichting voor flexwerkers volgens de ABU CAO. Dit is een aan te raden bedrag voor zzp'ers.
                      </p>
                    </div>
                    
                    <BreakdownRow 
                      label={`Pensioen (werknemersdeel, ${(config.employeePensionRate * 100).toFixed(1)}%)`}
                      value={zzpResult.reservationBreakdown.employeePension} 
                      highlight 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip={`Dit is jouw eigen bijdrage aan je pensioen (${(config.employeePensionRate * 100).toFixed(1)}% van je pensioengevend loon). Deze wordt ingehouden vóór belasting, dus je bespaart belasting over dit bedrag.`}
                    />
                    <p className="text-xs text-gray-500 leading-tight pl-4 -mt-2">
                      Werknemersdeel wordt voor jou apart gezet, vóór belasting
                    </p>
                    <BreakdownRow 
                      label={`Pensioen (werkgeversdeel, ${(config.employerPensionRate * 100).toFixed(1)}%)`}
                      value={zzpResult.employerPension} 
                      monthlyHours={zzpResult.monthlyHours}
                      tooltip={`Het werkgeversdeel van de pensioenopbouw (${(config.employerPensionRate * 100).toFixed(1)}% van je pensioengevend loon). Dit is een extra bijdrage bovenop je omzet na kosten die direct naar je pensioen gaat.`}
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-gray-500 text-sm font-medium">
                      <span>Totaal pensioen inleg</span>
                      <span>{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)} <span className="text-xs font-normal">({formatHourly(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension, zzpResult.monthlyHours)})</span></span>
                    </div>
                  </div>

                  {/* Group E: Net Before Tax */}
                  <div className="p-6 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Winst vóór belasting</h3>
                      <span className="text-xs text-gray-500 max-w-[50%] text-right leading-tight">
                        Het bedrag dat overblijft na kosten en pensioen, vóór belasting
                      </span>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center text-sm border border-gray-200">
                      <span className="font-medium text-gray-600">Omzet na kosten - Pensioen</span>
                      <span className="font-bold text-gray-900">{formatCurrency(zzpResult.netBeforeTax)} <span className="text-xs font-normal text-gray-500">({formatHourly(zzpResult.netBeforeTax, zzpResult.monthlyHours)})</span></span>
                    </div>
                    
                    {zzpResult.taxBreakdown && (
                      <div className="pl-4 space-y-4 border-l-2 border-gray-200 mt-4">
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                            Belastingberekening
                          </div>
                          
                          <div className="p-3 rounded-lg space-y-2 bg-gray-100 border border-gray-200">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-gray-700">Winst voor belasting</span>
                              <span className="font-bold text-gray-900">{formatCurrency(zzpResult.taxBreakdown.profitBeforeTax / 12)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span className="font-medium">− Zelfstandigenaftrek</span>
                              <span className="font-bold">− {formatCurrency(zzpResult.taxBreakdown.annualDeductions / 12)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-600">
                              <span className="font-medium">− MKB-vrijstelling ({(config.zzpMkbVrijstellingRate * 100).toFixed(2)}%)</span>
                              <span className="font-bold">− {formatCurrency(zzpResult.taxBreakdown.mkbVrijstelling / 12)}</span>
                            </div>
                            <p className="text-xs leading-relaxed text-gray-500">
                              Als zelfstandige heb je recht op aftrekposten die je belastbaar inkomen verlagen
                            </p>
                          </div>
                          
                          <div className="p-3 bg-gray-100 rounded-lg flex justify-between items-center text-sm border border-gray-200">
                            <span className="font-medium text-gray-700">Belastbaar inkomen</span>
                            <span className="font-bold text-gray-900">{formatCurrency(zzpResult.taxBreakdown.taxableIncome / 12)}</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                              Belastingen en premies
                            </div>
                            
                            <div className="p-3 rounded-lg space-y-2 bg-gray-100 border border-gray-200">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-700">Inkomstenbelasting</span>
                                <span className="font-bold text-gray-900">{formatCurrency(zzpResult.taxBreakdown.incomeTax / 12)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-gray-700">Zvw-premie</span>
                                <span className="font-bold text-gray-900">{formatCurrency(zzpResult.taxBreakdown.zvwContribution / 12)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span className="font-medium">− Algemene heffingskorting</span>
                                <span className="font-bold">− {formatCurrency(zzpResult.taxBreakdown.algemeenHeffingskorting / 12)}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-600">
                                <span className="font-medium">− Arbeidskorting</span>
                                <span className="font-bold">− {formatCurrency(zzpResult.taxBreakdown.arbeidskorting / 12)}</span>
                              </div>
                              <p className="text-xs leading-relaxed text-gray-500">
                                Heffingskortingen verlagen de belasting die je betaalt
                              </p>
                            </div>
                            
                            <BreakdownRow 
                              label="Totale belasting per maand" 
                              value={zzpResult.taxBreakdown.totalTax / 12} 
                              monthlyHours={zzpResult.monthlyHours}
                              tooltip="Dit is de totale belasting die je per maand betaalt: inkomstenbelasting + Zvw-premie minus heffingskortingen. Dit bedrag wordt maandelijks gereserveerd."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Group F: Net Result */}
                  <div className="p-8 bg-netto-100 text-netto-text space-y-6 rounded-b-lg">
                    <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-netto-text">Indicatief op rekening na belastingreservering</h3>
                        <p className="text-netto-text/80 text-sm">Dit ontvang je elke maand op je rekening (indicatief)</p>
                        <p className="text-netto-text/60 text-xs mt-2 max-w-md">
                          {zzpResult.taxBreakdown 
                            ? `Exacte belasting berekend op basis van je situatie. Je betaalt ${formatCurrency(zzpResult.taxBreakdown.totalTax / 12)} per maand aan belasting.`
                            : `We reserveren tijdelijk ${(config.zzpTaxReserveRate * 100).toFixed(0)}% voor belasting, exacte belasting hangt af van je situatie`
                          }
                        </p>
                      </div>
                      <div className="text-left mobile:text-right">
                        <div className="text-3xl font-bold text-netto-text">
                          {formatCurrency(zzpNetAfterTaxIndicative)}
                        </div>
                        <div className="text-netto-text/70 text-sm font-medium">
                          {formatHourly(zzpNetAfterTaxIndicative, zzpResult.monthlyHours)} per uur
                        </div>
                      </div>
                    </div>
                    
                    {!zzpResult.taxBreakdown && (
                      <div className="rounded-lg p-3 border bg-white/50 border-netto-400/30">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs text-netto-text/80">Belastingreservering ({(config.zzpTaxReserveRate * 100).toFixed(0)}%)</span>
                        </div>
                        <div className="text-lg font-bold text-netto-text">{formatCurrency(zzpTaxReserve)}</div>
                        <div className="text-[10px] text-netto-text/60 mt-1">
                          Dit zetten veel zzp'ers apart om belasting te betalen
                        </div>
                      </div>
                    )}
                    
                    {/* Pension - separate section for long-term */}
                    <div className="mt-4 pt-4 border-t border-netto-400/30">
                      <div className="flex items-center gap-2 mb-2">
                        <PiggyBank className="w-4 h-4 text-netto-text/70" />
                        <h5 className="font-bold text-netto-text text-xs">Opbouw voor later (pensioen)</h5>
                      </div>
                      <div className="bg-white rounded p-3 border border-netto-400/20">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs text-netto-text/80">Totale pensioen inleg ({((config.employerPensionRate + config.employeePensionRate) * 100).toFixed(1)}%)</span>
                          <InfoTooltip content={
                            <div>
                              <p className="mb-2">Dit is de totale pensioenbijdrage die elke maand voor jou wordt opgebouwd:</p>
                              <p className="mb-1">• Werkgeversdeel: {(config.employerPensionRate * 100).toFixed(1)}% ({formatCurrency(zzpResult.employerPension)})</p>
                              <p className="mb-2">• Werknemersdeel: {(config.employeePensionRate * 100).toFixed(1)}% ({formatCurrency(zzpResult.reservationBreakdown.employeePension)})</p>
                              <p>Dit geld krijg je pas later uitgekeerd, vanaf je pensioenleeftijd. Het wordt belegd en groeit mee, zodat je een goed aanvullend pensioen opbouwt bovenop je AOW.</p>
                            </div>
                          } side="left" />
                        </div>
                        <div className="text-lg font-bold text-netto-text">{formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)}</div>
                        <div className="text-[10px] text-netto-text/60 mt-1">wordt elke maand voor je opgebouwd</div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-netto-text/70 mt-3 leading-relaxed">
                      Je echte inkomen is dus: {formatCurrency(zzpNetAfterTaxIndicative)} per maand op je rekening!
                    </p>
                    <p className="text-xs text-netto-text/60 mt-2 leading-relaxed">
                      Plus {formatCurrency(zzpResult.employerPension + zzpResult.reservationBreakdown.employeePension)} aan pensioen per maand voor later!
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </section>

      <Disclaimer />
      </div>
      )}

    </div>
    </TooltipProvider>
  );
}
