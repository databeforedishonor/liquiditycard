"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { token } from "@/types/token"
import type { LPTokenInfo } from "@/types/liquidity"

interface LPTokenInfoProps {
  firstToken: token | null
  secondToken: token | null
  lpToken: LPTokenInfo
}

export function LPTokenInfo({
  firstToken,
  secondToken,
  lpToken,
}: LPTokenInfoProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            {firstToken && (
              <img
                src={firstToken.image || "/placeholder.svg"}
                alt={firstToken.symbol}
                className="h-6 w-6 rounded-full"
              />
            )}
            {secondToken && (
              <img
                src={secondToken.image || "/placeholder.svg"}
                alt={secondToken.symbol}
                className="h-6 w-6 rounded-full absolute -bottom-1 -right-1 border border-white"
              />
            )}
          </div>
          <span className="font-medium">{lpToken.symbol}</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">LP Token Info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Liquidity Provider token representing your share of the {firstToken?.symbol}-{secondToken?.symbol} pool
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-500">Your Balance</div>
          <div className="font-medium">{lpToken.balance} LP</div>
        </div>
        <div>
          <div className="text-gray-500">Value</div>
          <div className="font-medium">{lpToken.value}</div>
        </div>
      </div>
    </div>
  )
} 