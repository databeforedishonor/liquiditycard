# TanStack Form Composition Implementation

This directory contains the implementation of TanStack Form's composition pattern for the liquidity application, following the [TanStack Form Composition Guide](https://tanstack.com/form/latest/docs/framework/react/guides/form-composition).

## Architecture Overview

The composition pattern reduces verbosity and creates reusable, pre-bound form components that can be composed into larger forms.

### File Structure

```
components/forms/
├── README.md                    # This documentation
├── token-field.tsx             # Pre-bound token selection field
├── amount-field.tsx            # Pre-bound amount input field  
├── percentage-field.tsx        # Pre-bound percentage slider field
├── submit-button.tsx           # Pre-bound submit button with form state
├── add-liquidity-form.tsx      # Composed add liquidity form
└── withdraw-liquidity-form.tsx # Composed withdraw liquidity form

lib/
├── form-context.ts             # Form hook contexts and app form creation
└── form-options.ts             # Shared form configurations and validators

components/examples/
└── composed-liquidity-card.tsx # Usage examples
```

## Core Components

### 1. Form Context (`lib/form-context.ts`)

Establishes the custom form hook infrastructure:

```typescript
import { createFormHookContexts, createFormHook } from '@tanstack/react-form'

// Create contexts
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

// Create app-specific form hook with pre-bound components
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TokenField,
    AmountField,
    PercentageField,
  },
  formComponents: {
    SubmitButton,
  },
})
```

### 2. Pre-bound Field Components

#### TokenField (`components/forms/token-field.tsx`)
- Integrates with existing `TokenInput` and `TokenSelector` components
- Handles token selection and validation
- Shows balance information
- Manages token list dropdown state

#### AmountField (`components/forms/amount-field.tsx`)
- Numeric input with decimal validation
- MAX button integration
- Balance display
- Error state styling

#### PercentageField (`components/forms/percentage-field.tsx`)
- Slider-based percentage selection
- Preset buttons (25%, 50%, 75%, 100%)
- Real-time percentage display
- Validation for 0-100 range

#### SubmitButton (`components/forms/submit-button.tsx`)
- Automatically handles form submission state
- Shows loading state during submission
- Disables when form is invalid
- Uses `form.Subscribe` for optimal performance

### 3. Shared Form Options (`lib/form-options.ts`)

Provides reusable form configurations:

```typescript
// Shared configuration for add liquidity forms
export const addLiquidityFormOptions = formOptions({
  defaultValues: {
    firstToken: null,
    secondToken: null,
    firstTokenAmount: '',
    secondTokenAmount: '',
    showTokenList: null,
  },
  validators: {
    onSubmit: ({ value }) => {
      // Form-level validation
    },
  },
})
```

## Usage Patterns

### Method 1: Using `withForm` HOC (Recommended)

The `withForm` higher-order component creates self-contained form components:

```typescript
export const AddLiquidityForm = withForm({
  ...addLiquidityFormOptions,
  props: {
    tokens: [] as token[],
    quote: null as string | null,
    // ... other props
  },
  render: ({ form, tokens, quote, ... }) => {
    return (
      <form onSubmit={form.handleSubmit}>
        <form.AppField name="firstToken">
          {(field) => (
            <field.TokenField
              label="From Token"
              tokens={tokens}
              showBalance={true}
            />
          )}
        </form.AppField>
        
        <form.AppForm>
          <form.SubmitButton>Add Liquidity</form.SubmitButton>
        </form.AppForm>
      </form>
    )
  },
})

// Usage in parent component
<AddLiquidityForm
  tokens={tokens}
  quote={quote}
  onSubmit={handleSubmit}
  onTokenAmountChange={handleTokenAmountChange}
/>
```

### Method 2: Using `useAppForm` Hook

For more control over the form lifecycle:

```typescript
export function useAddLiquidityForm(props: AddLiquidityFormProps) {
  return useAppForm({
    ...addLiquidityFormOptions,
    onSubmit: async ({ value }) => {
      props.onSubmit(value)
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        // Handle field changes
      },
    },
  })
}

// Usage in component
const form = useAddLiquidityForm({ ... })

return (
  <form onSubmit={form.handleSubmit}>
    <form.AppField name="firstToken">
      {(field) => <field.TokenField ... />}
    </form.AppField>
  </form>
)
```

## Key Features

### 1. Reactive Updates with `form.Subscribe`

Optimized UI reactivity without component re-renders:

```typescript
<form.Subscribe
  selector={(state) => ({
    firstToken: state.values.firstToken,
    secondToken: state.values.secondToken,
  })}
>
  {({ firstToken, secondToken }) => (
    // Only re-renders when selected values change
    <QuoteDisplay firstToken={firstToken} secondToken={secondToken} />
  )}
</form.Subscribe>
```

### 2. Field Listeners for Side Effects

Handle dependent field updates and external API calls:

```typescript
<form.AppField
  name="firstTokenAmount"
  listeners={{
    onChange: ({ value }) => {
      // Clear opposite field when user types
      if (value && form.state.values.secondTokenAmount) {
        form.setFieldValue('secondTokenAmount', '')
      }
      // Trigger quote calculation
      onTokenAmountChange?.(value, form.state.values.secondTokenAmount)
    },
    onChangeDebounceMs: 300,
  }}
>
```

### 3. Form-Level Validation

Centralized validation with proper error handling:

```typescript
validators: {
  onSubmit: ({ value }) => {
    const errors: Record<string, string> = {}
    
    if (!value.firstToken) {
      errors.firstToken = 'First token is required'
    }
    
    if (value.firstToken?.symbol === value.secondToken?.symbol) {
      errors.secondToken = 'Tokens must be different'
    }
    
    return Object.keys(errors).length > 0 ? errors : undefined
  },
}
```

### 4. TypeScript Integration

Full type safety throughout the form composition:

```typescript
interface AddLiquidityFormValues {
  firstToken: token | null
  secondToken: token | null
  firstTokenAmount: string
  secondTokenAmount: string
  showTokenList: number | null
}

// Form components automatically infer types from context
const field = useFieldContext<token | null>()
```

## Benefits

### 1. **Reduced Verbosity**
- Pre-bound components eliminate repetitive field setup
- Shared form options reduce duplication
- Consistent patterns across all forms

### 2. **Enhanced Maintainability**
- Centralized form logic in dedicated hooks
- Reusable field components
- Clear separation of concerns

### 3. **Improved Performance**
- Selective subscriptions with `form.Subscribe`
- Optimized re-renders
- Debounced field updates

### 4. **Type Safety**
- Full TypeScript integration
- Compile-time validation
- IntelliSense support

### 5. **Developer Experience**
- Consistent API across forms
- Easy to test and debug
- Clear composition patterns

## Migration Guide

To migrate existing forms to the composition pattern:

1. **Create shared form options** in `lib/form-options.ts`
2. **Extract field logic** into pre-bound components
3. **Use `withForm` or `useAppForm`** instead of `useForm`
4. **Replace manual state management** with `form.Subscribe`
5. **Move side effects** to field listeners

## Examples

See `components/examples/composed-liquidity-card.tsx` for complete usage examples demonstrating both the `withForm` HOC and `useAppForm` hook patterns. 