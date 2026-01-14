function PrimitiveButton() {
  return (
    <div className="[grid-area:1_/_1] bg-white h-[29px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[9px] py-[5px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center text-nowrap tracking-[-0.1504px]">Detacheren Opbouw</p>
        </div>
      </div>
    </div>
  );
}

function PrimitiveButton1() {
  return (
    <div className="[grid-area:1_/_2] h-[29px] justify-self-stretch relative rounded-[14px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[9px] py-[5px] relative size-full">
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#0a0a0a] text-[14px] text-center text-nowrap tracking-[-0.1504px]">ZZP Opbouw</p>
        </div>
      </div>
    </div>
  );
}

function TabList() {
  return (
    <div className="bg-[#ececf0] h-[36px] relative rounded-[14px] shrink-0 w-[361px]" data-name="Tab List">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] px-[3px] py-[3.5px] relative size-full">
        <PrimitiveButton />
        <PrimitiveButton1 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[28px] relative shrink-0 w-[172.977px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[28px] left-0 not-italic text-[#0f172b] text-[18px] text-nowrap top-0 tracking-[-0.4395px]">Detacheren Opbouw</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white h-[32px] relative rounded-[8px] shrink-0 w-[113.867px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[13px] py-px relative size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] text-center text-nowrap">Verberg details</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex h-[32px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Button />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20px] relative shrink-0 w-[73.57px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Klanttarief</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[61.227px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">€ 100,00</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Container2() {
  return <div className="bg-[#9ae600] rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Container" />;
}

function Text2() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">{`Marge & Admin (CN)`}</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[153.219px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container2 />
        <Text2 />
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[20px] relative shrink-0 w-[58.508px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">- € 14,43</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Text3 />
    </div>
  );
}

function Container5() {
  return <div className="bg-[#00d492] rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Container" />;
}

function Text4() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">{`Werkgeverslasten & Risico`}</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[190.938px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container5 />
        <Text4 />
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[20px] relative shrink-0 w-[58.055px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[59px]">- € 10,06</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Text5 />
    </div>
  );
}

function Container8() {
  return <div className="bg-[#bedbff] rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Container" />;
}

function Text6() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Pensioen Premie</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[20px] relative shrink-0 w-[127.422px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container8 />
        <Text6 />
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[20px] relative shrink-0 w-[49.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#45556c] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[50px]">- € 7,00</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Text7 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] h-[76px] items-start relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <Container7 />
      <Container10 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#314158] text-[12px] text-nowrap top-px">Specificatie Werkgeverskosten</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="h-[16px] relative shrink-0 w-[92.328px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">AZV (Ziektewet)</p>
      </div>
    </div>
  );
}

function Text9() {
  return (
    <div className="h-[16px] relative shrink-0 w-[34.672px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">1.90%</p>
      </div>
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text8 />
      <Text9 />
    </div>
  );
}

function Text10() {
  return (
    <div className="h-[16px] relative shrink-0 w-[66.742px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">ZVW (Zorg)</p>
      </div>
    </div>
  );
}

function Text11() {
  return (
    <div className="h-[16px] relative shrink-0 w-[34.672px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">6.10%</p>
      </div>
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text10 />
      <Text11 />
    </div>
  );
}

function Text12() {
  return (
    <div className="h-[16px] relative shrink-0 w-[81.297px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">WhK WGA/ZW</p>
      </div>
    </div>
  );
}

function Text13() {
  return (
    <div className="h-[16px] relative shrink-0 w-[36.188px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">5.05%</p>
      </div>
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text12 />
      <Text13 />
    </div>
  );
}

function Text14() {
  return (
    <div className="h-[16px] relative shrink-0 w-[112.484px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">WW (Werkloosheid)</p>
      </div>
    </div>
  );
}

function Text15() {
  return (
    <div className="h-[16px] relative shrink-0 w-[33.656px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">7.74%</p>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text14 />
      <Text15 />
    </div>
  );
}

function Text16() {
  return (
    <div className="h-[16px] relative shrink-0 w-[61.742px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">Aof (Basis)</p>
      </div>
    </div>
  );
}

function Text17() {
  return (
    <div className="h-[16px] relative shrink-0 w-[36.547px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">6.26%</p>
      </div>
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text16 />
      <Text17 />
    </div>
  );
}

function Text18() {
  return (
    <div className="h-[16px] relative shrink-0 w-[51.5px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">Pensioen</p>
      </div>
    </div>
  );
}

