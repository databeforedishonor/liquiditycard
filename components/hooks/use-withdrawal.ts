import { useState, useMemo } from "react"
import { useWallet } from "@vechain/dapp-kit-react"
import { token } from "@/types/token"
import { useGetPairAddress } from "./chain/use-get-pair-address"
import { useGetPairTokens } from "./chain/use-get-pair-tokens"
import { useLPTokenBalance } from "./chain/use-lp-token-balance"
import { usePairReserves } from "./chain/use-pair-reserves"
import { usePairTotalSupply } from "./chain/use-pair-total-supply"
import { 
  calculateWithdrawalAmounts, 
  formatLPTokenBalance, 
  formatTokenAmount,
  hasLPTokens 
} from "@/lib/liquidity-utils"

interface LPToken {
  symbol: string
  balance: string
  value: string
  token0: token
  token1: token
}

interface UseWithdrawalReturn {
  withdrawPercentage: number
  setWithdrawPercentage: (percentage: number) => void
  estimatedFirstTokenAmount: string
  estimatedSecondTokenAmount: string
  lpToken: LPToken
  isLoading: boolean
  error: Error | null
}

interface UseWithdrawalProps {
  firstToken: token | null
  secondToken: token | null
}

export function useWithdrawal({ 
  firstToken, 
  secondToken 
}: UseWithdrawalProps): UseWithdrawalReturn {
  const { account } = useWallet()
  const [withdrawPercentage, setWithdrawPercentage] = useState(50)

  // Get pair address for the token pair
  const {
    pairAddress,
    isLoading: isPairLoading,
    error: pairError,
  } = useGetPairAddress(
    firstToken?.tokenAddress.toString() || "",
    secondToken?.tokenAddress.toString() || "",
    Boolean(firstToken && secondToken)
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

  // Create LP token info
  const lpToken = useMemo((): LPToken => {
    if (!firstToken || !secondToken) {
      return {
        symbol: "LP Token",
        balance: "0.0000",
        value: "$0.00",
        token0: firstToken || {} as token,
        token1: secondToken || {} as token,
      }
    }

    const formattedBalance = formatLPTokenBalance(lpTokenBalance)
    const hasTokens = hasLPTokens(lpTokenBalance)
    
    return {
      symbol: `${firstToken.symbol}-${secondToken.symbol} LP`,
      balance: formattedBalance,
      value: hasTokens ? "$0.00" : "$0.00", // TODO: Calculate USD value if needed
      token0: firstToken,
      token1: secondToken,
    }
  }, [firstToken, secondToken, lpTokenBalance])

  // Calculate estimated token amounts based on withdrawal percentage
  const withdrawalAmounts = useMemo(() => {
    if (!reserves || !totalSupply || !lpTokenBalance) {
      return { amount0: "0", amount1: "0" }
    }

    return calculateWithdrawalAmounts(
      lpTokenBalance,
      totalSupply,
      reserves.reserve0,
      reserves.reserve1,
      withdrawPercentage
    )
  }, [lpTokenBalance, totalSupply, reserves, withdrawPercentage])

  const estimatedFirstTokenAmount = useMemo(() => {
    if (!firstToken || !reserves || !pairTokens) return "0.000000"
    
    // Determine which reserve corresponds to first token by comparing addresses
    const isFirstTokenToken0 = pairTokens.token0.toLowerCase() === firstToken.tokenAddress.toString().toLowerCase()
    const amount = isFirstTokenToken0 ? withdrawalAmounts.amount0 : withdrawalAmounts.amount1
    return formatTokenAmount(amount, firstToken.decimals, 6)
  }, [firstToken, pairTokens, withdrawalAmounts])

  const estimatedSecondTokenAmount = useMemo(() => {
    if (!secondToken || !reserves || !pairTokens) return "0.000000"
    
    // Determine which reserve corresponds to second token by comparing addresses
    const isSecondTokenToken0 = pairTokens.token0.toLowerCase() === secondToken.tokenAddress.toString().toLowerCase()
    const amount = isSecondTokenToken0 ? withdrawalAmounts.amount0 : withdrawalAmounts.amount1
    return formatTokenAmount(amount, secondToken.decimals, 6)
  }, [secondToken, pairTokens, withdrawalAmounts])

  return {
    withdrawPercentage,
    setWithdrawPercentage,
    estimatedFirstTokenAmount,
    estimatedSecondTokenAmount,
    lpToken,
    isLoading,
    error,
  }
} 