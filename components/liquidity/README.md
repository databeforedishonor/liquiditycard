# Liquidity Components

This directory contains all components related to the liquidity functionality, broken down into smaller, reusable components.

## Structure

### Main Components
- `add-liquidity-tab.tsx` - Complete add liquidity form
- `withdraw-liquidity-tab.tsx` - Complete withdraw liquidity form  
- `loading-state.tsx` - Loading state component
- `pair-info.tsx` - Detailed pair information display

### UI Components
- `token-input.tsx` - Token input field with balance display
- `token-selector.tsx` - Dropdown token selection component
- `quote-display.tsx` - Quote information display
- `exchange-rate-display.tsx` - Exchange rate and pool share display
- `lp-token-info.tsx` - LP token information card
- `withdrawal-slider.tsx` - Percentage slider for withdrawals
- `withdrawal-estimate.tsx` - Estimated tokens to receive display

## Usage

Import components from the barrel export:

```tsx
import { 
  AddLiquidityTab,
  WithdrawLiquidityTab,
  LoadingState,
  PairInfo
} from "@/components/liquidity"
```

## Component Hierarchy

```
LiquidityCard
├── LoadingState (conditional)
├── AddLiquidityTab
│   ├── TokenInput (x2)
│   ├── TokenSelector (x2)
│   ├── QuoteDisplay
│   └── ExchangeRateDisplay
├── WithdrawLiquidityTab
│   ├── LPTokenInfo
│   ├── WithdrawalSlider
│   ├── WithdrawalEstimate
│   └── ExchangeRateDisplay
└── PairInfo
```

## Props Pattern

All components follow a consistent props pattern:
- Data props (tokens, amounts, etc.)
- UI state props (loading, errors, etc.)
- Event handler props (onChange, onClick, etc.)

## Type Safety

All components are fully typed with TypeScript interfaces defined in `/types/liquidity.ts`. 