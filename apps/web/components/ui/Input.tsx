import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl bg-white/5 px-3 py-2 text-fg placeholder-muted outline-none focus-visible:ring-2 focus-visible:ring-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]',
        className
      )}
      {...props}
    />
  )
})
Input.displayName = 'Input'


