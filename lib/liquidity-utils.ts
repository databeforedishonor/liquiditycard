import { TOKEN_CONSTANTS } from "./token-constants"
import type { TokenDisplayInfo, LPTokenInfo } from "@/types/liquidity"

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