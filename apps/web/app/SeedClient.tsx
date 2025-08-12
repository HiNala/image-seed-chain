"use client"
import { SeedCard } from '@/components/SeedCard'
import { PromptBar } from '@/components/PromptBar'
import { HistoryStrip } from '@/components/HistoryStrip'
import { useCurrent } from '@/lib/hooks'
import toast from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'
import { TimelapseModal } from '@/components/TimelapseModal'
import { useSound } from '@/components/SoundProvider'
import type { SeedMeta } from '@/types'

export default function SeedClient({ initial }: { initial: SeedMeta }) {
  const { data, mutate } = useCurrent()
  const [notice, setNotice] = useState<null | { prev: SeedMeta; next: SeedMeta }>(null)
  const lastIdRef = useRef<string | null>(null)
  const lastStableSeedUrlRef = useRef<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [timelapseOpen, setTimelapseOpen] = useState(false)
  const { playStart, playComplete } = useSound()
  const [overrideSeedUrl, setOverrideSeedUrl] = useState<string | null>(null)

  function abToBase64(ab: ArrayBuffer): string {
    const bytes = new Uint8Array(ab)
    let binary = ''
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
    // btoa handles binary -> base64 on web
    return btoa(binary)
  }

  useEffect(() => {
    if (!data) return
    if (!lastIdRef.current) {
      lastIdRef.current = data.id
      lastStableSeedUrlRef.current = data.url
      return
    }
    if (data.id !== lastIdRef.current) {
      setNotice({ prev: { ...(initial as SeedMeta), id: lastIdRef.current, url: lastStableSeedUrlRef.current || '' }, next: data })
      lastIdRef.current = data.id
      lastStableSeedUrlRef.current = data.url
    }
  }, [data, initial])

  async function onGenerate({ prompt, file, generationsLock, overrideSeedUrl: fromCaller, size }: { prompt: string; file?: File | null; generationsLock?: number; overrideSeedUrl?: string; size?: '1024x1024' | '1792x1024' | '1024x1792' }) {
    try {
      // optimistic: show generating state
      setIsGenerating(true)
      playStart()
      mutate({ ...(data || initial) }, { revalidate: false })

      let chosenOverride: string | undefined = fromCaller ?? overrideSeedUrl ?? undefined
      if (file && !chosenOverride) {
        const ab = await file.arrayBuffer()
        const b64 = abToBase64(ab)
        chosenOverride = `data:${file.type};base64,${b64}`
      }
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, overrideSeedUrl: chosenOverride, generationsLock, size })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        const errorMessage = j?.error || `Generation failed (${res.status})`
        throw new Error(errorMessage)
      }
      const next = (await res.json()) as SeedMeta & { queue?: number; etaMs?: number }
      mutate(next, { revalidate: false })
      toast.success('Evolved the seed ✨')
      playComplete()
      setOverrideSeedUrl(null)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Generation failed'
      toast.error(message)
      mutate(data || initial, { revalidate: true })
    }
    finally {
      setIsGenerating(false)
    }
  }

  const meta = data || initial

  return (
    <div className="mx-auto grid h-full grid-rows-[1fr_auto_auto] gap-2 sm:gap-3">
      {notice && (
        <div className="mb-3 rounded-xl border border-amber-300/30 bg-amber-200/10 px-3 py-2 text-sm text-amber-100">
          Seed updated by someone else — continue with your seed or switch?
          <div className="mt-2 flex gap-2">
            <button
              className="ui-press rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/15 transition-all"
              onClick={() => {
                // Continue with previous seed via override
                setNotice(null)
                setOverrideSeedUrl(lastStableSeedUrlRef.current)
              }}
            >
              Continue
            </button>
            <button
              className="ui-press rounded-lg border border-haze-500/50 bg-haze-600 px-3 py-1.5 text-xs text-white backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-haze-500 transition-all"
              onClick={() => {
                setNotice(null)
                mutate(notice.next, { revalidate: false })
                setOverrideSeedUrl(null)
              }}
            >
              Switch
            </button>
          </div>
        </div>
      )}
      <SeedCard meta={meta} justUpdated={Boolean(notice)} generating={isGenerating} seedUrl={lastStableSeedUrlRef.current} />
      <div className="min-h-0">
        <HistoryStrip onUseAsSeed={(url) => {
          setOverrideSeedUrl(url)
          toast.success('Using selected frame as seed')
        }} />
      </div>
      <PromptBar
        sticky={true}
        remainingLeft={meta.remainingGenerations}
        externalOverrideUrl={overrideSeedUrl}
        onClearExternalOverride={() => setOverrideSeedUrl(null)}
        onGenerate={onGenerate}
      />
      <TimelapseModal open={timelapseOpen} onClose={() => setTimelapseOpen(false)} />
    </div>
  )
}


