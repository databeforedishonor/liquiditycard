import { useForm } from '@tanstack/react-form'
import { useRef } from 'react'
import type { token } from '@/types/token'

export type AddLiquidityFormValues = {
  firstToken: token | null
  secondToken: token | null
  firstTokenAmount: string
  secondTokenAmount: string
  showTokenList: number | null
}

interface UseAddLiquidityFormProps {
  tokens: token[]
  onSubmit: (values: AddLiquidityFormValues) => void
  quote?: string | null
  isQuoteLoading?: boolean
  onTokenAmountChange?: (firstAmount: string, secondAmount: string) => void
}

export function useAddLiquidityForm({
  tokens,
  onSubmit,
  quote,
  isQuoteLoading,
  onTokenAmountChange,
}: UseAddLiquidityFormProps) {
  // Track which field was last modified to avoid updating the field user is typing in
  const lastModifiedField = useRef<'firstTokenAmount' | 'secondTokenAmount' | null>(null)

  const form = useForm({
    defaultValues: {
      firstToken: null,
      secondToken: null,
      firstTokenAmount: '',
      secondTokenAmount: '',
      showTokenList: null,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value as AddLiquidityFormValues)
    },
  })

  // Handle first token amount changes with field tracking
  const handleFirstTokenAmountChange = (value: string) => {
    lastModifiedField.current = 'firstTokenAmount'
    form.setFieldValue('firstTokenAmount', value)
    
    // Clear the opposite field only if we have a value and are switching inputs
    const currentValues = form.state.values
    if (value && currentValues.secondTokenAmount) {
      form.setFieldValue('secondTokenAmount', '')
    }
    
    // Notify parent about the change
    onTokenAmountChange?.(value, currentValues.secondTokenAmount)
    
    // Update quote if available
    if (quote && !isQuoteLoading && value && !currentValues.secondTokenAmount) {
      form.setFieldValue('secondTokenAmount', quote)
    }
  }

  // Handle second token amount changes with field tracking
  const handleSecondTokenAmountChange = (value: string) => {
    lastModifiedField.current = 'secondTokenAmount'
    form.setFieldValue('secondTokenAmount', value)
    
    // Clear the opposite field only if we have a value and are switching inputs
    const currentValues = form.state.values
    if (value && currentValues.firstTokenAmount) {
      form.setFieldValue('firstTokenAmount', '')
    }
    
    // Notify parent about the change
    onTokenAmountChange?.(currentValues.firstTokenAmount, value)
    
    // Update quote if available
    if (quote && !isQuoteLoading && value && !currentValues.firstTokenAmount) {
      form.setFieldValue('firstTokenAmount', quote)
    }
  }

  // Helper function to handle token selection
  const handleTokenSelect = (selectedToken: token) => {
    const currentValues = form.state.values
    const showingList = currentValues.showTokenList

    if (showingList === 1) {
      form.setFieldValue('firstToken' as any, selectedToken)
      // Reset amounts when changing tokens
      form.setFieldValue('firstTokenAmount', '')
      form.setFieldValue('secondTokenAmount', '')
      lastModifiedField.current = null
    } else if (showingList === 2) {
      form.setFieldValue('secondToken' as any, selectedToken)
      // Reset amounts when changing tokens
      form.setFieldValue('firstTokenAmount', '')
      form.setFieldValue('secondTokenAmount', '')
      lastModifiedField.current = null
    }
    
    form.setFieldValue('showTokenList' as any, null)
  }

  // Helper function to validate if tokens are different
  const validateTokensAreDifferent = () => {
    const values = form.state.values as AddLiquidityFormValues
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
    const firstToken = (form.state.values as AddLiquidityFormValues).firstToken
    if (value && firstToken && value.symbol === firstToken.symbol) {
      return 'Tokens must be different'
    }
    return undefined
  }

  const validateAmount = (value: string) => {
    if (!value) return undefined
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      return 'Amount must be a positive number'
    }
    return undefined
  }

  return {
    form,
    handleTokenSelect,
    handleFirstTokenAmountChange,
    handleSecondTokenAmountChange,
    validateTokensAreDifferent,
    // Validation functions for use in UI components
    validators: {
      firstToken: validateFirstToken,
      secondToken: validateSecondToken,
      amount: validateAmount,
    },
  }
} 