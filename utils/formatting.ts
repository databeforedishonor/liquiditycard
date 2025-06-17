import { TOKEN_CONSTANTS } from "@/lib/token-constants"

  // Helper function to find token info by address
 export const findTokenByAddress = (address: string) => {
    return Object.values(TOKEN_CONSTANTS).find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    )
  }

  // Helper function to format reserve amount using token decimals
 export const formatReserve = (reserve: string, decimals: number) => {
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

  // Helper function to format total supply (always 18 decimals for LP tokens)
 export const formatTotalSupply = (supply: string) => {
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