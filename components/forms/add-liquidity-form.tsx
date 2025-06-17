'use client'

import { useForm, useStore } from '@tanstack/react-form'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTokenSelection } from '@/components/hooks/use-token-selection'
import { useQuote } from '@/components/hooks/chain/use-quote'
import { TokenSelector } from '@/components/liquidity/token-selector'

// Types for better type safety
interface AddLiquidityFormValues {
  firstTokenAmount: number
  secondTokenAmount: number
}


type CalculationType = 'firstToSecond' | 'secondToFirst'

// Helper function to format quote result back to human readable
const formatQuoteResult = (quote: string, decimals: number): number => {
  if (!quote || quote === "0") return 0
  return Number(quote) / Math.pow(10, decimals)
}

export function AddLiquidityForm() {
  // Track which calculation should be active
  const [activeCalculation, setActiveCalculation] = useState<CalculationType | null>(null)
  const [focusedField, setFocusedField] = useState<'firstTokenAmount' | 'secondTokenAmount' | null>(null)

  // Get token selection data
  const {
    firstToken,
    secondToken,
    tokens,
    reserves,
    isReservesLoading,
    reservesError,
    pairAddress,
    isTokensLoading,
    pairTokens,
    showTokenList,
    setShowTokenList,
    handleTokenSelect,
  } = useTokenSelection()

  const form = useForm({
    defaultValues: {
      firstTokenAmount: 0,
      secondTokenAmount: 1,
    } as AddLiquidityFormValues,
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value)
      
    },
  })

  // ✅ Using useStore for LOGIC-based reactivity with proper selectors
  const firstTokenAmount = useStore(form.store, (state) => state.values.firstTokenAmount)
  const secondTokenAmount = useStore(form.store, (state) => state.values.secondTokenAmount)

  // ✅ useStore for form state
  const formState = useStore(form.store, (state) => ({
    canSubmit: state.canSubmit,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    errors: state.errorMap,
  }))

  // Determine token ordering in the pair
  const isFirstTokenToken0 = firstToken && pairTokens ? 
    firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase() : false
  const isSecondTokenToken0 = secondToken && pairTokens ? 
    secondToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase() : false

  // Quote for first token -> second token
  const firstToSecondQuote = useQuote({
    inputAmountA: firstTokenAmount.toString(),
    reserveA: isFirstTokenToken0 ? (reserves?.reserve0 || "0") : (reserves?.reserve1 || "0"),
    reserveB: isSecondTokenToken0 ? (reserves?.reserve0 || "0") : (reserves?.reserve1 || "0"),
    enabled: activeCalculation === 'firstToSecond' && Boolean(reserves && firstToken && secondToken && typeof firstTokenAmount === 'number'),
  })

  // Quote for second token -> first token
  const secondToFirstQuote = useQuote({
    inputAmountA: secondTokenAmount.toString(),
    reserveA: isSecondTokenToken0 ? (reserves?.reserve0 || "0") : (reserves?.reserve1 || "0"),
    reserveB: isFirstTokenToken0 ? (reserves?.reserve0 || "0") : (reserves?.reserve1 || "0"),
    enabled: activeCalculation === 'secondToFirst' && Boolean(reserves && firstToken && secondToken && typeof secondTokenAmount === 'number'),
  })

  // ✅ useStore for conditional logic
  const isCalculating = activeCalculation === 'firstToSecond' ? firstToSecondQuote.isLoading : 
                       activeCalculation === 'secondToFirst' ? secondToFirstQuote.isLoading : 
                       false

  // ✅ useStore for validation logic - now checks if we have valid quote data
  const isValidRelationship = useStore(form.store, (state) => {
    // Valid if we have both tokens and either both fields have values or we're not actively calculating
    return Boolean(firstToken && secondToken && 
      (state.values.firstTokenAmount > 0 || state.values.secondTokenAmount > 0) &&
      !isCalculating)
  })

  // Helper function for handling calculations using quotes
  const handleCalculation = (
    type: CalculationType,
    targetField: keyof AddLiquidityFormValues
  ) => {
    setActiveCalculation(type)
    console.log(`Starting ${type} calculation for ${targetField}`)
  }

  // Handle quote results using useEffect to avoid setState during render
  useEffect(() => {
    if (activeCalculation === 'firstToSecond' && !firstToSecondQuote.isLoading && firstToSecondQuote.quote && secondToken) {
      const result = formatQuoteResult(firstToSecondQuote.quote, secondToken.decimals)
      form.setFieldValue('secondTokenAmount', result)
      console.log(`Updated secondTokenAmount to quote result: ${result}`)
      setActiveCalculation(null)
    }
  }, [activeCalculation, firstToSecondQuote.isLoading, firstToSecondQuote.quote, secondToken, form])

  useEffect(() => {
    if (activeCalculation === 'secondToFirst' && !secondToFirstQuote.isLoading && secondToFirstQuote.quote && firstToken) {
      const result = formatQuoteResult(secondToFirstQuote.quote, firstToken.decimals)
      form.setFieldValue('firstTokenAmount', result)
      console.log(`Updated firstTokenAmount to quote result: ${result}`)
      setActiveCalculation(null)
    }
  }, [activeCalculation, secondToFirstQuote.isLoading, secondToFirstQuote.quote, firstToken, form])

  // Clear form amounts when tokens change
  useEffect(() => {
    form.setFieldValue('firstTokenAmount', 0)
    form.setFieldValue('secondTokenAmount', 0)
    console.log('Cleared form amounts due to token change')
  }, [firstToken?.tokenAddress, secondToken?.tokenAddress, form])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
        {/* First Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Token
          </label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowTokenList(1)}
            >
              {firstToken ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={firstToken.image} 
                    alt={firstToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{firstToken.symbol}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    Balance: {firstToken.format(4)}
                  </span>
                </div>
              ) : (
                'Select token'
              )}
            </Button>
            
            {showTokenList === 1 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1">
                <TokenSelector
                  tokens={tokens}
                  isVisible={true}
                  onTokenSelect={handleTokenSelect}
                  onClose={() => setShowTokenList(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* First Token Amount Field */}
        <form.Field
          name="firstTokenAmount"
          validators={{
            onChange: ({ value }) => {
              if (typeof value !== 'number' || isNaN(value)) {
                return 'Must be a valid number'
              }
              if (value < 0) {
                return 'Must be positive'
              }
              return undefined
            },
          }}
          listeners={{
            onChange: async ({ value, fieldApi }) => {
              console.log(`First token amount changed to: ${value}`)
              
              // Only trigger calculation if this field is currently focused
              if (focusedField === 'firstTokenAmount') {
                console.log('First field is focused, updating second token amount')
                handleCalculation('firstToSecond', 'secondTokenAmount')
              }
            },
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({firstToken?.symbol || 'Token'})
              </label>
              <input
                type="number"
                value={field.state.value.toString()}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                onFocus={() => setFocusedField('firstTokenAmount')}
                onBlur={(e) => {
                  field.handleBlur()
                  setFocusedField(null)
                }}
                placeholder={`Enter ${firstToken?.symbol || 'token'} amount`}
                disabled={activeCalculation === 'secondToFirst'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {!field.state.meta.isValid && (
                <div className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors.join(', ')}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Plus Icon */}
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600">+</span>
          </div>
        </div>

        {/* Second Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Token
          </label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowTokenList(2)}
            >
              {secondToken ? (
                <div className="flex items-center gap-2">
                  <img 
                    src={secondToken.image} 
                    alt={secondToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>{secondToken.symbol}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    Balance: {secondToken.format(4)}
                  </span>
                </div>
              ) : (
                'Select token'
              )}
            </Button>
            
            {showTokenList === 2 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1">
                <TokenSelector
                  tokens={tokens}
                  isVisible={true}
                  onTokenSelect={handleTokenSelect}
                  onClose={() => setShowTokenList(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Second Token Amount Field */}
        <form.Field
          name="secondTokenAmount"
          validators={{
            onChange: ({ value }) => {
              if (typeof value !== 'number' || isNaN(value)) {
                return 'Must be a valid number'
              }
              if (value < 0) {
                return 'Must be positive'
              }
              return undefined
            },
          }}
          listeners={{
            onChange: async ({ value, fieldApi }) => {
              console.log(`Second token amount changed to: ${value}`)
              
              // Only trigger calculation if this field is currently focused
              if (focusedField === 'secondTokenAmount') {
                console.log('Second field is focused, updating first token amount')
                handleCalculation('secondToFirst', 'firstTokenAmount')
              }
            },
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ({secondToken?.symbol || 'Token'})
              </label>
              <input
                type="number"
                value={field.state.value.toString()}
                onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                onFocus={() => setFocusedField('secondTokenAmount')}
                onBlur={(e) => {
                  field.handleBlur()
                  setFocusedField(null)
                }}
                placeholder={`Enter ${secondToken?.symbol || 'token'} amount`}
                disabled={activeCalculation === 'firstToSecond'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {!field.state.meta.isValid && (
                <div className="text-sm text-red-600 mt-1">
                  {field.state.meta.errors.join(', ')}
                </div>
              )}
            </div>
          )}
        </form.Field>

        {/* Calculation Status Display */}
        {(isCalculating || !isValidRelationship) && (
          <div className="p-3 bg-blue-50 rounded text-sm">
            <strong>Status:</strong>
            <div className="mt-1 space-y-1">
              {isCalculating && (
                <div className="text-blue-600">
                  🔄 Calculating {activeCalculation === 'firstToSecond' ? 'second token' : 'first token'} amount...
                </div>
              )}
              {!isValidRelationship && !isCalculating && (
                <div className="text-amber-600">
                  ⚠️ Enter token amounts to see DEX quotes
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pair Information Display */}
        {pairAddress && (
          <div className="p-3 bg-green-50 rounded text-sm">
            <div className="text-green-600">✓ Pair found</div>
            <div className="text-xs text-gray-500 truncate mb-2">
              Pair: {pairAddress.slice(0, 10)}...
            </div>
            
            {isReservesLoading ? (
              <div className="text-green-600">🔄 Loading reserves...</div>
            ) : reservesError ? (
              <div className="text-red-600">❌ Error loading reserves: {reservesError.message}</div>
            ) : reserves ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Reserve 0:</span>
                  <div className="text-xs">{Number(reserves.reserve0).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-medium">Reserve 1:</span>
                  <div className="text-xs">{Number(reserves.reserve1).toLocaleString()}</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">No reserves data</div>
            )}
          </div>
        )}

        {/* ✅ form.Subscribe for UI-ONLY reactivity (optimized rendering) */}
        <form.Subscribe
          selector={(state) => ({
            firstTokenAmount: state.values.firstTokenAmount,
            secondTokenAmount: state.values.secondTokenAmount,
          })}
        >
          {({ firstTokenAmount, secondTokenAmount }) => (
            <div className="p-3 bg-gray-50 rounded text-sm">
              <strong>Liquidity Amounts:</strong>
              <div className="mt-1">
                <div>{firstToken?.symbol || 'First'}: {firstTokenAmount}</div>
                <div>{secondToken?.symbol || 'Second'}: {secondTokenAmount}</div>
                <div className={`font-medium ${isValidRelationship ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {isValidRelationship ? 'Ready to add liquidity ✅' : 'Enter amounts ❌'}
                </div>
              </div>
            </div>
          )}
        </form.Subscribe>

        {/* Submit Button with comprehensive state handling */}
        <Button
          type="submit"
          disabled={!formState.canSubmit || formState.isSubmitting || !isValidRelationship || isCalculating}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {formState.isSubmitting ? 'Submitting...' : 
           isCalculating ? 'Calculating...' :
           isTokensLoading ? 'Loading...' :
           !pairAddress ? 'No Pair Available' :
           !isValidRelationship ? 'Enter Amounts' :
           'Add Liquidity'}
        </Button>

        {/* Form Errors Display */}
        {Object.keys(formState.errors).length > 0 && (
          <div className="p-3 bg-red-50 rounded text-sm">
            <strong className="text-red-800">Form Errors:</strong>
            <div className="mt-1 space-y-1">
              {Object.entries(formState.errors).map(([field, error]) => (
                <div key={field} className="text-red-600">
                  {field}: {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
  )
} 