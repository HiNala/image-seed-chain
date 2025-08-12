import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-white/10', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_ease_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}


