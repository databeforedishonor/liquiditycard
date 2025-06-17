"use client"

import { ChevronDown, Plus } from "lucide-react"
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
}

export function TokenPairSelector({
  firstToken,
  secondToken,
  tokens,
  showTokenList,
  onTokenSelect,
  onShowTokenList,
}: TokenPairSelectorProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700">Select Token Pair</h4>
      </div>
      
      <div className="space-y-3">
        {/* First Token */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-white"
            onClick={() => onShowTokenList(1)}
          >
            <div className="flex items-center gap-3">
              {firstToken && (
                <img
                  src={firstToken.image || "/placeholder.svg"}
                  alt={firstToken.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {firstToken?.symbol || "Select First Token"}
                </span>
                {firstToken && (
                  <span className="text-xs text-gray-500">
                    {firstToken.name}
                  </span>
                )}
              </div>
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

        {/* Plus Icon */}
        <div className="flex justify-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
            <Plus className="h-4 w-4 text-gray-600" />
          </div>
        </div>

        {/* Second Token */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full justify-between h-12 bg-white"
            onClick={() => onShowTokenList(2)}
          >
            <div className="flex items-center gap-3">
              {secondToken && (
                <img
                  src={secondToken.image || "/placeholder.svg"}
                  alt={secondToken.symbol}
                  className="h-6 w-6 rounded-full"
                />
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium text-sm">
                  {secondToken?.symbol || "Select Second Token"}
                </span>
                {secondToken && (
                  <span className="text-xs text-gray-500">
                    {secondToken.name}
                  </span>
                )}
              </div>
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