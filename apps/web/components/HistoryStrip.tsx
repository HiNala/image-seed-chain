"use client"
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { Tooltip } from '@/components/ui/Tooltip'
import { jsonFetcher } from '@/lib/fetcher'
import useSWR from 'swr'
import type { SeedMeta } from '@/types'
import { HistoryModal } from './HistoryModal'

type Page = { items: SeedMeta[]; nextCursor: string | null }

type Props = {
  onUseAsSeed?: (url: string) => void
}

export function HistoryStrip({ onUseAsSeed }: Props) {
  const [cursor, setCursor] = useState<string | null>(null)
  const [all, setAll] = useState<SeedMeta[] | null>(null)
  const { data } = useSWR<Page>(`/api/history?limit=20${cursor ? `&cursor=${cursor}` : ''}`, jsonFetcher, {
    refreshInterval: 5000
  })
  const items = all ?? data?.items ?? new Array(8).fill(null)
  const [selected, setSelected] = useState<SeedMeta | null>(null)
  const [open, setOpen] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (loadingMore) setLoadingMore(false)
  }, [data])

  const onUseSeed = (url: string) => {
    if (onUseAsSeed) {
      onUseAsSeed(url)
    } else {
      // fallback: copy to clipboard
      navigator.clipboard.writeText(url)
    }
    setOpen(false)
  }

  return (
    <div className="mt-2 h-full">
      <div className="h-full overflow-x-auto">
        <div className="flex snap-x snap-mandatory gap-3">
          {items.map((m: SeedMeta | null, idx: number) => (
            <div key={m?.id ?? idx} className="w-24 shrink-0 snap-start">
              {m ? (
                <Tooltip content={m.prompt}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt={m.prompt}
                    className="aspect-square w-full cursor-pointer rounded-lg object-cover opacity-80 transition duration-150 ease-in-out hover:opacity-100 hover:scale-[1.02] hover:shadow-ambient"
                    loading="lazy"
                    decoding="async"
                    onClick={() => {
                      setSelected(m)
                      setOpen(true)
                    }}
                  />
                </Tooltip>
              ) : (
                <Skeleton className="aspect-square w-full rounded-lg" />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center">
        {items && items.length === 0 && (
          <div className="text-xs text-white/60">No history yet</div>
        )}
        {data?.nextCursor !== null && (
          <button
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-sm text-fg hover:bg-white/15 disabled:opacity-60"
            disabled={loadingMore}
            onClick={() => {
              // accumulate pages
              const next = (all ?? []).concat(data?.items ?? [])
              setAll(next.slice(-200))
              setCursor(data?.nextCursor || null)
              setLoadingMore(true)
            }}
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
      <HistoryModal open={open} item={selected} onClose={() => setOpen(false)} onUseSeed={onUseSeed} />
    </div>
  )
}


