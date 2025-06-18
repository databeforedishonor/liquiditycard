'use client'

import { useForm, useStore } from '@tanstack/react-form'
import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useTokenSelection } from '@/components/hooks/use-token-selection'
import { useAddLiquidity } from '@/components/hooks/chain/use-add-liquidity'
import { TokenSelector } from '@/components/liquidity/token-selector'
import { Balance } from '@/types/balance'
import { Pair } from '@/types/pair'
import { createBalanceFromFormatted } from '@/utils/balance/balanceFunctions'
import { useWallet } from '@vechain/dapp-kit-react'
import { useAddLiquidityTransaction } from '@/components/hooks/use-add-liquidity-transaction'

// Types for better type safety
interface AddLiquidityFormValues {
  firstTokenAmount: string
  secondTokenAmount: string
}

type LastChangedField = 'token0' | 'token1' | null

export function AddLiquidityForm() {
  // Track which field was last changed for the add liquidity calculation
  const [lastChangedField, setLastChangedField] = useState<LastChangedField>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get wallet connection
  const { account, connect } = useWallet()
  
  // Debug wallet state
  useEffect(() => {
    console.log('Wallet account state changed:', account);
  }, [account])

  // Get transaction utilities
  const {
    addLiquidity,
    TransactionModal,
    isLoading: isTransactionLoading,
    transactionState,
  } = useAddLiquidityTransaction()

  // Get token selection data
  const {
    firstToken,
    secondToken,
    tokens,
    reserves,
    totalSupply,
    pairAddress,
    pairTokens,
    isTokensLoading,
    showTokenList,
    setShowTokenList,
    handleTokenSelect,
  } = useTokenSelection()

  const form = useForm({
    defaultValues: {
      firstTokenAmount: '',
      secondTokenAmount: '',
    } as AddLiquidityFormValues,
    onSubmit: async ({ value }) => {
      // Check wallet connection
      if (!account) {
        try {
          console.log('Attempting to connect wallet...');
          const connectionResult = await connect();
          console.log('Wallet connection result:', connectionResult);
          
          // Give more time for state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check again after connection attempt
          if (!account) {
            console.log('Wallet connected but account state not updated yet. Please try submitting again.');
            return;
          }
        } catch (error) {
          console.error('Failed to connect wallet:', error);
          return;
        }
      }

      if (!firstToken || !secondToken || !value.firstTokenAmount || !value.secondTokenAmount) {
        console.error('Missing required data for transaction')
        return
      }

      // Validate amounts are valid numbers
      const firstAmount = parseFloat(value.firstTokenAmount)
      const secondAmount = parseFloat(value.secondTokenAmount)
      
      if (isNaN(firstAmount) || isNaN(secondAmount) || firstAmount <= 0 || secondAmount <= 0) {
        console.error('Invalid token amounts')
        return
      }

      setIsSubmitting(true)
      try {
        // Create Balance objects from form values
        console.log('Creating balances:', {
          firstTokenAmount: value.firstTokenAmount,
          firstTokenDecimals: firstToken.decimals,
          secondTokenAmount: value.secondTokenAmount,
          secondTokenDecimals: secondToken.decimals
        })
        
        const amountA = createBalanceFromFormatted(value.firstTokenAmount, firstToken.decimals)
        const amountB = createBalanceFromFormatted(value.secondTokenAmount, secondToken.decimals)
        
        console.log('Created balances:', { amountA, amountB })

        // Build transaction parameters using the correct interface
        const txParams = {
          tokenA: firstToken,
          tokenB: secondToken,
          amountA,
          amountB,
          slippage: 0.5, // 0.5% slippage tolerance - you might want to make this configurable
          account: account || '', // Ensure account is not null
        }

        await addLiquidity(txParams)
        
        // Reset form on success (transaction modal will handle success state)
        form.reset()
        setLastChangedField(null)
        
      } catch (error) {
        console.error('Transaction failed:', error)
      } finally {
        setIsSubmitting(false)
      }
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

  // Create Pair object from current data with correct token ordering
  const pair: Pair | null = useMemo(() => {
    if (!pairAddress || !firstToken || !secondToken || !reserves || !totalSupply || !pairTokens) {
      return null
    }

    // Determine which selected token corresponds to token0 and token1 from the pair contract
    const isFirstTokenToken0 = firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase()
    const token0 = isFirstTokenToken0 ? firstToken : secondToken
    const token1 = isFirstTokenToken0 ? secondToken : firstToken

    return {
      pairAddress,
      token0,
      token1,
      reserve0: {
        raw: reserves.reserve0,
        formatted: (Number(reserves.reserve0) / Math.pow(10, token0.decimals)).toFixed(6),
        decimals: token0.decimals
      },
      reserve1: {
        raw: reserves.reserve1,
        formatted: (Number(reserves.reserve1) / Math.pow(10, token1.decimals)).toFixed(6),
        decimals: token1.decimals
      },
      totalSupply: {
        raw: totalSupply,
        formatted: (Number(totalSupply) / Math.pow(10, 18)).toFixed(6), // LP tokens have 18 decimals
        decimals: 18
      }
    }
  }, [pairAddress, firstToken, secondToken, reserves, totalSupply, pairTokens])

  // Convert form amounts to Balance objects with correct token ordering
  const token0Amount: Balance | null = useMemo(() => {
    if (!pairTokens || !firstToken || !secondToken) return null
    
    const isFirstTokenToken0 = firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase()
    const amount = isFirstTokenToken0 ? firstTokenAmount : secondTokenAmount
    const token = isFirstTokenToken0 ? firstToken : secondToken
    
    if (!amount || !token) return null
    return createBalanceFromFormatted(amount, token.decimals)
  }, [firstTokenAmount, secondTokenAmount, firstToken, secondToken, pairTokens])

  const token1Amount: Balance | null = useMemo(() => {
    if (!pairTokens || !firstToken || !secondToken) return null
    
    const isFirstTokenToken0 = firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase()
    const amount = isFirstTokenToken0 ? secondTokenAmount : firstTokenAmount
    const token = isFirstTokenToken0 ? secondToken : firstToken
    
    if (!amount || !token) return null
    return createBalanceFromFormatted(amount, token.decimals)
  }, [firstTokenAmount, secondTokenAmount, firstToken, secondToken, pairTokens])

  // Map lastChangedField to correct token ordering
  const mappedLastChangedField = useMemo(() => {
    if (!lastChangedField || !pairTokens || !firstToken || !secondToken) return null
    
    const isFirstTokenToken0 = firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase()
    
    if (lastChangedField === 'token0') {
      return isFirstTokenToken0 ? 'token0' : 'token1'
    } else {
      return isFirstTokenToken0 ? 'token1' : 'token0'
    }
  }, [lastChangedField, pairTokens, firstToken, secondToken])

  // Use the refactored add liquidity hook
  const addLiquidityResult = useAddLiquidity({
    pair,
    token0: pair?.token0 || null,
    token0Amount,
    token1: pair?.token1 || null,
    token1Amount,
    lastChangedField: mappedLastChangedField,
    onSuccess: (result) => {
      if (result && pairTokens && firstToken && secondToken) {
        const isFirstTokenToken0 = firstToken.tokenAddress.toString().toLowerCase() === pairTokens.token0.toLowerCase()
        
        // Update form with calculated amounts based on correct token mapping
        if (mappedLastChangedField === 'token0' && result.token1) {
          const targetField = isFirstTokenToken0 ? 'secondTokenAmount' : 'firstTokenAmount'
          form.setFieldValue(targetField, result.token1.formatted)
        } else if (mappedLastChangedField === 'token1' && result.token0) {
          const targetField = isFirstTokenToken0 ? 'firstTokenAmount' : 'secondTokenAmount'
          form.setFieldValue(targetField, result.token0.formatted)
        }
      }
    }
  })

  const isCalculating = addLiquidityResult.isLoading

  // ✅ useStore for validation logic
  const isValidRelationship = useStore(form.store, (state) => {
    const hasFirstAmount = state.values.firstTokenAmount && parseFloat(state.values.firstTokenAmount) > 0
    const hasSecondAmount = state.values.secondTokenAmount && parseFloat(state.values.secondTokenAmount) > 0
    return Boolean(firstToken && secondToken && (hasFirstAmount || hasSecondAmount) && !isCalculating)
  })

  // Clear amounts when tokens change
  useEffect(() => {
    form.setFieldValue('firstTokenAmount', '')
    form.setFieldValue('secondTokenAmount', '')
    setLastChangedField(null)
  }, [firstToken?.tokenAddress, secondToken?.tokenAddress, form])

  // Clear form amounts when tokens change
  useEffect(() => {
    form.setFieldValue('firstTokenAmount', '')
    form.setFieldValue('secondTokenAmount', '')
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
              if (!value) return undefined
              const numValue = parseFloat(value)
              if (isNaN(numValue)) {
                return 'Must be a valid number'
              }
              if (numValue < 0) {
                return 'Must be positive'
              }
              return undefined
            },
          }}
          listeners={{
            onChange: ({ value }) => {
              if (value && parseFloat(value) > 0) {
                setLastChangedField('token0')
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
                type="text"
                inputMode="decimal"
                value={field.state.value}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow numbers and decimal point
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    field.handleChange(value)
                  }
                }}
                onBlur={field.handleBlur}
                placeholder={`Enter ${firstToken?.symbol || 'token'} amount`}
                disabled={isCalculating && lastChangedField === 'token1'}
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
              if (!value) return undefined
              const numValue = parseFloat(value)
              if (isNaN(numValue)) {
                return 'Must be a valid number'
              }
              if (numValue < 0) {
                return 'Must be positive'
              }
              return undefined
            },
          }}
          listeners={{
            onChange: ({ value }) => {
              if (value && parseFloat(value) > 0) {
                setLastChangedField('token1')
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
                type="text"
                inputMode="decimal"
                value={field.state.value}
                onChange={(e) => {
                  const value = e.target.value
                  // Only allow numbers and decimal point
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    field.handleChange(value)
                  }
                }}
                onBlur={field.handleBlur}
                placeholder={`Enter ${secondToken?.symbol || 'token'} amount`}
                disabled={isCalculating && lastChangedField === 'token0'}
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
                  🔄 Calculating optimal amounts...
                </div>
              )}
              {!isValidRelationship && !isCalculating && (
                <div className="text-amber-600">
                  ⚠️ Enter token amounts to calculate liquidity
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
            
            {reserves ? (
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
          disabled={!account ? false : (!formState.canSubmit || isSubmitting || isTransactionLoading || !isValidRelationship || isCalculating)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => {
            console.log('Button clicked. Wallet state:', { 
              account, 
              hasAccount: !!account,
              canSubmit: formState.canSubmit,
              isSubmitting,
              isTransactionLoading,
              isValidRelationship,
              isCalculating 
            });
          }}
        >
          {!account ? 'Connect Wallet' :
           isSubmitting || isTransactionLoading ? 'Submitting Transaction...' :
           isCalculating ? 'Calculating...' :
           isTokensLoading ? 'Loading...' :
           !pairAddress ? 'No Pair Available' :
           !isValidRelationship ? 'Enter Amounts' :
           'Add Liquidity'}
        </Button>

        {/* Transaction Modal */}
        <TransactionModal />

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