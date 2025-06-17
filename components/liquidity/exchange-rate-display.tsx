"use client"

import type { token } from "@/types/token"

interface ExchangeRateDisplayProps {
  firstToken: token | null
  secondToken: token | null
  exchangeRate: number
  poolShare: string
}

export function ExchangeRateDisplay({
  firstToken,
  secondToken,
  exchangeRate,
  poolShare,
}: ExchangeRateDisplayProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-500">Rate</span>
        <span>
          1 {firstToken?.symbol || "Token"} = {exchangeRate.toLocaleString()} {secondToken?.symbol || "Token"}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Share of Pool</span>
        <span>{poolShare}%</span>
      </div>
    </div>
  )
} 