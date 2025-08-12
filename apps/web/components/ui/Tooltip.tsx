"use client"
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type TooltipProps = {
  children: React.ReactElement
  content: string
}

export function Tooltip({ children, content }: TooltipProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => setMounted(true), [])

  return (
    <div
      ref={ref}
      className="inline-flex"
      onMouseEnter={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        setPos({ x: r.left + r.width / 2, y: r.top })
        setOpen(true)
      }}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {mounted && open &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-2 rounded-md bg-black/80 px-2 py-1 text-xs text-white shadow-soft"
            style={{ left: pos.x, top: pos.y }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  )
}


