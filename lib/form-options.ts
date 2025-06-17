import { formOptions } from '@tanstack/react-form'
import type { token } from '@/types/token'
import { AddLiquidityFormValues } from '@/components/hooks/use-add-liquidity-form'
import { WithdrawLiquidityFormValues } from '@/components/hooks/use-withdraw-liquidity-form'

// Shared configuration for add liquidity forms
export const addLiquidityFormOptions = formOptions({
  defaultValues: {
    firstToken: null as token | null,
    secondToken: null as token | null,
    firstTokenAmount: '',
    secondTokenAmount: '',
    showTokenList: null as number | null,
  },
  validators: {
    onSubmit: ({ value }: { value: AddLiquidityFormValues }) => {
      const errors: Record<string, string> = {}
      
      if (!value.firstToken) {
        errors.firstToken = 'First token is required'
      }
      
      if (!value.secondToken) {
        errors.secondToken = 'Second token is required'
      }
      
      if (value.firstToken && value.secondToken && 
          value.firstToken.symbol === value.secondToken.symbol) {
        errors.secondToken = 'Tokens must be different'
      }
      
      if (!value.firstTokenAmount || parseFloat(value.firstTokenAmount) <= 0) {
        errors.firstTokenAmount = 'Valid amount required'
      }
      
      if (!value.secondTokenAmount || parseFloat(value.secondTokenAmount) <= 0) {
        errors.secondTokenAmount = 'Valid amount required'
      }
      
      return Object.keys(errors).length > 0 ? errors : undefined
    },
  },
})

// Shared configuration for withdraw liquidity forms
export const withdrawLiquidityFormOptions = formOptions({
  defaultValues: {
    firstToken: null as token | null,
    secondToken: null as token | null,
    withdrawPercentage: 0,
    showTokenList: null as number | null,
  },
  validators: {
    onSubmit: ({ value }: { value: WithdrawLiquidityFormValues }) => {
      const errors: Record<string, string> = {}
      
      if (!value.firstToken) {
        errors.firstToken = 'First token is required'
      }
      
      if (!value.secondToken) {
        errors.secondToken = 'Second token is required'
      }
      
      if (value.firstToken && value.secondToken && 
          value.firstToken.symbol === value.secondToken.symbol) {
        errors.secondToken = 'Tokens must be different'
      }
      
      if (value.withdrawPercentage <= 0 || value.withdrawPercentage > 100) {
        errors.withdrawPercentage = 'Percentage must be between 1 and 100'
      }
      
      return Object.keys(errors).length > 0 ? errors : undefined
    },
  },
})

// Token validation helpers
export const tokenValidators = {
  firstToken: (value: token | null) => {
    if (!value) return 'Token is required'
    return undefined
  },
  
  secondToken: (value: token | null, formState: any) => {
    if (!value) return 'Token is required'
    if (formState.firstToken && value.symbol === formState.firstToken.symbol) {
      return 'Tokens must be different'
    }
    return undefined
  },
  
  amount: (value: string) => {
    if (!value) return 'Amount is required'
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      return 'Amount must be a positive number'
    }
    return undefined
  },
  
  percentage: (value: number) => {
    if (value < 0 || value > 100) {
      return 'Percentage must be between 0 and 100'
    }
    if (value === 0) {
      return 'Please select an amount to withdraw'
    }
    return undefined
  },
} 