"use client"
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
// import { Card } from '@/components/ui/Card'
// import { Button } from '@/components/ui/Button'
import { useHistory } from '@/lib/hooks'
import type { SeedMeta } from '@/types'

type Props = {
  open: boolean
  onClose: () => void
}

const speeds = [0.5, 1, 2] as const

export function TimelapseModal({ open, onClose }: Props) {
  const { data } = useHistory(200)
  const frames: SeedMeta[] = useMemo(() => [...(data ?? [])].reverse(), [data])

  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState<(typeof speeds)[number]>(1)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !playing || frames.length === 0) return
    const base = 3500 // ms
    const interval = base / speed
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length)
    }, interval)
    return () => clearInterval(t)
  }, [open, playing, speed, frames.length])

  useEffect(() => {
    // reset index when frames change
    setIdx(0)
  }, [frames.length])

  if (!open) return null

  const current = frames[idx]

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Dimmed gradient background with drift */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b0b0b]/80 via-[#1b0f2b]/70 to-[#0a1a2a]/70" />

      {/* Content */}
      <div className="relative flex h-full w-full items-center justify-center p-4">
        <button
          aria-label="Close timelapse"
          className="absolute right-4 top-4 rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-sm text-fg/90 hover:bg-white/15"
          onClick={onClose}
        >
          Close
        </button>
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl">
          {/* Frame image with crossfade */}
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={current.id + idx}
              src={current.url}
              alt={current.prompt}
              className="h-[70vh] w-full rounded-2xl object-contain opacity-0 transition-opacity duration-[1200ms] ease-out"
              onLoad={(e) => (e.currentTarget.classList.remove('opacity-0'))}
            />
          ) : (
            <div className="h-[70vh] w-full rounded-2xl bg-white/5" />
          )}

          {/* Prompt overlay */}
          {current && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="font-playfair text-sm text-white/90">{current.prompt}</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-xs">
          <div className="flex items-center gap-3 text-sm text-fg">
            <button
              className="rounded-lg border border-white/15 bg-white/10 px-3 py-1 hover:bg-white/15"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
            <div className="flex items-center gap-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  className={`rounded-lg px-2 py-1 ${s === speed ? 'bg-white/20' : 'border border-white/15 bg-white/10 hover:bg-white/15'}`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}


