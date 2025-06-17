"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { token } from "@/types/token"

interface TokenInputProps {
  label: string
  placeholder?: string
  value: string
  token: token | null
  balance?: string
  isLoading?: boolean
  onChange: (value: string) => void
  onTokenSelect: () => void
}

export function TokenInput({
  label,
  placeholder = "0.0",
  value,
  token,
  balance,
  isLoading = false,
  onChange,
  onTokenSelect,
}: TokenInputProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex justify-between mb-1">
        <label className="text-sm text-gray-500">{label}</label>
        {balance && (
          <span className="text-sm text-gray-500">
            Balance: {balance} {token?.symbol || ""}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 text-lg p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
        <Button
          variant="outline"
          className="flex items-center gap-1 h-10"
          onClick={onTokenSelect}
          disabled={isLoading}
        >
          {token && (
            <img
              src={token.image || "/placeholder.svg"}
              alt={token.symbol}
              className="h-5 w-5 rounded-full"
            />
          )}
          <span>{token?.symbol || "Select Token"}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
} 