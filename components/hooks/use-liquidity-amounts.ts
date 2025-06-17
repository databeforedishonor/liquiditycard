import { useMemo } from "react"
import { token } from "../../types/token"

interface UseLiquidityAmountsReturn {
  exchangeRate: number
  poolShare: string
  isValidAmounts: boolean
}

interface UseLiquidityAmountsProps {
  firstToken: token | null
  secondToken: token | null
  firstTokenAmount?: string
  secondTokenAmount?: string
}

export function useLiquidityAmounts({ 
  firstToken, 
  secondToken,
  firstTokenAmount = "",
  secondTokenAmount = ""
}: UseLiquidityAmountsProps): UseLiquidityAmountsReturn {

  // Mock exchange rate calculation - in real app, this would come from DEX/AMM
  const exchangeRate = useMemo(() => {
    if (!firstToken || !secondToken) return 0
    
    // Mock rates for demo purposes
    const rates: Record<string, Record<string, number>> = {
      ETH: { USDC: 1724.35, DAI: 1724.35, WBTC: 0.058 },
      USDC: { ETH: 0.00058, DAI: 1.0, WBTC: 0.000034 },
      WBTC: { ETH: 17.2, USDC: 29620, DAI: 29620 },
      DAI: { ETH: 0.00058, USDC: 1.0, WBTC: 0.000034 }
    }
    
    return rates[firstToken.symbol]?.[secondToken.symbol] || 0
  }, [firstToken, secondToken])

  // Mock pool share calculation
  const poolShare = useMemo(() => {
    const firstAmount = Number.parseFloat(firstTokenAmount) || 0
    const secondAmount = Number.parseFloat(secondTokenAmount) || 0
    
    if (firstAmount === 0 && secondAmount === 0) return "0.00"
    
    // Mock calculation - in real app, this would be based on actual pool data
    const totalValue = firstAmount + (secondAmount / exchangeRate)
    const sharePercentage = Math.min(totalValue * 0.001, 100) // Mock percentage
    
    return sharePercentage.toFixed(2)
  }, [firstTokenAmount, secondTokenAmount, exchangeRate])

  const isValidAmounts = useMemo(() => {
    const firstAmount = Number.parseFloat(firstTokenAmount) || 0
    const secondAmount = Number.parseFloat(secondTokenAmount) || 0
    
    return firstAmount > 0 && secondAmount > 0
  }, [firstTokenAmount, secondTokenAmount])

  return {
    exchangeRate,
    poolShare,
    isValidAmounts,
  }
} 