function Text19() {
  return (
    <div className="h-[16px] relative shrink-0 w-[40.289px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">14.31%</p>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text18 />
      <Text19 />
    </div>
  );
}

function Text20() {
  return (
    <div className="h-[16px] relative shrink-0 w-[72.844px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">Vakantiegeld</p>
      </div>
    </div>
  );
}

function Text21() {
  return (
    <div className="h-[16px] relative shrink-0 w-[36.57px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#45556c] text-[12px] text-nowrap top-px">8.00%</p>
      </div>
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex h-[16px] items-start justify-between relative shrink-0 w-full" data-name="Row">
      <Text20 />
      <Text21 />
    </div>
  );
}

function Text22() {
  return (
    <div className="h-[16px] relative shrink-0 w-[78.625px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#0f172b] text-[12px] text-nowrap top-px">Totaal opslag</p>
      </div>
    </div>
  );
}

function Text23() {
  return (
    <div className="h-[16px] relative shrink-0 w-[56.813px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#0f172b] text-[12px] text-nowrap top-px">~ 50.76%</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex h-[25px] items-start justify-between pb-0 pt-[9px] px-0 relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
      <Text22 />
      <Text23 />
    </div>
  );
}

function IntegratedDetacherenBreakdown() {
  return (
    <div className="h-[249px] relative shrink-0 w-full" data-name="IntegratedDetacherenBreakdown">
      <div className="content-stretch flex flex-col gap-[8px] items-start pb-0 pt-[16px] px-[16px] relative size-full">
        <Paragraph />
        <Row />
        <Row1 />
        <Row2 />
        <Row3 />
        <Row4 />
        <Row5 />
        <Row6 />
        <Container12 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#f8fafc] h-[251px] relative rounded-[10px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-px relative size-full">
          <IntegratedDetacherenBreakdown />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[10px]" />
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[379px] relative shrink-0 w-[251px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Container1 />
        <Container11 />
        <Container13 />
      </div>
    </div>
  );
}

function Container15() {
  return <div className="bg-[#155dfc] rounded-[1.67772e+07px] shrink-0 size-[12px]" data-name="Container" />;
}

function Text24() {
  return (
    <div className="basis-0 grow h-[20px] min-h-px min-w-px relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">Bruto Loon (Salaris)</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[20px] relative shrink-0 w-[157.352px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container15 />
        <Text24 />
      </div>
    </div>
  );
}

function Text25() {
  return (
    <div className="h-[20px] relative shrink-0 w-[52.453px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#0f172b] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px]">€ 55,97</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex h-[20px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Text25 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-px relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e2e8f0] border-[1px_0px_0px] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Text26() {
  return (
    <div className="h-[24px] relative shrink-0 w-[79.5px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">€ 5.317,76</p>
      </div>
    </div>
  );
}

function Text27() {
  return (
    <div className="h-[24px] relative shrink-0 w-[129.789px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-0 not-italic text-[#0f172b] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px]">Netto per maand</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex h-[24px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Text26 />
      <Text27 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[69px] relative shrink-0 w-[251px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Container17 />
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col h-[480px] items-start justify-between left-[76px] pb-0 pt-[4px] px-0 top-0 w-[251px]" data-name="Container">
      <Container14 />
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#9ae600] h-[79.195px] relative shrink-0 w-[60px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#00d492] h-[55.195px] relative shrink-0 w-[60px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-[#bedbff] h-[38.398px] relative shrink-0 w-[60px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_1px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container25() {
  return <div className="bg-[#155dfc] h-[307.195px] shrink-0 w-[60px]" data-name="Container" />;
}

function Container26() {
  return (
    <div className="absolute bg-[#f8fafc] content-stretch flex flex-col h-[480px] items-start justify-end left-0 overflow-clip pb-0 pt-[0.016px] px-0 rounded-[10px] top-0 w-[60px]" data-name="Container">
      <Container22 />
      <Container23 />
      <Container24 />
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[480px] relative shrink-0 w-full" data-name="Container">
      <Container21 />
      <Container26 />
    </div>
  );
}

function IntegratedDetacherenBreakdown1() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[10px] shrink-0 w-[361px]" data-name="IntegratedDetacherenBreakdown">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[24px] items-start pb-px pt-[17px] px-[17px] relative size-full">
        <Container />
        <Container27 />
      </div>
    </div>
  );
}

export default function PrimitiveDiv() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start relative size-full" data-name="Primitive.div">
      <TabList />
      <IntegratedDetacherenBreakdown1 />
    </div>
  );
}