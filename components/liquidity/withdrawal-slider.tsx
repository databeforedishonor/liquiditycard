"use client"

import { Slider } from "@/components/ui/slider"

interface WithdrawalSliderProps {
  percentage: number
  onPercentageChange: (percentage: number) => void
}

export function WithdrawalSlider({
  percentage,
  onPercentageChange,
}: WithdrawalSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Withdraw Amount</label>
        <span className="text-sm font-bold">{percentage}%</span>
      </div>
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        value={[percentage]}
        onValueChange={(value) => onPercentageChange(value[0])}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>0%</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100%</span>
      </div>
    </div>
  )
} 