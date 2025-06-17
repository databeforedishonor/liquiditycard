import { useState, useMemo } from "react"
import { token } from "@/types/token"

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
}

interface UseWithdrawalProps {
  firstToken: token | null
  secondToken: token | null
}

export function useWithdrawal({ 
  firstToken, 
  secondToken 
}: UseWithdrawalProps): UseWithdrawalReturn {
  const [withdrawPercentage, setWithdrawPercentage] = useState(50)

  // Mock LP token data - in real app, this would come from contract queries
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

    // Mock logic: For demo purposes, you can change this to "0.0000" to test the no LP tokens state
    // In a real app, this would come from blockchain queries
    const mockHasLPTokens = true // Set to false to test no LP tokens state
    
    return {
      symbol: `${firstToken.symbol}-${secondToken.symbol} LP`,
      balance: mockHasLPTokens ? "0.0245" : "0.0000",
      value: mockHasLPTokens ? "$84.23" : "$0.00",
      token0: firstToken,
      token1: secondToken,
    }
  }, [firstToken, secondToken])

  // Calculate estimated token amounts based on withdrawal percentage
  const estimatedFirstTokenAmount = useMemo(() => {
    if (!firstToken) return "0.000000"
    
    // Mock balance - in real app, this would come from contract queries
    const mockBalance = firstToken.symbol === "ETH" ? 1.45 : 2500.00
    return ((mockBalance * withdrawPercentage) / 100).toFixed(6)
  }, [firstToken, withdrawPercentage])

  const estimatedSecondTokenAmount = useMemo(() => {
    if (!secondToken) return "0.00"
    
    // Mock balance - in real app, this would come from contract queries
    const mockBalance = secondToken.symbol === "USDC" ? 2500.00 : 1.45
    return ((mockBalance * withdrawPercentage) / 100).toFixed(2)
  }, [secondToken, withdrawPercentage])

  return {
    withdrawPercentage,
    setWithdrawPercentage,
    estimatedFirstTokenAmount,
    estimatedSecondTokenAmount,
    lpToken,
  }
} 