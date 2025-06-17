import { createFormHookContexts, createFormHook } from '@tanstack/react-form'
import { TokenField } from '@/components/forms/token-field'
import { AmountField } from '@/components/forms/amount-field'
import { PercentageField } from '@/components/forms/percentage-field'
import { SubmitButton } from '@/components/forms/submit-button'

// Export contexts for use in custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

// Create our app-specific form hook with pre-bound components
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TokenField,
    AmountField,
    PercentageField,
  },
  formComponents: {
    SubmitButton
  },
})

// Export form options helper for shared form configurations
export { formOptions } from '@tanstack/react-form' 