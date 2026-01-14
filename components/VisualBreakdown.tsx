"use client";

import { useState } from "react";
import { CalculatorInputs, ComparisonResult, calculateZzp, calculateEmployee, formatCurrency, formatCurrencyWithDecimals, getWorkableAnnualHours, getActivePresetConfig, calculateIncomeTax } from "@/lib/calculations";

interface VisualBreakdownProps {
  data: ComparisonResult;
  inputs: CalculatorInputs;
}

type BreakdownType = "zzp" | "detacheren";

interface BreakdownSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  percentage: number;
  isFutureBenefit?: boolean; // Pink - pension
  isDirectIncome?: boolean; // Purple - net income
  details?: Array<{ label: string; value: number; percentage?: number }>;
}

export default function VisualBreakdown({ data, inputs }: VisualBreakdownProps) {
  const [activeTab, setActiveTab] = useState<BreakdownType>("detacheren");
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const preset = getActivePresetConfig() as any;

  // Calculate all breakdown values
  const clientRateZzp = (inputs as any).clientRateZzp ?? inputs.rate;
  const clientRateEmp = (inputs as any).clientRateEmp ?? inputs.rate;
  const marginZzp = (inputs as any).marginZzp ?? 0;
  const marginEmp = (inputs as any).marginEmp ?? 0;
  const hoursPerWeek = (inputs as any).hoursPerWeek ?? 36;
  const theoreticalAnnualHours = getWorkableAnnualHours(hoursPerWeek);
  const unpaidVacationPercentage = 0.1087;
  const paidHoursRatio = 1 - unpaidVacationPercentage;
  const zzpPaidHours = theoreticalAnnualHours * paidHoursRatio;
  const empAnnualHours = theoreticalAnnualHours;

  // Calculate ZZP breakdown
  const zzpCalc = calculateZzp(inputs as any);
  const effectiveRateZzp = clientRateZzp * (1 - marginZzp / 100);
  const omzet = effectiveRateZzp * zzpPaidHours;
  const costsPct = inputs.costs ?? 10;
  const bedrijfskosten = omzet * (costsPct / 100);
  const pensionTotalPct = inputs.pensionTotal ?? 20;
  const pensionBasePct = inputs.pensionBase ?? 90;
  const heeftEchteAovVerzekering = false;
  const aov = heeftEchteAovVerzekering ? omzet * 0.065 : 0;
  const pensioenZonderPlafond = (omzet - bedrijfskosten - aov) * (pensionBasePct / 100) * (pensionTotalPct / 100);
  const jaarruimteMax = (omzet - bedrijfskosten - aov) * 0.30;
  const pensioen = Math.min(pensioenZonderPlafond, jaarruimteMax);
  const winstVoorBelasting = omzet - bedrijfskosten - (heeftEchteAovVerzekering ? aov : 0) - pensioen;
  const zelfstandigenaftrek = 3360;
  const winstNaZelfstandig = Math.max(0, winstVoorBelasting - zelfstandigenaftrek);
  const mkbVrijstelling = winstNaZelfstandig * 0.14;
  const belastbaarInkomen = Math.max(0, winstNaZelfstandig - mkbVrijstelling);
  
  let brutoBelasting = 0;
  if (belastbaarInkomen <= 73031) {
    brutoBelasting = belastbaarInkomen * 0.3693;
  } else {
    brutoBelasting = 73031 * 0.3693 + (belastbaarInkomen - 73031) * 0.495;
  }
  let algemeneHeffingskorting = 0;
  if (belastbaarInkomen <= 23000) {
    algemeneHeffingskorting = 3100;
  } else if (belastbaarInkomen <= 73031) {
    algemeneHeffingskorting = 3100 * (1 - (belastbaarInkomen - 23000) / 50000);
  }
  let arbeidskorting = 0;
  if (belastbaarInkomen <= 40000) {
    arbeidskorting = 4000;
  } else if (belastbaarInkomen < 130000) {
    arbeidskorting = 4000 * (1 - (belastbaarInkomen - 40000) / 90000);
  }
  const inkomstenbelasting = Math.max(0, brutoBelasting - algemeneHeffingskorting - arbeidskorting);
  const wwBuffer = omzet * 0.03;
  const clientRateZzpAnnual = clientRateZzp * zzpPaidHours;

  // Calculate Detacheren breakdown
  const empCalc = calculateEmployee(inputs as any);
  const effectiveRateEmp = clientRateEmp * (1 - marginEmp / 100);
  const factuurwaarde = clientRateEmp * empAnnualHours;
  const marginPct = marginEmp ?? 15;
  const fee = factuurwaarde * (marginPct / 100);
  const totaalBeschikbaar = factuurwaarde - fee;
  
  const cfgEmp = preset?.emp ?? {};
  const cfgEmployer = cfgEmp?.employer ?? {};
  const hasDetailedComponents = cfgEmployer?.azvPct != null || cfgEmployer?.zvwPct != null;
  
  let derivedWgPct = 0;
  if (hasDetailedComponents) {
    derivedWgPct = [
      cfgEmployer?.azvPct ?? 0,
      cfgEmployer?.zvwPct ?? 0,
      cfgEmployer?.whkWgaPct ?? 0,
      cfgEmployer?.whkZwFlexPct ?? 0,
      cfgEmployer?.wwPct ?? 0,
      cfgEmployer?.aofPct ?? 0,
      cfgEmployer?.wkoPct ?? 0,
      cfgEmployer?.vacationPct ?? 0,
      cfgEmployer?.pensionEmployerPct ?? 0,
      cfgEmployer?.insuranceOtherPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    
    const cfgEmployerOther = cfgEmp?.employerOther ?? {};
    const employerOtherPct = [
      cfgEmployerOther?.sociaalFondsPct ?? 0,
      cfgEmployerOther?.kvFdReserveringPct ?? 0
    ].reduce((a: number, b: number) => a + (typeof b === "number" ? b : 0), 0);
    derivedWgPct += employerOtherPct;
  } else {
    derivedWgPct = [
      cfgEmployer?.socialPct,
      cfgEmployer?.zvwPct,
      cfgEmployer?.vacationPct,
      cfgEmployer?.pensionEmployerPct,
      cfgEmployer?.insuranceOtherPct
    ]
      .filter((v) => typeof v === "number")
      .reduce((a: number, b: number) => a + b, 0);
  }
  
  const baselineWgPct = (cfgEmployer?.employerTotalPct as number | undefined) ?? (derivedWgPct > 0 ? derivedWgPct : 41.6);
  const wgPct = (inputs as any).employerTotalPct != null ? (inputs as any).employerTotalPct : baselineWgPct;
  const werkgeverskosten = totaalBeschikbaar * (wgPct / 100);
  const brutoSalaris = totaalBeschikbaar - werkgeverskosten;
  const vakantiegeldPct = cfgEmployer?.vacationPct ?? 8.33;
  const vakantiegeldEmp = brutoSalaris * (vakantiegeldPct / 100);
  const brutoLoon = empCalc.brutoJaarloon;
  const pensionEmployee = (inputs as any).pensionEmployee ?? 7.5;
  const pensionBaseActual = inputs.pensionBase ?? 90;
  const pensioenWerknemer = brutoSalaris * (pensionBaseActual / 100) * (pensionEmployee / 100);
  const belastbaarBedragEmp = brutoLoon - pensioenWerknemer;
  const brutoBelastingEmp = calculateIncomeTax(belastbaarBedragEmp);
  
  let algemeneHeffingskortingEmp = 0;
  if (belastbaarBedragEmp <= 23000) {
    algemeneHeffingskortingEmp = 3100;
  } else if (belastbaarBedragEmp <= 73031) {
    algemeneHeffingskortingEmp = 3100 * (1 - (belastbaarBedragEmp - 23000) / 50000);
  }
  let arbeidskortingEmp = 0;
  if (belastbaarBedragEmp <= 40000) {
    arbeidskortingEmp = 4000;
  } else if (belastbaarBedragEmp < 130000) {
    arbeidskortingEmp = 4000 * (1 - (belastbaarBedragEmp - 40000) / 90000);
  }
  const loonbelasting = Math.max(0, brutoBelastingEmp - algemeneHeffingskortingEmp - arbeidskortingEmp);
  // Calculate annual client rate: rate per hour * annual hours
  // Should be: 100 * 1836 = 183,600 (for 36 hours/week in 2026)
  const clientRateEmpAnnual = clientRateEmp * empAnnualHours;
  
  // Debug: verify calculation
  if (process.env.NODE_ENV === 'development') {
    console.log('VisualBreakdown Debug:', {
      clientRateEmp,
      empAnnualHours,
      theoreticalAnnualHours,
      hoursPerWeek,
      clientRateEmpAnnual,
      expected: clientRateEmp * empAnnualHours
    });
  }

  // Calculate employer cost breakdown components
  const werkgeverPremies = brutoSalaris * (
    ((cfgEmployer?.azvPct ?? 0) +
     (cfgEmployer?.zvwPct ?? 0) +
     ((cfgEmployer?.whkWgaPct ?? 0) + (cfgEmployer?.whkZwFlexPct ?? 0)) +
     (cfgEmployer?.wwPct ?? 0) +
     (cfgEmployer?.aofPct ?? 0)) / 100
  );
  const werkgeverBelastingen = 0; // Usually 0 for employees
  const reserveringen = vakantiegeldEmp;
  const pensioenWerkgever = brutoSalaris * ((cfgEmployer?.pensionEmployerPct ?? 0) / 100);

  // Convert annual values to hourly for breakdown display (matching sketch)
  // Sketch shows: 100 (client) → 85 (after margin) → 42.50 (gross) → 27.20 (net)
  const clientRatePerHour = clientRateEmp; // Already per hour
  const feePerHour = fee / empAnnualHours;
  const tariefKandidaatPerHour = clientRatePerHour - feePerHour; // After margin deduction
  const werkgeverPremiesPerHour = werkgeverPremies / empAnnualHours;
  const werkgeverBelastingenPerHour = werkgeverBelastingen / empAnnualHours;
  const reserveringenPerHour = reserveringen / empAnnualHours;
  const pensioenWerkgeverPerHour = pensioenWerkgever / empAnnualHours;
  const brutoLoonPerHour = brutoSalaris / empAnnualHours;
  const pensioenWerknemerPerHour = pensioenWerknemer / empAnnualHours;
  const loonheffingPerHour = loonbelasting / empAnnualHours;
  const nettoPerHour = data.emp.nettoJaar / empAnnualHours;

  // Build segments for Detacheren - matching sketch structure (HOURLY values)
  const empSegments: BreakdownSegment[] = [
    {
      id: "client-rate",
      label: "Klanttarief",
      value: clientRatePerHour, // Per hour (e.g., 100)
      color: "#10b981", // green
      percentage: 100,
    },
    {
      id: "margin",
      label: "Marge & Admin (CN)",
      value: feePerHour,
      color: "#10b981", // green
      percentage: (feePerHour / clientRatePerHour) * 100,
      details: [
        { label: `Marge (${marginPct}%)`, value: feePerHour, percentage: marginPct },
      ],
    },
    {
      id: "werkgever-premies",
      label: "Werkgever premies",
      value: werkgeverPremiesPerHour,
      color: "#06b6d4", // teal
      percentage: (werkgeverPremiesPerHour / clientRatePerHour) * 100,
      details: hasDetailedComponents ? [
        { label: `AZV (Ziektewet)`, value: (brutoSalaris * ((cfgEmployer?.azvPct ?? 0) / 100)) / empAnnualHours, percentage: cfgEmployer?.azvPct ?? 0 },
        { label: `ZVW (Zorg)`, value: (brutoSalaris * ((cfgEmployer?.zvwPct ?? 0) / 100)) / empAnnualHours, percentage: cfgEmployer?.zvwPct ?? 0 },
        { label: `WhK WGA/ZW`, value: (brutoSalaris * (((cfgEmployer?.whkWgaPct ?? 0) + (cfgEmployer?.whkZwFlexPct ?? 0)) / 100)) / empAnnualHours, percentage: (cfgEmployer?.whkWgaPct ?? 0) + (cfgEmployer?.whkZwFlexPct ?? 0) },
        { label: `WW (Werkloosheid)`, value: (brutoSalaris * ((cfgEmployer?.wwPct ?? 0) / 100)) / empAnnualHours, percentage: cfgEmployer?.wwPct ?? 0 },
        { label: `Aof (Basis)`, value: (brutoSalaris * ((cfgEmployer?.aofPct ?? 0) / 100)) / empAnnualHours, percentage: cfgEmployer?.aofPct ?? 0 },
      ] : [
        { label: `Werkgever premies`, value: werkgeverPremiesPerHour },
      ],
    },
    {
      id: "werkgever-belastingen",
      label: "Werkgever Belastingen",
      value: werkgeverBelastingenPerHour,
      color: "#06b6d4", // teal
      percentage: (werkgeverBelastingenPerHour / clientRatePerHour) * 100,
    },
    {
      id: "reserveringen",
      label: "Reserveringen (o.a. vak geld 10% dagen 8%)",
      value: reserveringenPerHour,
      color: "#ec4899", // pink - future benefit
      percentage: (reserveringenPerHour / clientRatePerHour) * 100,
      isFutureBenefit: true,
      details: [
        { label: `Vakantiegeld`, value: reserveringenPerHour, percentage: vakantiegeldPct },
      ],
    },
    {
      id: "pensioen-werkgever",
      label: "Pensioen (werkgever)",
      value: pensioenWerkgeverPerHour,
      color: "#ec4899", // pink - future benefit
      percentage: (pensioenWerkgeverPerHour / clientRatePerHour) * 100,
      isFutureBenefit: true,
      details: [
        { label: `Pensioen werkgever`, value: pensioenWerkgeverPerHour, percentage: cfgEmployer?.pensionEmployerPct ?? 0 },
      ],
    },
    {
      id: "bruto-loon",
      label: "Bruto Loon (Salaris)",
      value: brutoLoonPerHour,
      color: "#3b82f6", // blue - gross salary
      percentage: (brutoLoonPerHour / clientRatePerHour) * 100,
    },
    {
      id: "pensioen-werknemer",
      label: "Pensioen (Werknemer)",
      value: pensioenWerknemerPerHour,
      color: "#ec4899", // pink - future benefit
      percentage: (pensioenWerknemerPerHour / clientRatePerHour) * 100,
      isFutureBenefit: true,
      details: [
        { label: `Pensioen werknemer (${pensionEmployee}% op ${pensionBaseActual}%)`, value: pensioenWerknemerPerHour },
      ],
    },
    {
      id: "werknemers-premies",
      label: "Werknemers premies",
      value: 0, // Usually included in loonheffing
      color: "#64748b", // gray
      percentage: 0,
    },
    {
      id: "loonheffing",
      label: "Loonheffing",
      value: loonheffingPerHour,
      color: "#64748b", // gray
      percentage: (loonheffingPerHour / clientRatePerHour) * 100,
      details: [
        { label: "Belastbaar bedrag", value: belastbaarBedragEmp / empAnnualHours },
        { label: "Bruto belasting", value: brutoBelastingEmp / empAnnualHours },
        { label: "Algemene heffingskorting", value: -algemeneHeffingskortingEmp / empAnnualHours },
        { label: "Arbeidskorting", value: -arbeidskortingEmp / empAnnualHours },
        { label: "Loonheffing", value: loonheffingPerHour },
      ],
    },
    {
      id: "net-income",
      label: "Netto Inkomen",
      value: nettoPerHour,
      color: "#9333ea", // purple - direct income
      percentage: (nettoPerHour / clientRatePerHour) * 100,
      isDirectIncome: true,
    },
  ];

  // Convert annual values to hourly for ZZP breakdown display (matching sketch)
  const clientRateZzpPerHour = clientRateZzp; // Already per hour
  const marginZzpPerHour = clientRateZzpPerHour * (marginZzp / 100);
  const bedrijfskostenPerHour = bedrijfskosten / zzpPaidHours;
  const pensioenPerHour = pensioen / zzpPaidHours;
  const reserveringenZzpPerHour = (wwBuffer + zzpCalc.vakantiegeld) / zzpPaidHours;
  const inkomstenbelastingPerHour = inkomstenbelasting / zzpPaidHours;
  const zvwPremiePerHour = zzpCalc.zvwPremie / zzpPaidHours;
  const nettoZzpPerHour = data.zzp.nettoJaar / zzpPaidHours;

  // Build segments for ZZP - matching sketch structure (HOURLY values)
  const zzpSegments: BreakdownSegment[] = [
    {
      id: "client-rate",
      label: "Klanttarief",
      value: clientRateZzpPerHour, // Per hour (e.g., 100)
      color: "#10b981", // green
      percentage: 100,
    },
    {
      id: "margin",
      label: "Marge & Admin",
      value: marginZzpPerHour,
      color: "#10b981", // green
      percentage: (marginZzp / 100) * 100,
      details: [
        { label: "Marge", value: marginZzpPerHour, percentage: marginZzp },
      ],
    },
    {
      id: "bedrijfskosten",
      label: "Bedrijfskosten",
      value: bedrijfskostenPerHour,
      color: "#06b6d4", // teal
      percentage: (bedrijfskostenPerHour / clientRateZzpPerHour) * 100,
      details: [
        { label: `Bedrijfskosten (${costsPct}%)`, value: bedrijfskostenPerHour, percentage: costsPct },
      ],
    },
    {
      id: "pensioen",
      label: "Pensioen Premie",
      value: pensioenPerHour,
      color: "#ec4899", // pink - future benefit
      percentage: (pensioenPerHour / clientRateZzpPerHour) * 100,
      isFutureBenefit: true,
      details: [
        { label: `Pensioen (${pensionTotalPct}% op ${pensionBasePct}%)`, value: pensioenPerHour },
      ],
    },
    {
      id: "reserveringen",
      label: "Reserveringen (WW buffer, vakantiegeld)",
      value: reserveringenZzpPerHour,
      color: "#ec4899", // pink - future benefit
      percentage: (reserveringenZzpPerHour / clientRateZzpPerHour) * 100,
      isFutureBenefit: true,
      details: [
        { label: "WW buffer (3%)", value: wwBuffer / zzpPaidHours },
        { label: "Vakantiegeld", value: zzpCalc.vakantiegeld / zzpPaidHours },
      ],
    },
    {
      id: "belastingen",
      label: "Belastingen",
      value: inkomstenbelastingPerHour,
      color: "#64748b", // gray
      percentage: (inkomstenbelastingPerHour / clientRateZzpPerHour) * 100,
      details: [
        { label: "Zelfstandigenaftrek", value: -zelfstandigenaftrek / zzpPaidHours },
        { label: "MKB-vrijstelling", value: -mkbVrijstelling / zzpPaidHours },
        { label: "Belastbaar inkomen", value: belastbaarInkomen / zzpPaidHours },
        { label: "Bruto belasting", value: brutoBelasting / zzpPaidHours },
        { label: "Algemene heffingskorting", value: -algemeneHeffingskorting / zzpPaidHours },
        { label: "Arbeidskorting", value: -arbeidskorting / zzpPaidHours },
        { label: "Inkomstenbelasting", value: inkomstenbelastingPerHour },
      ],
    },
    {
      id: "zvw-premie",
      label: "ZVW premie",
      value: zvwPremiePerHour,
      color: "#64748b", // gray
      percentage: (zvwPremiePerHour / clientRateZzpPerHour) * 100,
      details: [
        { label: "ZVW premie", value: zvwPremiePerHour },
      ],
    },
    {
      id: "net-income",
      label: "Netto Inkomen",
      value: nettoZzpPerHour,
      color: "#9333ea", // purple - direct income
      percentage: (nettoZzpPerHour / clientRateZzpPerHour) * 100,
      isDirectIncome: true,
    },
  ];

  const segments = activeTab === "zzp" ? zzpSegments : empSegments;
  const totalValue = segments[0]?.value || 1;

  if (!segments || segments.length === 0 || totalValue <= 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-gray-500">Unable to calculate breakdown. Please check your inputs.</p>
      </div>
    );
  }

  const toggleSegment = (segmentId: string) => {
    setExpandedSegment(expandedSegment === segmentId ? null : segmentId);
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Tab Selector */}
      <div className="mb-6 flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setActiveTab("detacheren");
            setExpandedSegment(null);
          }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "detacheren"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Detacheren Opbouw
        </button>
        <button
          onClick={() => {
            setActiveTab("zzp");
            setExpandedSegment(null);
          }}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all rounded-md ${
            activeTab === "zzp"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          ZZP Opbouw
        </button>
      </div>

      {/* Title */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {activeTab === "zzp" ? "ZZP Opbouw" : "Detacheren Opbouw"}
        </h3>
      </div>

      {/* Original Version */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Stacked Bar Chart (Left) - Flow from top to bottom with inline expansion */}
          <div className="flex-1">
            <div className="space-y-2">
              {segments.slice(1).map((segment, index) => {
                const heightPercentage = (segment.value / totalValue) * 100;
                const minHeight = Math.max(heightPercentage * 3, 32); // Scale for visibility, minimum 32px
                const isExpanded = expandedSegment === segment.id;
                
                return (
                  <div key={segment.id} className="space-y-2">
                    <button
                      onClick={() => segment.details && toggleSegment(segment.id)}
                      className={`w-full rounded-lg transition-all relative ${
                        segment.details ? "cursor-pointer hover:opacity-90 active:opacity-80" : "cursor-default"
                      } ${
                        isExpanded ? "ring-2 ring-gray-400 ring-offset-1" : ""
                      }`}
                      style={{
                        height: `${minHeight}px`,
                        backgroundColor: segment.color,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-white text-xs font-medium">
                        <span className="font-semibold truncate">{segment.label}</span>
                        <span className="ml-2 whitespace-nowrap">{formatCurrency(segment.value)}</span>
                      </div>
                    </button>
                    
                    {/* Expanded Details - Accordion style, expands inline below the clicked segment */}
                    {isExpanded && segment.details && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">{segment.label}</h4>
                        <div className="space-y-2">
                          {segment.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-sm text-gray-700">{detail.label}</span>
                                {detail.percentage !== undefined && (
                                  <span className="text-xs text-gray-500">({detail.percentage.toFixed(2)}%)</span>
                                )}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(Math.abs(detail.value))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Breakdown (Right) */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-2">Klanttarief</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </div>
            </div>

            <div className="space-y-3">
              {segments.slice(1, -1).map((segment) => (
                <div key={segment.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-sm text-gray-700">{segment.label}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(segment.value)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segments[segments.length - 1].color }}
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {segments[segments.length - 1].label}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(segments[segments.length - 1].value)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Cards - Integrated */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Wat krijg je netto per maand?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ZZP Result */}
          <div className={`rounded-xl p-6 border-2 ${
            data.zzp.nettoMaand > data.emp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als ZZP'er:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(data.zzp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(data.zzp.nettoJaar)} per jaar
            </div>
            <div className="text-xs text-gray-500 mb-4">
              Inclusief zelf toegekend vakantiegeld van {formatCurrency(data.zzp.vakantiegeld)} per jaar.
            </div>
            {/* Bar */}
            {(() => {
              const maxValue = Math.max(data.zzp.nettoMaand, data.emp.nettoMaand);
              const zzpBarPercentage = maxValue > 0 ? (data.zzp.nettoMaand / maxValue) * 100 : 50;
              const zzpIsLower = data.zzp.nettoMaand < data.emp.nettoMaand;
              const zzpBarColor = zzpIsLower ? '#fdba74' : '#10b981';
              return (
                <div className="w-full h-4 rounded-full overflow-hidden mt-2" style={{ backgroundColor: zzpIsLower ? '#e5e7eb' : 'transparent' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${zzpBarPercentage}%`, 
                      minWidth: '4px',
                      backgroundColor: zzpBarColor,
                      height: '100%'
                    }}
                  />
                </div>
              );
            })()}
          </div>

          {/* Detacheren Result */}
          <div className={`rounded-xl p-6 border-2 ${
            data.emp.nettoMaand > data.zzp.nettoMaand 
              ? 'bg-green-50 border-green-400' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="text-sm text-gray-600 mb-1 font-medium">Als gedetacheerde:</div>
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {formatCurrencyWithDecimals(data.emp.nettoMaand)}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              per maand • {formatCurrency(data.emp.nettoJaar)} per jaar
            </div>
            {/* Bar */}
            {(() => {
              const maxValue = Math.max(data.zzp.nettoMaand, data.emp.nettoMaand);
              const empBarPercentage = maxValue > 0 ? (data.emp.nettoMaand / maxValue) * 100 : 50;
              const zzpIsLower = data.zzp.nettoMaand < data.emp.nettoMaand;
              const empBarColor = zzpIsLower ? '#10b981' : '#fdba74';
              return (
                <div className="w-full h-4 rounded-full overflow-hidden mt-2" style={{ backgroundColor: !zzpIsLower ? '#e5e7eb' : 'transparent' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${empBarPercentage}%`, 
                      minWidth: '4px',
                      backgroundColor: empBarColor,
                      height: '100%'
                    }}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
