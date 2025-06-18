import { Balance } from "./balance"
import { token } from "./token"

export interface Pair {
  pairAddress: string
  token0: token
  token1: token
  reserve0: Balance
  reserve1: Balance
  totalSupply: Balance
} 