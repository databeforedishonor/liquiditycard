import { useFieldContext } from '@/lib/form-context'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'

interface PercentageFieldProps {
  label: string
  showPresets?: boolean
  presets?: number[]
  disabled?: boolean
}

export function PercentageField({
  label,
  showPresets = true,
  presets = [25, 50, 75, 100],
  disabled = false,
}: PercentageFieldProps) {
  const field = useFieldContext<number>()

  const handlePresetClick = (percentage: number) => {
    field.handleChange(percentage)
  }

  const handleSliderChange = (values: number[]) => {
    field.handleChange(values[0])
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-medium text-gray-900">
          {field.state.value}%
        </span>
      </div>
      
      <div className="px-3">
        <Slider
          value={[field.state.value]}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>
      
      {showPresets && (
        <div className="grid grid-cols-4 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={field.state.value === preset ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className="text-xs"
            >
              {preset}%
            </Button>
          ))}
        </div>
      )}
      
      {!field.state.meta.isValid && (
        <div className="text-sm text-red-600">
          {field.state.meta.errors.join(', ')}
        </div>
      )}
    </div>
  )
} 