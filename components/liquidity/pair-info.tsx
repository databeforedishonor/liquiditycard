"use client"

import { Info } from "lucide-react"
import type { PairTokens, PairReserves } from "@/types/liquidity"
import { findTokenByAddress, formatReserve, formatTotalSupply } from "@/lib/liquidity-utils"

interface PairInfoProps {
  pairAddress: string | null
  isPairLoading: boolean
  pairError: Error | null
  pairTokens: PairTokens | null
  isPairTokensLoading: boolean
  pairTokensError: Error | null
  reserves: PairReserves | null
  isReservesLoading: boolean
  reservesError: Error | null
  totalSupply: string | null
  isTotalSupplyLoading: boolean
  totalSupplyError: Error | null
}

export function PairInfo({
  pairAddress,
  isPairLoading,
  pairError,
  pairTokens,
  isPairTokensLoading,
  pairTokensError,
  reserves,
  isReservesLoading,
  reservesError,
  totalSupply,
  isTotalSupplyLoading,
  totalSupplyError,
}: PairInfoProps) {
  if (!pairAddress && !isPairLoading) {
    return null
  }

  const token0Info = pairTokens ? findTokenByAddress(pairTokens.token0) : null
  const token1Info = pairTokens ? findTokenByAddress(pairTokens.token1) : null

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-semibold mb-3">Liquidity Pool Information</h3>
      
      {isPairLoading && (
        <div className="text-sm text-gray-500">Loading pair information...</div>
      )}
      
      {pairError && (
        <div className="text-sm text-red-500">Error: {pairError.message}</div>
      )}
      
      {pairAddress && (
        <div className="space-y-3">
          {/* Pair Address */}
          <div>
            <span className="text-xs font-medium text-gray-500">Pair Contract:</span>
            <div className="font-mono text-xs text-gray-600 break-all mt-1">{pairAddress}</div>
          </div>
          
          {/* Loading States */}
          {(isPairTokensLoading || isReservesLoading || isTotalSupplyLoading) && (
            <div className="text-sm text-gray-500">
              {isPairTokensLoading && "Loading token information... "}
              {isReservesLoading && "Loading reserves... "}
              {isTotalSupplyLoading && "Loading total supply..."}
            </div>
          )}
          
          {/* Error States */}
          {(pairTokensError || reservesError || totalSupplyError) && (
            <div className="text-sm text-red-500">
              {pairTokensError && `Token Error: ${pairTokensError.message} `}
              {reservesError && `Reserves Error: ${reservesError.message} `}
              {totalSupplyError && `Total Supply Error: ${totalSupplyError.message}`}
            </div>
          )}
          
          {/* Token Information with Reserves */}
          {pairTokens && reserves && (
            <div className="grid grid-cols-1 gap-3">
              {/* Token 0 */}
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {token0Info && (
                    <img
                      src={token0Info.icon || "/placeholder.svg"}
                      alt={token0Info.symbol}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">
                    {token0Info ? `${token0Info.name} (${token0Info.symbol})` : 'Unknown Token'}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-500">Address:</div>
                  <div className="font-mono text-gray-600 break-all">{pairTokens.token0}</div>
                  <div className="text-gray-500">Reserve:</div>
                  <div className="font-medium">
                    {token0Info 
                      ? `${formatReserve(reserves.reserve0, token0Info.decimals)} ${token0Info.symbol}`
                      : reserves.reserve0
                    }
                  </div>
                </div>
              </div>
              
              {/* Token 1 */}
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {token1Info && (
                    <img
                      src={token1Info.icon || "/placeholder.svg"}
                      alt={token1Info.symbol}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span className="font-medium text-sm">
                    {token1Info ? `${token1Info.name} (${token1Info.symbol})` : 'Unknown Token'}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="text-gray-500">Address:</div>
                  <div className="font-mono text-gray-600 break-all">{pairTokens.token1}</div>
                  <div className="text-gray-500">Reserve:</div>
                  <div className="font-medium">
                    {token1Info 
                      ? `${formatReserve(reserves.reserve1, token1Info.decimals)} ${token1Info.symbol}`
                      : reserves.reserve1
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Total Supply Information */}
          {totalSupply && (
            <div className="bg-white p-3 rounded border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium text-sm">LP Token Supply</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-gray-500">Total LP Tokens:</div>
                <div className="font-medium text-blue-600">
                  {formatTotalSupply(totalSupply)} LP
                </div>
                <div className="text-gray-400 text-xs">
                  (Raw: {totalSupply})
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 