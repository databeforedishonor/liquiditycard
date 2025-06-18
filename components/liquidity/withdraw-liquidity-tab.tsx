"use client"

import { useState } from "react"
import { useWallet } from "@vechain/dapp-kit-react"
import { LPTokenInfo } from "./lp-token-info"
import { WithdrawalSlider } from "./withdrawal-slider"
import { WithdrawalEstimate } from "./withdrawal-estimate"
import { NoLPTokens } from "./no-lp-tokens"
import { TokenPairSelector } from "./token-pair-selector"
import type { token } from "@/types/token"
import { useGetPairAddress } from "../hooks/chain/use-get-pair-address"
import { useGetPairTokens } from "../hooks/chain/use-get-pair-tokens"
import { useLPTokenBalance } from "../hooks/chain/use-lp-token-balance"
import { usePairReserves } from "../hooks/chain/use-pair-reserves"
import { usePairTotalSupply } from "../hooks/chain/use-pair-total-supply"
import { 
  calculateWithdrawalAmounts, 
  formatLPTokenBalance, 
  formatTokenAmount,
  hasLPTokens,
  calculateExchangeRate
} from "@/lib/liquidity-utils"
import { TOKEN_CONSTANTS, createTokenFromConstant } from "@/lib/token-constants"

/**
 * Helper function to convert VET tokens to BVET for pair lookups
 * Since VET can't be used directly in smart contracts, DEX pairs use BVET instead
 */
function convertVETToBVETForPairLookup(token: token | null): token | null {
  if (!token || token.symbol !== "VET") {
    return token
  }
  
  // Return BVET token instead of VET for pair lookups
  return createTokenFromConstant(TOKEN_CONSTANTS.BVET, token.value.toString())
}

interface WithdrawLiquidityTabProps {
  // Token data
  firstToken: token | null
  secondToken: token | null
  tokens: token[]
  
  // UI state
  showTokenList: number | null
  
  // Event handlers
  onSwitchToAdd: () => void
  onTokenSelect: (token: token) => void
  onShowTokenList: (tokenIndex: number | null) => void
}

export function WithdrawLiquidityTab({
  firstToken,
  secondToken,
  tokens,
  showTokenList,
  onSwitchToAdd,
  onTokenSelect,
  onShowTokenList,
}: WithdrawLiquidityTabProps) {
  const { account } = useWallet()
  const [withdrawPercentage, setWithdrawPercentage] = useState(50)

  // Convert VET to BVET for pair lookups
  const firstTokenForPair = convertVETToBVETForPairLookup(firstToken)
  const secondTokenForPair = convertVETToBVETForPairLookup(secondToken)

  // Get pair address for the token pair (using BVET instead of VET)
  const {
    pairAddress,
    isLoading: isPairLoading,
    error: pairError,
  } = useGetPairAddress(
    firstTokenForPair?.tokenAddress.toString() || "",
    secondTokenForPair?.tokenAddress.toString() || "",
    Boolean(firstTokenForPair && secondTokenForPair)
  )

  // Get pair tokens to determine correct token order
  const {
    tokens: pairTokens,
    isLoading: isPairTokensLoading,
    error: pairTokensError,
  } = useGetPairTokens(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Get LP token balance for the user
  const {
    balance: lpTokenBalance,
    isLoading: isLPBalanceLoading,
    error: lpBalanceError,
  } = useLPTokenBalance({
    pairAddress: pairAddress || "",
    userAddress: account || "",
    enabled: Boolean(pairAddress && account),
  })

  // Get pair reserves
  const {
    call: reserves,
    isLoading: isReservesLoading,
    error: reservesError,
  } = usePairReserves(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Get pair total supply
  const {
    totalSupply,
    isLoading: isTotalSupplyLoading,
    error: totalSupplyError,
  } = usePairTotalSupply(
    pairAddress || "",
    Boolean(pairAddress)
  )

  // Combine loading states
  const isLoading = isPairLoading || isPairTokensLoading || isLPBalanceLoading || isReservesLoading || isTotalSupplyLoading

  // Combine error states
  const error = pairError || pairTokensError || lpBalanceError || reservesError || totalSupplyError

  // Format LP token balance and check if user has tokens
  const formattedLPBalance = formatLPTokenBalance(lpTokenBalance || "0")
  const userHasLPTokens = hasLPTokens(formattedLPBalance)

  // Debug logging
  console.log('Withdrawal Tab Debug:', {
    rawBalance: lpTokenBalance,
    formattedBalance: formattedLPBalance,
    userHasLPTokens,
    firstToken: firstToken?.symbol,
    secondToken: secondToken?.symbol
  })

  // Create LP token info object
  const lpToken = {
    symbol: firstToken && secondToken ? `${firstToken.symbol}-${secondToken.symbol} LP` : "LP Token",
    balance: formattedLPBalance,
    value: "$0.00", // TODO: Calculate USD value if needed
    token0: firstToken || {} as token,
    token1: secondToken || {} as token,
  }

  // Calculate estimated token amounts based on withdrawal percentage
  const withdrawalAmounts = calculateWithdrawalAmounts(
    lpTokenBalance || "0",
    totalSupply || "0",
    reserves?.reserve0 || "0",
    reserves?.reserve1 || "0",
    withdrawPercentage
  )

  // Calculate estimated amounts for display
  const estimatedFirstTokenAmount = (() => {
    if (!firstTokenForPair || !reserves || !pairTokens) return "0.000000"
    
    // Determine which reserve corresponds to first token by comparing addresses
    const isFirstTokenToken0 = pairTokens.token0.toLowerCase() === firstTokenForPair.tokenAddress.toString().toLowerCase()
    const amount = isFirstTokenToken0 ? withdrawalAmounts.amount0 : withdrawalAmounts.amount1
    return formatTokenAmount(amount, firstToken?.decimals || 18, 6)
  })()

  const estimatedSecondTokenAmount = (() => {
    if (!secondTokenForPair || !reserves || !pairTokens) return "0.000000"
    
    // Determine which reserve corresponds to second token by comparing addresses
    const isSecondTokenToken0 = pairTokens.token0.toLowerCase() === secondTokenForPair.tokenAddress.toString().toLowerCase()
    const amount = isSecondTokenToken0 ? withdrawalAmounts.amount0 : withdrawalAmounts.amount1
    return formatTokenAmount(amount, secondToken?.decimals || 18, 6)
  })()

  // Calculate exchange rate
  const exchangeRate = calculateExchangeRate(
    estimatedFirstTokenAmount,
    estimatedSecondTokenAmount
  )

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