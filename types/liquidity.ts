export interface LiquidityMode {
  mode: "add" | "withdraw"
}

export interface TokenDisplayInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  icon?: string
  image?: string
}

export interface LPTokenInfo {
  symbol: string
  balance: string
  value: string
}

export interface ExchangeRateInfo {
  rate: number
  poolShare: string
}

export interface WithdrawEstimate {
  firstTokenAmount: string
  secondTokenAmount: string
  percentage: number
}

export interface PairReserves {
  reserve0: string
  reserve1: string
}

export interface PairTokens {
  token0: string
  token1: string
}

export interface QuoteInfo {
  quote: string
  isLoading: boolean
  error: Error | null
} 