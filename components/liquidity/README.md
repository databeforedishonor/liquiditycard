# Liquidity Components

This directory contains all components related to the liquidity functionality, broken down into smaller, reusable components.

## Structure

### Main Components
- `add-liquidity-tab.tsx` - Complete add liquidity form (TanStack Forms integration in progress)
- `withdraw-liquidity-tab.tsx` - Complete withdraw liquidity form (TanStack Forms integration in progress)  
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

## TanStack Forms Integration

### Current Status
The liquidity components are being migrated to use TanStack Forms for better form state management and validation. 

### Form Hooks Created
- `components/hooks/use-add-liquidity-form.ts` - Form hook for add liquidity functionality
- `components/hooks/use-withdraw-liquidity-form.ts` - Form hook for withdraw liquidity functionality

### Key Features Implemented
1. **Form State Management**: Using TanStack Form's `useForm` hook for centralized state
2. **Reactive Updates**: Form listeners for side effects (token amount changes, percentage changes)
3. **Token Selection**: Integrated token selection with form state
4. **Validation**: Built-in validation for required fields and business rules
5. **Type Safety**: Full TypeScript integration with proper form value types

### Integration Patterns

#### Add Liquidity Form
```typescript
const { form, handleTokenSelect, validateTokensAreDifferent } = useAddLiquidityForm({
  tokens,
  onSubmit: (values) => {
    // Handle form submission with validated values
  },
  onTokenAmountChange: (firstAmount, secondAmount) => {
    // Handle reactive updates for quote calculations
  },
})
```

#### Withdraw Liquidity Form
```typescript
const { form, handleTokenSelect, setPercentagePreset } = useWithdrawLiquidityForm({
  tokens,
  onSubmit: (values) => {
    // Handle withdrawal submission
  },
  onTokenChange: (firstToken, secondToken) => {
    // Handle token pair changes for LP token loading
  },
  onPercentageChange: (percentage) => {
    // Handle percentage changes for estimation updates
  },
})
```

### Form Values Types
```typescript
// Add Liquidity Form
type AddLiquidityFormValues = {
  firstToken: token | null
  secondToken: token | null
  firstTokenAmount: string
  secondTokenAmount: string
  showTokenList: number | null
}

// Withdraw Liquidity Form
type WithdrawLiquidityFormValues = {
  firstToken: token | null
  secondToken: token | null
  withdrawPercentage: number
  showTokenList: number | null
}
```

### Next Steps for Completion

#### 1. Component Integration
Update the main `LiquidityCard` component to use the new form hooks:

```typescript
// In liquidity-card.tsx
const handleAddLiquiditySubmit = (values: AddLiquidityFormValues) => {
  // Build transaction clauses
  const clauses = buildAddLiquidityClauses(values)
  // Execute transaction
  sendTransaction(clauses)
}

const handleWithdrawLiquiditySubmit = (values: WithdrawLiquidityFormValues) => {
  // Build transaction clauses  
  const clauses = buildWithdrawLiquidityClauses(values)
  // Execute transaction
  sendTransaction(clauses)
}
```

#### 2. Remove Legacy State Management
- Remove individual state hooks (`use-token-selection.ts`, etc.)
- Consolidate query management with form state
- Update prop interfaces to use form submission patterns

#### 3. Enhanced Validation
Add comprehensive validation rules:
- Token balance validation
- Minimum amount validation  
- LP token availability validation
- Slippage validation

#### 4. Error Handling
Implement proper error boundaries and validation feedback:
- Field-level error display
- Form-level validation summary
- Transaction error handling

#### 5. Performance Optimization
- Implement proper debouncing for API calls
- Optimize re-renders with selective subscriptions
- Add loading states for async validations

### Benefits of TanStack Forms Integration

1. **Centralized State**: All form state managed in one place
2. **Reactive Updates**: Automatic side effects and dependent field updates
3. **Type Safety**: Full TypeScript integration with validation
4. **Performance**: Optimized re-renders and selective subscriptions
5. **Validation**: Built-in and custom validation patterns
6. **Maintainability**: Clear separation of concerns and reusable patterns

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
├── AddLiquidityTab (with TanStack Forms)
│   ├── TokenInput (x2)
│   ├── TokenSelector (x2)
│   ├── QuoteDisplay
│   └── ExchangeRateDisplay
├── WithdrawLiquidityTab (with TanStack Forms)
│   ├── TokenPairSelector
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
- Event handler props (onSubmit, onChange, etc.)

## Type Safety

All components are fully typed with TypeScript interfaces defined in `/types/liquidity.ts` and form-specific types in the respective form hooks. 

## Current Status

**✅ Improved Input Handling (Completed)**
- Added smart input handlers that prevent weird renders
- Tracks which field was last modified to avoid updating the active input
- Provides callback to parent for proper quote handling based on last modified field

**🔄 TanStack Forms Integration (In Progress)**
- Working form hooks created: `use-add-liquidity-form.ts` and `use-withdraw-liquidity-form.ts`
- TypeScript compatibility issues prevent full integration with React 19
- Components currently use improved prop-based approach with smart handlers

## Components

### Core Components
- `add-liquidity-tab.tsx` - Add liquidity interface with improved input handling
- `withdraw-liquidity-tab.tsx` - Remove liquidity interface
- `token-input.tsx` - Token amount input with selector
- `token-selector.tsx` - Token selection dropdown
- `quote-display.tsx` - Shows quote information
- `exchange-rate-display.tsx` - Shows exchange rates and pool share

