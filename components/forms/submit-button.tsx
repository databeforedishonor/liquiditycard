import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps {
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  className?: string
}

export function SubmitButton({
  children,
  variant = "default",
  size = "default",
  disabled = false,
  className,
}: SubmitButtonProps) {
  const form = useFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
        isValid: state.isValid,
      })}
    >
      {({ canSubmit, isSubmitting, isValid }) => (
        <Button
          type="submit"
          variant={variant}
          size={size}
          disabled={disabled || !canSubmit || !isValid || isSubmitting}
          className={className}
        >
          {isSubmitting ? 'Processing...' : children}
        </Button>
      )}
    </form.Subscribe>
  )
} 