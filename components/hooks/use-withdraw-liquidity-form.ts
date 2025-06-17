import { useForm } from '@tanstack/react-form'
import type { token } from '@/types/token'

export type WithdrawLiquidityFormValues = {
  firstToken: token | null
  secondToken: token | null
  withdrawPercentage: number
  showTokenList: number | null
}

interface UseWithdrawLiquidityFormProps {
  tokens: token[]
  onSubmit: (values: WithdrawLiquidityFormValues) => void
  onTokenChange?: (firstToken: token | null, secondToken: token | null) => void
  onPercentageChange?: (percentage: number) => void
}

export function useWithdrawLiquidityForm({
  tokens,
  onSubmit,
  onTokenChange,
  onPercentageChange,
}: UseWithdrawLiquidityFormProps) {
  const form = useForm({
    defaultValues: {
      firstToken: null,
      secondToken: null,
      withdrawPercentage: 0,
      showTokenList: null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as WithdrawLiquidityFormValues)
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        const values = formApi.state.values as WithdrawLiquidityFormValues
        
        // Notify about token changes
        if (fieldApi.name === 'firstToken' || fieldApi.name === 'secondToken') {
          onTokenChange?.(values.firstToken, values.secondToken)
        }
        
        // Notify about percentage changes
        if (fieldApi.name === 'withdrawPercentage') {
          onPercentageChange?.(values.withdrawPercentage)
        }
      },
      onChangeDebounceMs: 100,
    },
  })

  // Helper function to handle token selection
  const handleTokenSelect = (selectedToken: token) => {
    const currentValues = form.state.values as WithdrawLiquidityFormValues
    const showingList = currentValues.showTokenList

    if (showingList === 1) {
      form.setFieldValue('firstToken' as any, selectedToken)
      // Reset percentage when changing tokens
      form.setFieldValue('withdrawPercentage', 0)
    } else if (showingList === 2) {
      form.setFieldValue('secondToken' as any, selectedToken)
      // Reset percentage when changing tokens
      form.setFieldValue('withdrawPercentage', 0)
    }
    
    form.setFieldValue('showTokenList' as any, null)
  }

  // Helper function to set percentage presets
  const setPercentagePreset = (percentage: number) => {
    form.setFieldValue('withdrawPercentage', percentage)
  }

  // Helper function to validate if tokens are different
  const validateTokensAreDifferent = () => {
    const values = form.state.values as WithdrawLiquidityFormValues
    if (values.firstToken && values.secondToken) {
      return values.firstToken.symbol !== values.secondToken.symbol
    }
    return true
  }

  // Validation functions that can be used with form.Field
  const validateFirstToken = (value: token | null) => {
    if (!value) return 'First token is required'
    return undefined
  }

  const validateSecondToken = (value: token | null) => {
    if (!value) return 'Second token is required'
    const firstToken = (form.state.values as WithdrawLiquidityFormValues).firstToken
    if (value && firstToken && value.symbol === firstToken.symbol) {
      return 'Tokens must be different'
    }
    return undefined
  }

  const validatePercentage = (value: number) => {
    if (value < 0 || value > 100) {
      return 'Percentage must be between 0 and 100'
    }
    return undefined
  }

  return {
    form,
    handleTokenSelect,
    setPercentagePreset,
    validateTokensAreDifferent,
    // Validation functions for use in UI components
    validators: {
      firstToken: validateFirstToken,
      secondToken: validateSecondToken,
      percentage: validatePercentage,
    },
  }
} 