import { cn } from '@/lib/cn'
import { forwardRef } from 'react'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-fg placeholder-muted outline-none backdrop-blur-lg transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] focus-visible:border-white/30 focus-visible:bg-white/12 focus-visible:ring-2 focus-visible:ring-white/20 resize-none',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'


