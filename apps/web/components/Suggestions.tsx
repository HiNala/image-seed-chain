"use client"
import useSWR from 'swr'
import { jsonFetcher } from '@/lib/fetcher'

export function Suggestions({ base, onPick }: { base: string; onPick: (v: string) => void }) {
  const { data } = useSWR<{ suggestions: string[] }>(`/api/suggest?prompt=${encodeURIComponent(base || '')}&limit=3`, jsonFetcher, {
    revalidateOnFocus: false
  })
  const list = data?.suggestions || []
  if (!list.length) return null
  return (
    <div className="mt-2 overflow-x-auto">
      <div className="flex gap-2">
        {list.map((s, i) => (
          <button
            key={i}
            className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-fg/90 transition duration-150 ease-in-out hover:bg-white/15 hover:-translate-y-[1px]"
            onClick={() => onPick(s)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}


