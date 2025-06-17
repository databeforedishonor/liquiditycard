"use client"

import { ChevronDown, ArrowLeftRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TokenSelector } from "./token-selector"
import type { token } from "@/types/token"

interface TokenPairSelectorProps {
  firstToken: token | null
  secondToken: token | null
  tokens: token[]
  showTokenList: number | null
  onTokenSelect: (token: token) => void
  onShowTokenList: (tokenIndex: number | null) => void
  onSwapTokens?: () => void
}

export function TokenPairSelector({
  firstToken,
  secondToken,
  tokens,
  showTokenList,
  onTokenSelect,
  onShowTokenList,
  onSwapTokens,
}: TokenPairSelectorProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">Select Token Pair</h4>
        {onSwapTokens && firstToken && secondToken && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwapTokens}
            className="h-8 w-8 p-0"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {/* First Token */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12"
            onClick={() => onShowTokenList(1)}
          >
            <div className="flex items-center gap-2">
              {firstToken && (
                <img
                  src={firstToken.image || "/placeholder.svg"}
                  alt={firstToken.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="font-medium">
                {firstToken?.symbol || "Select"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <TokenSelector
            tokens={tokens}
            isVisible={showTokenList === 1}
            onTokenSelect={onTokenSelect}
            onClose={() => onShowTokenList(null)}
          />
        </div>

        {/* Second Token */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12"
            onClick={() => onShowTokenList(2)}
          >
            <div className="flex items-center gap-2">
              {secondToken && (
                <img
                  src={secondToken.image || "/placeholder.svg"}
                  alt={secondToken.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <span className="font-medium">
                {secondToken?.symbol || "Select"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          <TokenSelector
            tokens={tokens}
            isVisible={showTokenList === 2}
            onTokenSelect={onTokenSelect}
            onClose={() => onShowTokenList(null)}
          />
        </div>
      </div>
      
      {firstToken && secondToken && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            {firstToken.symbol}-{secondToken.symbol} Liquidity Pool
          </span>
        </div>
      )}
    </div>
  )
} 