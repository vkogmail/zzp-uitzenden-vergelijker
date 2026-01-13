# Design Proposal: Visual Breakdown Feature

## Overview
Add a visual breakdown component that shows the flow from client rate → net income, with color-coded categories to distinguish between direct income (purple) and future benefits (pink).

## Current State Analysis

### Available Data
We already have all the calculation data we need:
- **ZZP**: `omzet`, `bedrijfskosten`, `pensioen`, `winstVoorBelasting`, `belastbaarInkomen`, `inkomstenbelasting`, `wwBuffer`, `zvwPremie`, `nettoJaar`
- **Detacheren**: `factuurwaarde`, `fee`, `werkgeverskosten`, `brutoSalaris`, `brutoLoon`, `pensioenWerknemer`, `loonbelasting`, `nettoJaar`

### Existing Components
- `ResultChart.tsx` - Uses Recharts for simple bar charts
- `DetailedResults.tsx` - Shows text-based breakdowns
- `Calculator.tsx` - Shows calculation details

## Design Approach Options

### Option 1: Stacked Bar Chart (Similar to Mobile Sketch)
**Pros:**
- Clear visual representation of proportions
- Easy to compare ZZP vs Detacheren side-by-side
- Works well on mobile
- Can use Recharts (already in project)

**Cons:**
- Less clear about the "flow" from top to bottom
- Harder to show intermediate steps

**Implementation:**
- Use Recharts `BarChart` with stacked bars
- Each segment represents a category (margin, employer costs, pension, taxes, net)
- Color coding: pink for pension, purple for net income

### Option 2: Flowchart/Waterfall Chart
**Pros:**
- Shows the sequential flow clearly
- Matches the first sketch (flowchart style)
- Easy to understand the progression
- Can show intermediate values clearly

**Cons:**
- More complex to implement
- May be harder to read on mobile
- Recharts doesn't have built-in waterfall charts

**Implementation:**
- Custom component using CSS/HTML or SVG
- Vertical flow: Client Rate → Margin → Candidate Rate → Costs → Gross → Deductions → Net
- Each step shows as a box with value and label

### Option 3: Hybrid Approach (Recommended)
**Pros:**
- Best of both worlds
- Stacked bar for quick overview
- Detailed breakdown below showing flow
- Can toggle between views

**Cons:**
- More development time
- More complex component

**Implementation:**
- Stacked bar chart at top (visual overview)
- Detailed breakdown cards below (text + small visual indicators)
- Toggle between "Overview" and "Detailed" views

## Recommended Approach: Option 3 (Hybrid)

### Component Structure

```
VisualBreakdown Component
├── Tab Selector (ZZP / Detacheren)
├── Stacked Bar Chart (Visual Overview)
│   ├── Client Rate (full bar)
│   ├── Margin (deducted)
│   ├── Employer Costs (deducted)
│   ├── Pension (pink - future benefit)
│   ├── Taxes (deducted)
│   └── Net Income (purple - direct)
├── Detailed Flow Cards (Expandable)
│   ├── Step 1: Client Rate
│   ├── Step 2: Margin Deduction
│   ├── Step 3: Employer Costs Breakdown
│   ├── Step 4: Gross Income
│   ├── Step 5: Employee Deductions
│   └── Step 6: Net Income
└── Legend
    ├── Purple: Direct Monthly Income
    └── Pink: Future Benefits (Pension)
```

## Color Scheme

Based on your requirements:
- **Purple** (`#9333EA` or `#A855F7`): Direct monthly income (net wage)
- **Pink** (`#EC4899` or `#F472B6`): Future benefits (pension contributions)
- **Gray/Blue**: Deductions (taxes, costs, margins)
- **Green**: Positive values (gross income)

## Data Structure

### For ZZP Breakdown:
```typescript
type ZzpBreakdown = {
  clientRate: number;           // €100
  margin: number;              // -€10 (10%)
  candidateRate: number;        // €90
  businessCosts: number;       // -€9 (10%)
  pension: number;             // -€X (pink - future)
  winstVoorBelasting: number;  // €X
  zelfstandigenaftrek: number; // -€3,360
  mkbVrijstelling: number;     // -€X
  belastbaarInkomen: number;   // €X
  inkomstenbelasting: number;  // -€X
  wwBuffer: number;            // -€X
  zvwPremie: number;           // -€X
  nettoJaar: number;           // €X (purple - direct)
}
```

### For Detacheren Breakdown:
```typescript
type EmpBreakdown = {
  clientRate: number;          // €100
  margin: number;              // -€15 (15%)
  availableForCosts: number;   // €85
  employerCosts: number;       // -€X (detailed breakdown)
  brutoSalaris: number;        // €X
  vakantiegeld: number;        // +€X
  brutoLoon: number;           // €X
  pensionWerknemer: number;    // -€X (pink - future)
  loonbelasting: number;       // -€X
  nettoJaar: number;           // €X (purple - direct)
}
```

## Implementation Plan

### Phase 1: Core Component
1. Create `components/VisualBreakdown.tsx`
2. Implement tab selector (ZZP / Detacheren)
3. Add stacked bar chart using Recharts
4. Calculate all breakdown values from existing calculations

### Phase 2: Detailed Flow
1. Add expandable detailed breakdown cards
2. Show step-by-step flow with values
3. Add color coding (pink/purple)
4. Add hover states and tooltips

### Phase 3: Integration
1. Add to `DetailedResults.tsx` or as separate section
2. Make it toggleable (show/hide)
3. Ensure mobile responsiveness
4. Add animations/transitions

### Phase 4: Polish
1. Add legend
2. Improve accessibility
3. Add export functionality (if needed)
4. Test with different input values

## Technical Considerations

### Using Recharts for Stacked Bars
```typescript
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const data = [
  {
    name: 'ZZP',
    clientRate: 100,
    margin: -10,
    costs: -9,
    pension: -X,  // pink
    taxes: -X,
    netto: X,     // purple
  }
];
```

### Custom Flowchart Component
- Use CSS Grid or Flexbox for layout
- SVG for arrows/connectors
- Responsive design with mobile-first approach

## Questions to Resolve

1. **Where to place it?**
   - Replace existing breakdown in `DetailedResults.tsx`?
   - Add as new section?
   - Make it toggleable?

2. **Level of detail?**
   - Show all intermediate steps?
   - Group some costs together?
   - Show percentages or absolute values?

3. **Mobile experience?**
   - Horizontal scroll for flowchart?
   - Vertical stacked layout?
   - Simplified view on mobile?

4. **Interactivity?**
   - Hover to see details?
   - Click to expand sections?
   - Animate transitions?

## Next Steps

1. **Decide on approach** (I recommend Option 3 - Hybrid)
2. **Create mockup/wireframe** of the component
3. **Build MVP** with basic stacked bar chart
4. **Iterate** based on feedback
5. **Add detailed breakdown** cards
6. **Polish and integrate**

## Recommendations

- Start with **Option 3 (Hybrid)** - gives flexibility
- Use **Recharts** for the stacked bar (already in project)
- Create **custom flowchart** component for detailed view
- Make it **toggleable** so users can choose detail level
- Ensure **mobile-first** responsive design
- Use **semantic colors** (pink=pension, purple=net)
