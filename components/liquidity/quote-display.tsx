"use client"

import type { token } from "@/types/token"

interface QuoteDisplayProps {
  firstTokenAmount: string
  secondTokenAmount: string
  firstToken: token | null
  secondToken: token | null
  pairAddress: string | null
  quote: string | null
  isQuoteLoading: boolean
  quoteError: Error | null
}

export function QuoteDisplay({
  firstTokenAmount,
  secondTokenAmount,
  firstToken,
  secondToken,
  pairAddress,
  quote,
  isQuoteLoading,
  quoteError,
}: QuoteDisplayProps) {
  if (!(firstTokenAmount || secondTokenAmount) || !pairAddress) {
    return null
  }

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="flex justify-between text-sm">
        <span className="text-blue-600 font-medium">Estimated Output</span>
        {isQuoteLoading && (
          <span className="text-blue-500">Calculating...</span>
        )}
        {quoteError && (
          <span className="text-red-500">Error getting quote</span>
        )}
        {quote && quote !== "0" && !isQuoteLoading && (
          <span className="text-blue-700 font-medium">
            {firstTokenAmount ? 
              `${parseFloat(quote).toFixed(6)} ${secondToken?.symbol}` : 
              `${parseFloat(quote).toFixed(6)} ${firstToken?.symbol}`
            }
          </span>
        )}
      </div>
    </div>
  )
} 