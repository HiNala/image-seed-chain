import { cn } from '@/lib/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:translate-y-[-1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-lg border',
  {
    variants: {
      variant: {
        primary: 'border-haze-500/50 bg-haze-600 text-white hover:bg-haze-500 hover:border-haze-400/60 shadow-lg hover:shadow-xl',
        ghost: 'border-white/20 bg-white/10 text-fg hover:bg-white/20 hover:border-white/30'
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props}>
        {loading ? 'Loading…' : children}
      </button>
    )
  }
)
Button.displayName = 'Button'


