"use client"

import type { token } from "@/types/token"

interface WithdrawalEstimateProps {
  firstToken: token | null
  secondToken: token | null
  estimatedFirstTokenAmount: string
  estimatedSecondTokenAmount: string
}

export function WithdrawalEstimate({
  firstToken,
  secondToken,
  estimatedFirstTokenAmount,
  estimatedSecondTokenAmount,
}: WithdrawalEstimateProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">You will receive:</div>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {firstToken && (
              <img
                src={firstToken.image || "/placeholder.svg"}
                alt={firstToken.symbol}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span>
              {estimatedFirstTokenAmount} {firstToken?.symbol || "Token"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {secondToken && (
              <img
                src={secondToken.image || "/placeholder.svg"}
                alt={secondToken.symbol}
                className="h-6 w-6 rounded-full"
              />
            )}
            <span>
              {estimatedSecondTokenAmount} {secondToken?.symbol || "Token"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 