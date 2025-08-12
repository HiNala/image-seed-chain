"use client"
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useEffect, useRef, useState } from 'react'
import type { SeedMeta } from '@/types'

export function SeedCard({
  meta,
  justUpdated = false,
  generating = false,
  seedUrl
}: {
  meta: SeedMeta
  justUpdated?: boolean
  generating?: boolean
  seedUrl?: string | null
}) {
  const [baseUrl, setBaseUrl] = useState<string | undefined>(meta.url || seedUrl || undefined)
  const [revealUrl, setRevealUrl] = useState<string | undefined>(undefined)
  const [revealing, setRevealing] = useState(false)
  const prevUrlRef = useRef<string | undefined>(meta.url)

  // When generation starts, lock baseUrl to the seed
  useEffect(() => {
    if (generating) {
      setBaseUrl((prev) => (seedUrl ? seedUrl : prev))
      setRevealUrl(undefined)
      setRevealing(false)
    }
  }, [generating, seedUrl])

  // When new image arrives, crossfade reveal
  useEffect(() => {
    if (prevUrlRef.current !== meta.url && meta.url) {
      // New image ready
      setRevealUrl(meta.url)
      setRevealing(true)
      const t = setTimeout(() => {
        setBaseUrl(meta.url)
        setRevealUrl(undefined)
        setRevealing(false)
      }, 2500)
      prevUrlRef.current = meta.url
      return () => clearTimeout(t)
    }
  }, [meta.url])

  const showGeneratingOverlay = generating || revealing

  return (
    <Card className="p-4">
      <div className="relative h-[45vh] w-full overflow-hidden rounded-xl bg-black/5">
        {/* Base image (seed or last) */}
        {baseUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={baseUrl}
            alt={meta.prompt}
            className="h-full w-full object-cover transition-[filter,opacity] duration-[2500ms] ease-out"
            style={{ filter: showGeneratingOverlay ? 'blur(8px)' : 'blur(0px)', opacity: showGeneratingOverlay ? 0.4 : 1 }}
          />
        ) : (
          <Skeleton className="h-full w-full" />
        )}

        {/* New image crossfade */}
        {revealUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={revealUrl}
            alt={meta.prompt}
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[2500ms] ease-out"
            onLoad={(e) => {
              ;(e.currentTarget as HTMLImageElement).classList.remove('opacity-0')
            }}
          />
        )}

        {/* Cinematic overlays during generation/reveal */}
        {showGeneratingOverlay && (
          <>
            {/* Shimmer sweep */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -inset-y-8 -left-1/3 h-[200%] w-1/2 -rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.8s_ease_infinite]" />
            </div>
            {/* Noise grain */}
            <div className="pointer-events-none absolute inset-0 opacity-10" style={{
              backgroundImage:
                "url(data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>)"
            }} />
            {/* Generating text */}
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-full bg-black/30 px-3 py-1 text-sm text-white font-playfair">Generating…</div>
            </div>
            {/* Live dot */}
            <span className="absolute right-2 top-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          </>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
        <div className="flex min-w-0 items-center gap-3">
          <span className={"inline-flex h-2 w-2 rounded-full bg-emerald-400 " + (justUpdated ? 'animate-ping' : 'animate-pulse')} />
          <span className="truncate">{meta.prompt || 'Loading…'}</span>
          {typeof meta.remainingGenerations === 'number' && meta.remainingGenerations > 0 && (
            <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-fg/90">
              {meta.remainingGenerations} left
            </span>
          )}
          {typeof meta.queue === 'number' && meta.queue > 0 && (
            <span
              title={meta.etaMs ? `ETA ~${Math.round(meta.etaMs / 1000)}s` : `Estimated ~${meta.queue * 12}s`}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] text-fg/90"
            >
              queued {meta.queue} {meta.etaMs ? `• ~${Math.round(meta.etaMs / 1000)}s` : `• ~${meta.queue * 12}s`}
            </span>
          )}
        </div>
        <time suppressHydrationWarning className="tabular-nums opacity-70" dateTime={meta.createdAt}>
          {new Date(meta.createdAt).toLocaleString()}
        </time>
      </div>

      {/* small actions */}
      {meta?.url && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <button
            className="ui-press rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-fg/90 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/15 hover:border-white/30 transition-all"
            onClick={() => navigator.clipboard.writeText(location.origin + '/f/' + meta.id)}
          >
            📋 Copy link
          </button>
          <a
            href={meta.url}
            download
            className="ui-press rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-fg/90 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/15 hover:border-white/30 transition-all"
          >
            💾 Download
          </a>
        </div>
      )}
      {/* Removed duplicate prompt line to reduce visual clutter while scrolling */}
    </Card>
  )
}


