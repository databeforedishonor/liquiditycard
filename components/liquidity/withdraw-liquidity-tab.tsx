"use client"

import { LPTokenInfo } from "./lp-token-info"
import { WithdrawalSlider } from "./withdrawal-slider"
import { WithdrawalEstimate } from "./withdrawal-estimate"
import { NoLPTokens } from "./no-lp-tokens"
import { TokenPairSelector } from "./token-pair-selector"
import type { token } from "@/types/token"
import type { LPTokenInfo as LPTokenInfoType } from "@/types/liquidity"
import { hasLPTokens } from "@/lib/liquidity-utils"

interface WithdrawLiquidityTabProps {
  // Token data
  firstToken: token | null
  secondToken: token | null
  tokens: token[]
  
  // UI state
  showTokenList: number | null
  
  // LP token data
  lpToken: LPTokenInfoType
  
  // Withdrawal data
  withdrawPercentage: number
  estimatedFirstTokenAmount: string
  estimatedSecondTokenAmount: string
  
  // Exchange rate data
  exchangeRate: number
  
  // Loading and error states
  isLoading: boolean
  error: Error | null
  
  // Event handlers
  setWithdrawPercentage: (percentage: number) => void
  onSwitchToAdd: () => void
  onTokenSelect: (token: token) => void
  onShowTokenList: (tokenIndex: number | null) => void
}

export function WithdrawLiquidityTab({
  firstToken,
  secondToken,
  tokens,
  showTokenList,
  lpToken,
  withdrawPercentage,
  estimatedFirstTokenAmount,
  estimatedSecondTokenAmount,
  exchangeRate,
  isLoading,
  error,
  setWithdrawPercentage,
  onSwitchToAdd,
  onTokenSelect,
  onShowTokenList,
}: WithdrawLiquidityTabProps) {
  // Check if user has LP tokens
  const userHasLPTokens = hasLPTokens(lpToken.balance)

  return (
    <div className="space-y-4">
      {/* Token Pair Selector */}
      <TokenPairSelector
        firstToken={firstToken}
        secondToken={secondToken}
        tokens={tokens}
        showTokenList={showTokenList}
        onTokenSelect={onTokenSelect}
        onShowTokenList={onShowTokenList}
      />

      {/* Loading State */}
      {isLoading && firstToken && secondToken && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 text-sm">Loading LP token information...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">
            <strong>Error loading LP token data:</strong> {error.message}
          </div>
        </div>
      )}

      {/* Conditional content based on LP tokens */}
      {!isLoading && !error && (
        <>
          {!userHasLPTokens ? (
            <NoLPTokens
              firstToken={firstToken}
              secondToken={secondToken}
              onSwitchToAdd={onSwitchToAdd}
            />
          ) : (
            <>
              {/* LP Token Information */}
              <LPTokenInfo
                firstToken={firstToken}
                secondToken={secondToken}
                lpToken={lpToken}
              />

              {/* Withdrawal Percentage Slider */}
              <WithdrawalSlider
                percentage={withdrawPercentage}
                onPercentageChange={setWithdrawPercentage}
              />

              {/* Estimated Tokens to Receive */}
              <WithdrawalEstimate
                firstToken={firstToken}
                secondToken={secondToken}
                estimatedFirstTokenAmount={estimatedFirstTokenAmount}
                estimatedSecondTokenAmount={estimatedSecondTokenAmount}
              />

              {/* Current Exchange Rate */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Rate</span>
                  <span>
                    1 {firstToken?.symbol || "Token"} = {exchangeRate.toLocaleString()} {secondToken?.symbol || "Token"}
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
} 