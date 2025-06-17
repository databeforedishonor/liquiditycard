"use client"

import type { token } from "@/types/token"

interface TokenSelectorProps {
  tokens: token[]
  isVisible: boolean
  onTokenSelect: (token: token) => void
  onClose: () => void
}

export function TokenSelector({
  tokens,
  isVisible,
  onTokenSelect,
  onClose,
}: TokenSelectorProps) {
  if (!isVisible) return null

  const handleTokenSelect = (token: token) => {
    onTokenSelect(token)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-10" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
        <div className="p-2 max-h-60 overflow-auto">
          {tokens.map((token) => (
            <div
              key={token.tokenAddress.toString()}
              className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer"
              onClick={() => handleTokenSelect(token)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={token.image || "/placeholder.svg"}
                  alt={token.symbol}
                  className="h-6 w-6 rounded-full"
                />
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </div>
              <div className="text-sm">{token.format(6)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
} 