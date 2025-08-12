"use client"
import { useState } from 'react'
import toast from 'react-hot-toast'
// import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Suggestions } from '@/components/Suggestions'

export function PromptBar({ onGenerate, sticky = true, remainingLeft, externalOverrideUrl, onClearExternalOverride }: { onGenerate: (p: { prompt: string; file?: File | null; generationsLock?: number; overrideSeedUrl?: string; size?: '1024x1024' | '1792x1024' | '1024x1792' }) => Promise<void>; sticky?: boolean; remainingLeft?: number; externalOverrideUrl?: string | null; onClearExternalOverride?: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lock, setLock] = useState<number>(0)
  const [size, setSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024')

  async function submit() {
    if (!prompt.trim() || loading) return
    setLoading(true)
    try {
      await onGenerate({ prompt: prompt.trim(), file, generationsLock: lock || 0, overrideSeedUrl: (uploadedUrl || externalOverrideUrl) || undefined, size })
      setPrompt('')
      setFile(null)
      setUploadedUrl(null)
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f && ['image/png', 'image/jpeg'].includes(f.type) && f.size <= 4 * 1024 * 1024) setFile(f)
  }

  return (
    <div
      className={(sticky ? 'sticky bottom-4 ' : '') + 'mx-auto max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl shadow-ambient'}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      aria-live="polite"
    >
      <div className="space-y-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
        
        {/* size chips */}
        <div className="flex items-center gap-2 text-xs text-white/90">
          <span className="font-medium">Size:</span>
          {(['1024x1024','1792x1024','1024x1792'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`ui-press rounded-full border px-3 py-1.5 backdrop-blur-lg transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] ${size===s? 'border-white/40 bg-white/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]' : 'border-white/20 bg-white/8 text-white/80 hover:bg-white/15 hover:border-white/30'}`}
              onClick={() => setSize(s)}
            >
              {s === '1024x1024' ? 'Square' : s === '1792x1024' ? 'Wide' : 'Tall'}
            </button>
          ))}
        </div>
        
        <Textarea
          className="w-full text-base"
          placeholder="Describe the next evolution in detail…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
              return
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
          }}
          rows={3}
        />
        
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-white/90 font-medium">
              Lock:
              <input
                type="number"
                min={0}
                max={100}
                value={lock}
                onChange={(e) => setLock(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="w-20 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] focus:border-white/40 focus:bg-white/15 transition-all"
                title="Number of generations before the seed can be reset (0-100)"
              />
            </label>
            <label className="ui-press inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-white/90 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/15 hover:border-white/30 transition-all font-medium" aria-label="Upload custom seed image">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0] ?? null
                  setFile(f)
                  setUploadedUrl(null)
                  if (f) {
                    if (!['image/png', 'image/jpeg'].includes(f.type)) {
                      toast.error('Only PNG or JPEG allowed')
                      return
                    }
                    if (f.size > 4 * 1024 * 1024) {
                      toast.error('Max file size is 4MB')
                      return
                    }
                    const fd = new FormData()
                    fd.append('file', f)
                    try {
                      const res = await fetch('/api/upload-seed', { method: 'POST', body: fd })
                      if (!res.ok) throw new Error('Upload failed')
                      const { url } = await res.json()
                      setUploadedUrl(url)
                      toast.success('Seed uploaded')
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : 'Upload failed'
                      toast.error(message)
                    }
                  }
                }}
              />
              📎 Upload Seed
            </label>
          </div>
          <Button 
            onClick={submit} 
            disabled={loading || (!!remainingLeft && remainingLeft <= 0 && (lock || 0) <= 0)} 
            loading={loading} 
            title={!!remainingLeft && remainingLeft <= 0 && (lock || 0) <= 0 ? 'Set Lock > 0 to start a new run' : undefined}
            className="px-6 py-3 text-base font-semibold"
          >
            ✨ Evolve
          </Button>
        </div>
      </div>
      {(uploadedUrl || externalOverrideUrl) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={uploadedUrl || externalOverrideUrl || ''} alt="seed preview" className="h-6 w-6 rounded object-cover" />
          Using seed
          {(onClearExternalOverride || uploadedUrl) && (
            <button className="rounded border border-white/20 px-2 py-0.5 hover:bg-white/10" onClick={() => {
              if (onClearExternalOverride) onClearExternalOverride()
              setUploadedUrl(null)
            }}>Clear</button>
          )}
        </div>
      )}
      {!!remainingLeft && remainingLeft <= 0 && (lock || 0) <= 0 && (
        <div className="mt-2 text-xs text-amber-200/90">Seed is free. Set a Lock (1–100) to begin a new sequence.</div>
      )}
      <Suggestions
        base={prompt}
        onPick={(v) => {
          setPrompt(v)
          // focus stays on textarea if needed (browser keeps focus)
        }}
      />
    </div>
  )
}


