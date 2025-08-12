import { cn } from '@/lib/cn'
import { HTMLAttributes, PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-white/10 backdrop-blur-2xl shadow-soft',
        className
      )}
      {...rest}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
      {children}
    </div>
  )
}


