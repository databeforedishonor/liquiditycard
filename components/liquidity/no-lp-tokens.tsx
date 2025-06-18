"use client"

import { Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { token } from "@/types/token"

interface NoLPTokensProps {
  firstToken: token | null
  secondToken: token | null
  onSwitchToAdd: () => void
}

export function NoLPTokens({
  firstToken,
  secondToken,
  onSwitchToAdd,
}: NoLPTokensProps) {
  // Common token pairs that might have liquidity
  const commonPairs = [
    "VTHO-BVET",
    "VET-VTHO", 
    "VTHO-USDGLO",
    "BVET-B3TR"
  ]

  return (
    <div className="text-center py-8 space-y-4">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Info className="h-8 w-8 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">No LP Tokens Found</h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          {firstToken && secondToken 
            ? `You don't have any ${firstToken.symbol}-${secondToken.symbol} LP tokens to withdraw.`
            : "You don't have any LP tokens to withdraw."
          }
        </p>
        {firstToken && secondToken && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-left">
            <p className="text-xs text-blue-800 mb-2">
              💡 <strong>Tip:</strong> Make sure you&apos;ve selected the correct token pair.
            </p>
            <p className="text-xs text-blue-700 mb-1">
              <strong>Try these common pairs:</strong>
            </p>
            <div className="flex flex-wrap gap-1">
              {commonPairs.map((pair) => (
                <span 
                  key={pair}
                  className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {pair}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={onSwitchToAdd}
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Liquidity
      </Button>
    </div>
  )
} 