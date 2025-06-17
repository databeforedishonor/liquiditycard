import { useFieldContext } from '@/lib/form-context'
import { TokenInput } from '@/components/liquidity/token-input'
import { TokenSelector } from '@/components/liquidity/token-selector'
import type { token } from '@/types/token'

interface TokenFieldProps {
  label: string
  tokens: token[]
  placeholder?: string
  showBalance?: boolean
  balance?: string
  onTokenSelect?: (token: token) => void
  showTokenList?: boolean
  onTokenListToggle?: () => void
}

export function TokenField({
  label,
  tokens,
  placeholder = "0.0",
  showBalance = false,
  balance,
  onTokenSelect,
  showTokenList = false,
  onTokenListToggle,
}: TokenFieldProps) {
  const field = useFieldContext<token | null>()

  const handleTokenSelect = (selectedToken: token) => {
    field.handleChange(selectedToken)
    onTokenSelect?.(selectedToken)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="relative">
        <TokenInput
          label=""
          value=""
          token={field.state.value}
          placeholder={placeholder}
          balance={showBalance ? balance : undefined}
          onChange={() => {}} // Not handled in token field
          onTokenSelect={() => onTokenListToggle?.()} // Just opens the selector
        />
        
        {showTokenList && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1">
            <TokenSelector
              tokens={tokens}
              isVisible={showTokenList}
              onTokenSelect={handleTokenSelect}
              onClose={() => onTokenListToggle?.()} // Handle undefined
            />
          </div>
        )}
      </div>
      
      {!field.state.meta.isValid && (
        <div className="text-sm text-red-600">
          {field.state.meta.errors.join(', ')}
        </div>
      )}
    </div>
  )
} 