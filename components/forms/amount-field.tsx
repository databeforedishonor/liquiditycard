import { useFieldContext } from '@/lib/form-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AmountFieldProps {
  label: string
  placeholder?: string
  showMaxButton?: boolean
  maxValue?: string
  balance?: string
  onMaxClick?: () => void
  disabled?: boolean
}

export function AmountField({
  label,
  placeholder = "0.0",
  showMaxButton = false,
  maxValue,
  balance,
  onMaxClick,
  disabled = false,
}: AmountFieldProps) {
  const field = useFieldContext<string>()

  const handleMaxClick = () => {
    if (maxValue) {
      field.handleChange(maxValue)
    }
    onMaxClick?.()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      field.handleChange(value)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {balance && (
          <span className="text-sm text-gray-500">
            Balance: {balance}
          </span>
        )}
      </div>
      
      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          value={field.state.value}
          onChange={handleChange}
          onBlur={field.handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-16 ${!field.state.meta.isValid ? 'border-red-500' : ''}`}
        />
        
        {showMaxButton && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMaxClick}
            disabled={disabled || !maxValue}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-2 text-xs"
          >
            MAX
          </Button>
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