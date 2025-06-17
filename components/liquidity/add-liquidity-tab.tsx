"use client"

import { useRef, useEffect } from "react"
import {  PlusIcon } from "lucide-react"
import { TokenInput } from "./token-input"
import { TokenSelector } from "./token-selector"
import { QuoteDisplay } from "./quote-display"
import { ExchangeRateDisplay } from "./exchange-rate-display"
import type { token } from "@/types/token"

interface AddLiquidityTabProps {
  // Token data
  firstToken: token | null
  secondToken: token | null
  tokens: token[]
  
  // Input values
  firstTokenAmount: string
  secondTokenAmount: string
  
  // UI state
  showTokenList: number | null
  
  // Quote data
  pairAddress: string | null
  quote: string | null
  isQuoteLoading: boolean
  quoteError: Error | null
  
  // Exchange rate data
  exchangeRate: number
  poolShare: string
  
  // Event handlers
  setFirstTokenAmount: (amount: string) => void
  setSecondTokenAmount: (amount: string) => void
  setShowTokenList: (tokenIndex: number | null) => void
  handleTokenSelect: (token: token) => void
  
  // Callback to notify parent which field was last modified for quote handling
  onFieldModified?: (field: 'first' | 'second') => void
}

export function AddLiquidityTab({
  firstToken,
  secondToken,
  tokens,
  firstTokenAmount,
  secondTokenAmount,
  showTokenList,
  pairAddress,
  quote,
  isQuoteLoading,
  quoteError,
  exchangeRate,
  poolShare,
  setFirstTokenAmount,
  setSecondTokenAmount,
  setShowTokenList,
  handleTokenSelect,
  onFieldModified,
}: AddLiquidityTabProps) {
  // Track which field was last modified
  const lastModifiedField = useRef<'first' | 'second' | null>(null)

  // Notify parent when field changes for proper quote handling
  useEffect(() => {
    if (lastModifiedField.current) {
      onFieldModified?.(lastModifiedField.current)
    }
  }, [onFieldModified, lastModifiedField.current])

  // Handler for first token amount
  const handleFirstTokenAmountChange = (value: string) => {
    lastModifiedField.current = 'first'
    setFirstTokenAmount(value)
    
    // Clear the opposite field when user starts typing in this field
    if (value && secondTokenAmount) {
      setSecondTokenAmount('')
    }
  }

  // Handler for second token amount  
  const handleSecondTokenAmountChange = (value: string) => {
    lastModifiedField.current = 'second'
    setSecondTokenAmount(value)
    
    // Clear the opposite field when user starts typing in this field
    if (value && firstTokenAmount) {
      setFirstTokenAmount('')
    }
  }

  return (
    <div className="space-y-4">
      {/* First Token Input */}
      <div className="relative">
        <TokenInput
          label="Input"
          value={firstTokenAmount}
          token={firstToken}
          balance={firstToken?.format(6)}
          onChange={handleFirstTokenAmountChange}
          onTokenSelect={() => setShowTokenList(1)}
        />
        
        <TokenSelector
          tokens={tokens}
          isVisible={showTokenList === 1}
          onTokenSelect={handleTokenSelect}
          onClose={() => setShowTokenList(null)}
        />
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-full">
          <PlusIcon className="h-5 w-5 text-gray-500" />
        </div>
      </div>

      {/* Second Token Input */}
      <div className="relative">
        <TokenInput
          label="Input"
          value={secondTokenAmount}
          token={secondToken}
          balance={secondToken?.format(6)}
          onChange={handleSecondTokenAmountChange}
          onTokenSelect={() => setShowTokenList(2)}
        />
        
        <TokenSelector
          tokens={tokens}
          isVisible={showTokenList === 2}
          onTokenSelect={handleTokenSelect}
          onClose={() => setShowTokenList(null)}
        />
      </div>

      {/* Quote Information */}
      <QuoteDisplay
        firstTokenAmount={firstTokenAmount}
        secondTokenAmount={secondTokenAmount}
        firstToken={firstToken}
        secondToken={secondToken}
        pairAddress={pairAddress}
        quote={quote}
        isQuoteLoading={isQuoteLoading}
        quoteError={quoteError}
      />

      {/* Exchange Rate Display */}
      <ExchangeRateDisplay
        firstToken={firstToken}
        secondToken={secondToken}
        exchangeRate={exchangeRate}
        poolShare={poolShare}
      />
    </div>
  )
} 