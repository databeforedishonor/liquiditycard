import { Balance } from "@/types/balance"
import { Pair } from "@/types/pair"
import { token } from "@/types/token"

export function calculateAddLiquidityAmount(
  pair: Pair,
  token0Amount: Balance | null,
  token1Amount: Balance | null,
  lastChangedField: "token0" | "token1",
  token0: token,
  token1: token
): { token0: Balance; token1: Balance; lpAmount: Balance | null } | null {
  if (!pair || (!token0Amount && !token1Amount)) {
    return null
  }

  const reserve0 = BigInt(pair.reserve0.raw)
  const reserve1 = BigInt(pair.reserve1.raw)

  if (reserve0 === BigInt(0) || reserve1 === BigInt(0)) {
    // First liquidity provision - user can set any ratio
    if (token0Amount && token1Amount) {
      return {
        token0: token0Amount,
        token1: token1Amount,
        lpAmount: null // Calculate based on sqrt(amount0 * amount1) for first provision
      }
    }
    return null
  }

  // Calculate optimal amounts based on current reserves
  if (lastChangedField === "token0" && token0Amount) {
    // Calculate token1 amount based on token0 input
    const amount0 = BigInt(token0Amount.raw)
    const amount1 = (amount0 * reserve1) / reserve0
    
    const calculatedToken1: Balance = {
      raw: amount1.toString(),
      formatted: (Number(amount1) / Math.pow(10, token1.decimals)).toFixed(6),
      decimals: token1.decimals
    }

    return {
      token0: token0Amount,
      token1: calculatedToken1,
      lpAmount: null // Calculate LP tokens based on current total supply
    }
  } else if (lastChangedField === "token1" && token1Amount) {
    // Calculate token0 amount based on token1 input
    const amount1 = BigInt(token1Amount.raw)
    const amount0 = (amount1 * reserve0) / reserve1
    
    const calculatedToken0: Balance = {
      raw: amount0.toString(),
      formatted: (Number(amount0) / Math.pow(10, token0.decimals)).toFixed(6),
      decimals: token0.decimals
    }

    return {
      token0: calculatedToken0,
      token1: token1Amount,
      lpAmount: null // Calculate LP tokens based on current total supply
    }
  }

  return null
} 