### Supporting Components
- `loading-state.tsx` - Loading spinner for async operations
- `lp-token-info.tsx` - LP token balance and info display
- `no-lp-tokens.tsx` - Empty state when no LP tokens exist
- `pair-info.tsx` - Token pair information display
- `withdrawal-estimate.tsx` - Estimated tokens from withdrawal
- `withdrawal-slider.tsx` - Percentage slider for withdrawals

## Input Handling Pattern

### Problem Solved
Previously, when users typed in an input field, quote updates would cause the input they were typing in to change or reset, creating a poor UX with weird renders.

### Solution
The components now use a smart input handling pattern:

```typescript
// Track which field was last modified
const lastModifiedField = useRef<'first' | 'second' | null>(null)

// Handler prevents updating the field user is actively typing in
const handleFirstTokenAmountChange = (value: string) => {
  lastModifiedField.current = 'first'
  setFirstTokenAmount(value)
  
  // Clear opposite field when switching inputs
  if (value && secondTokenAmount) {
    setSecondTokenAmount('')
  }
}

// Notify parent for quote handling
useEffect(() => {
  if (lastModifiedField.current) {
    onFieldModified?.(lastModifiedField.current)
  }
}, [onFieldModified, lastModifiedField.current])
```

### Usage in Parent Components
Parents can use the `onFieldModified` callback to handle quotes properly:

```typescript
const [lastModifiedField, setLastModifiedField] = useState<'first' | 'second' | null>(null)

// Only update the opposite field from the one user is typing in
useEffect(() => {
  if (quote && !isQuoteLoading && lastModifiedField) {
    if (lastModifiedField === 'first' && firstTokenAmount && !secondTokenAmount) {
      setSecondTokenAmount(quote)
    } else if (lastModifiedField === 'second' && secondTokenAmount && !firstTokenAmount) {
      setFirstTokenAmount(quote)
    }
  }
}, [quote, isQuoteLoading, lastModifiedField, firstTokenAmount, secondTokenAmount])

<AddLiquidityTab
  // ... other props
  onFieldModified={setLastModifiedField}
/>
```

## TanStack Forms Integration (Future)

### Working Form Hooks

#### `use-add-liquidity-form.ts`
```typescript
const { 
  form, 
  handleTokenSelect, 
  handleFirstTokenAmountChange,
  handleSecondTokenAmountChange,
  validateTokensAreDifferent 
} = useAddLiquidityForm({
  tokens,
  onSubmit,
  quote,
  isQuoteLoading,
  onTokenAmountChange,
})
```

**Features:**
- Centralized form state management
- Smart quote integration with last-modified-field tracking
- Token selection handling
- Validation helpers
- Debounced token amount changes

#### `use-withdraw-liquidity-form.ts`
```typescript
const { 
  form, 
  handleTokenSelect, 
  setPercentagePreset, 
  validateTokensAreDifferent 
} = useWithdrawLiquidityForm({
  tokens,
  onSubmit,
  onTokenChange,
  onPercentageChange,
})
```

**Features:**
- Withdrawal percentage management
- Token pair selection
- Percentage presets (25%, 50%, 75%, 100%)
- Validation helpers
- Reactive UI updates with `useStore` and `form.Subscribe`

### Form Value Types
```typescript
interface AddLiquidityFormValues {
  firstToken: token | null
  secondToken: token | null
  firstTokenAmount: string
  secondTokenAmount: string
  showTokenList: number | null
}

interface WithdrawLiquidityFormValues {
  firstToken: token | null
  secondToken: token | null
  withdrawPercentage: number
  showTokenList: number | null
}
```

### Next Steps for TanStack Forms
1. **Resolve TypeScript Issues**: Investigate React 19 + TanStack Form compatibility
2. **Alternative Validation**: Consider lighter validation approach than Zod adapter
3. **Gradual Migration**: Start with simpler forms before complex reactive patterns
4. **Custom Form Context**: Create project-specific form context to handle TypeScript issues

### Benefits of Complete Integration
- **Centralized State**: All form logic in dedicated hooks
- **Reactive Updates**: Automatic UI updates with `form.Subscribe`
- **Type Safety**: Full TypeScript integration with form values
- **Validation**: Built-in form validation with user feedback
- **Performance**: Optimized re-renders with selective subscriptions
- **Consistency**: Standardized form patterns across the application

### Architecture
```
┌─ Parent Component ─────────────────────┐
│  ├─ Token balances & blockchain data   │
│  ├─ Quote/estimation logic             │
│  └─ Transaction submission             │
└────────────────────────────────────────┘
                    │
┌─ Form Hook ────────────────────────────┐
│  ├─ Form state management              │
│  ├─ Input handlers with smart logic    │
│  ├─ Token selection logic              │
│  ├─ Validation rules                   │
│  └─ Quote integration                  │
└────────────────────────────────────────┘
                    │
┌─ UI Components ────────────────────────┐
│  ├─ TokenInput (controlled)            │
│  ├─ TokenSelector (modal)              │
│  ├─ QuoteDisplay (reactive)            │
│  └─ Validation feedback               │
└────────────────────────────────────────┘
```

## Current Implementation Benefits

Even with the current prop-based approach, the components provide:

1. **No Weird Renders**: Input fields don't change while user is typing
2. **Smart Field Clearing**: Only clears opposite field when switching inputs
3. **Parent Control**: Full control over quote handling and state management
4. **Type Safety**: Full TypeScript support
5. **Performance**: Optimized re-renders with ref-based tracking
6. **Clean Architecture**: Clear separation of concerns between UI and logic