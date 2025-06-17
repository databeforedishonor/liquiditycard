import { useAppForm, withForm } from '@/lib/form-context'
import { withdrawLiquidityFormOptions, tokenValidators } from '@/lib/form-options'
import { LPTokenInfo } from '@/components/liquidity/lp-token-info'
import { WithdrawalEstimate } from '@/components/liquidity/withdrawal-estimate'
import type { token } from '@/types/token'

interface WithdrawLiquidityFormProps {
  tokens: token[]
  lpTokenBalance?: string
  estimatedAmounts?: { firstAmount: string; secondAmount: string }
  onSubmit: (values: any) => void
  onTokenChange?: (firstToken: token | null, secondToken: token | null) => void
  onPercentageChange?: (percentage: number) => void
}

export const WithdrawLiquidityForm = withForm({
  ...withdrawLiquidityFormOptions,
  props: {
    tokens: [] as token[],
    lpTokenBalance: undefined as string | undefined,
    estimatedAmounts: undefined as { firstAmount: string; secondAmount: string } | undefined,
    onTokenChange: undefined as ((firstToken: token | null, secondToken: token | null) => void) | undefined,
    onPercentageChange: undefined as ((percentage: number) => void) | undefined,
  },
  render: ({ 
    form, 
    tokens, 
    lpTokenBalance,
    estimatedAmounts,
    onTokenChange,
    onPercentageChange 
  }) => {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        {/* Token Pair Selection */}
        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="firstToken"
            validators={{
              onChange: tokenValidators.firstToken,
            }}
            listeners={{
              onChange: ({ value }) => {
                const secondToken = form.state.values.secondToken as token | null
                onTokenChange?.(value, secondToken)
                // Reset percentage when tokens change
                form.setFieldValue('withdrawPercentage', 0)
              },
            }}
          >
            {(field) => (
              <field.TokenField
                label="First Token"
                tokens={tokens}
                showBalance={false}
              />
            )}
          </form.AppField>

          <form.AppField
            name="secondToken"
            validators={{
              onChange: (value) => tokenValidators.secondToken(value, form.state.values),
            }}
            listeners={{
              onChange: ({ value }) => {
                const firstToken = form.state.values.firstToken as token | null
                onTokenChange?.(firstToken, value)
                // Reset percentage when tokens change
                form.setFieldValue('withdrawPercentage', 0)
              },
            }}
          >
            {(field) => (
              <field.TokenField
                label="Second Token"
                tokens={tokens}
                showBalance={false}
              />
            )}
          </form.AppField>
        </div>

        {/* LP Token Information */}
        <form.Subscribe
          selector={(state) => ({
            firstToken: state.values.firstToken,
            secondToken: state.values.secondToken,
          })}
        >
          {({ firstToken, secondToken }) => (
            firstToken && secondToken && lpTokenBalance && (
              <LPTokenInfo
                firstToken={firstToken}
                secondToken={secondToken}
                balance={lpTokenBalance}
              />
            )
          )}
        </form.Subscribe>

        {/* Withdrawal Percentage Slider */}
        <form.AppField
          name="withdrawPercentage"
          validators={{
            onChange: tokenValidators.percentage,
          }}
          listeners={{
            onChange: ({ value }) => {
              onPercentageChange?.(value)
            },
            onChangeDebounceMs: 100,
          }}
        >
          {(field) => (
            <field.PercentageField
              label="Withdrawal Amount"
              showPresets={true}
              presets={[25, 50, 75, 100]}
            />
          )}
        </form.AppField>

        {/* Withdrawal Estimate */}
        <form.Subscribe
          selector={(state) => ({
            firstToken: state.values.firstToken,
            secondToken: state.values.secondToken,
            percentage: state.values.withdrawPercentage,
          })}
        >
          {({ firstToken, secondToken, percentage }) => (
            firstToken && secondToken && percentage > 0 && estimatedAmounts && (
              <WithdrawalEstimate
                firstToken={firstToken}
                secondToken={secondToken}
                firstAmount={estimatedAmounts.firstAmount}
                secondAmount={estimatedAmounts.secondAmount}
                percentage={percentage}
              />
            )
          )}
        </form.Subscribe>

        {/* Submit Button */}
        <form.AppForm>
          <form.SubmitButton 
            className="w-full"
            variant="destructive"
          >
            <form.Subscribe
              selector={(state) => state.values.withdrawPercentage}
            >
              {(percentage) => (
                percentage === 100 ? 'Remove All Liquidity' : 'Remove Liquidity'
              )}
            </form.Subscribe>
          </form.SubmitButton>
        </form.AppForm>

        {/* Form Errors */}
        <form.Subscribe
          selector={(state) => state.errorMap}
        >
          {(errorMap) => (
            Object.keys(errorMap).length > 0 && (
              <div className="text-sm text-red-600 space-y-1">
                {Object.entries(errorMap).map(([field, error]) => (
                  <div key={field}>
                    {typeof error === 'string' ? error : JSON.stringify(error)}
                  </div>
                ))}
              </div>
            )
          )}
        </form.Subscribe>
      </form>
    )
  },
})

// Alternative: Simple hook-based approach for more control
export function useWithdrawLiquidityForm(props: WithdrawLiquidityFormProps) {
  return useAppForm({
    ...withdrawLiquidityFormOptions,
    onSubmit: async ({ value }) => {
      props.onSubmit(value)
    },
    listeners: {
      onChange: ({ formApi, fieldApi }) => {
        const values = formApi.state.values

        // Notify about token changes
        if (fieldApi.name === 'firstToken' || fieldApi.name === 'secondToken') {
          props.onTokenChange?.(
            values.firstToken as token | null,
            values.secondToken as token | null
          )
        }

        // Notify about percentage changes
        if (fieldApi.name === 'withdrawPercentage') {
          props.onPercentageChange?.(values.withdrawPercentage as number)
        }
      },
      onChangeDebounceMs: 100,
    },
  })
} 