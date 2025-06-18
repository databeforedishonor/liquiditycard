import { Balance } from "@/types/balance"

export function createBalanceObjectFromRaw(raw: string, decimals: number): Balance {
  const rawBigInt = BigInt(raw)
  const divisor = BigInt(10 ** decimals)
  const wholePart = rawBigInt / divisor
  const fractionalPart = rawBigInt % divisor
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, "0")
  const formatted = `${wholePart}.${fractionalStr.slice(0, 6)}` // Show up to 6 decimal places
  
  return {
    raw,
    formatted,
    decimals
  }
}

export function createBalanceFromFormatted(formatted: string, decimals: number): Balance {
  // Validate input
  if (!formatted || formatted.trim() === '') {
    throw new Error('Formatted amount cannot be empty')
  }
  
  const trimmedFormatted = formatted.trim()
  
  // Check if it's a valid number
  if (isNaN(Number(trimmedFormatted))) {
    throw new Error(`Invalid number format: ${trimmedFormatted}`)
  }
  
  const [wholePart = "0", fractionalPart = "0"] = trimmedFormatted.split(".")
  
  // Validate parts are numeric
  if (isNaN(Number(wholePart)) || isNaN(Number(fractionalPart))) {
    throw new Error(`Invalid number parts: whole=${wholePart}, fractional=${fractionalPart}`)
  }
  
  const paddedFractional = fractionalPart.padEnd(decimals, "0").slice(0, decimals)
  const raw = (BigInt(wholePart) * BigInt(10 ** decimals) + BigInt(paddedFractional)).toString()
  
  return {
    raw,
    formatted: trimmedFormatted,
    decimals
  }
} 