import { TOKEN_CONSTANTS } from "./token-constants"
import type { TokenDisplayInfo } from "@/types/liquidity"

/**
 * Find token information by address from TOKEN_CONSTANTS
 */
export function findTokenByAddress(address: string): TokenDisplayInfo | undefined {
  return Object.values(TOKEN_CONSTANTS).find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  )
}

/**
 * Format reserve amount using token decimals
 */
export function formatReserve(reserve: string, decimals: number): string {
  try {
    const reserveBigInt = BigInt(reserve)
    const divisor = BigInt(10 ** decimals)
    const formatted = Number(reserveBigInt) / Number(divisor)
    return formatted.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 6 
    })
  } catch {
    return reserve
  }
}

/**
 * Format total supply (always 18 decimals for LP tokens)
 */
export function formatTotalSupply(supply: string): string {
  try {
    const supplyBigInt = BigInt(supply)
    const divisor = BigInt(10 ** 18) // LP tokens always have 18 decimals
    const formatted = Number(supplyBigInt) / Number(divisor)
    return formatted.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 8 
    })
  } catch {
    return supply
  }
}

/**
 * Format token amount with specified decimals
 */
export function formatTokenAmount(amount: string, decimals: number, displayDecimals = 6): string {
  try {
    const amountBigInt = BigInt(amount)
    const divisor = BigInt(10 ** decimals)
    const formatted = Number(amountBigInt) / Number(divisor)
    return formatted.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: displayDecimals 
    })
  } catch {
    return amount
  }
}

/**
 * Validate if amounts are valid for liquidity operations
 */
export function validateLiquidityAmounts(
  firstAmount: string, 
  secondAmount: string
): boolean {
  const first = parseFloat(firstAmount || "0")
  const second = parseFloat(secondAmount || "0")
  return first > 0 && second > 0 && !isNaN(first) && !isNaN(second)
}

/**
 * Calculate exchange rate between two tokens
 */
export function calculateExchangeRate(
  firstAmount: string, 
  secondAmount: string
): number {
  const first = parseFloat(firstAmount || "0")
  const second = parseFloat(secondAmount || "0")
  
  if (first === 0 || isNaN(first) || isNaN(second)) return 0
  return second / first
}

/**
 * Check if user has LP tokens
 */
export function hasLPTokens(lpTokenBalance: string): boolean {
  const balance = parseFloat(lpTokenBalance || "0")
  return balance > 0 && !isNaN(balance)
}

/**
 * Calculate withdrawal amounts based on LP token balance and percentage
 * Uses the proportional share formula: userShare = (userLPBalance / totalSupply) * reserve
 */
export function calculateWithdrawalAmounts(
  lpTokenBalance: string,
  totalSupply: string,
  reserve0: string,
  reserve1: string,
  withdrawalPercentage: number
): { amount0: string; amount1: string } {
  try {
    const lpBalanceBigInt = BigInt(lpTokenBalance)
    const totalSupplyBigInt = BigInt(totalSupply)
    const reserve0BigInt = BigInt(reserve0)
    const reserve1BigInt = BigInt(reserve1)
    
    // Calculate withdrawal amount of LP tokens (percentage of user's balance)
    const withdrawalAmount = (lpBalanceBigInt * BigInt(withdrawalPercentage)) / BigInt(100)
    
    // Calculate proportional amounts of underlying tokens
    // amount = (withdrawalLPAmount * reserve) / totalSupply
    const amount0 = (withdrawalAmount * reserve0BigInt) / totalSupplyBigInt
    const amount1 = (withdrawalAmount * reserve1BigInt) / totalSupplyBigInt
    
    return {
      amount0: amount0.toString(),
      amount1: amount1.toString()
    }
  } catch (error) {
    console.error('Error calculating withdrawal amounts:', error)
    return {
      amount0: "0",
      amount1: "0"
    }
  }
}

/**
 * Format LP token balance for display (LP tokens have 18 decimals)
 */
export function formatLPTokenBalance(balance: string): string {
  return formatTokenAmount(balance, 18, 8)
} 