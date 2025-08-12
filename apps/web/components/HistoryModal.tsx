"use client"
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { SeedMeta } from '@/types'

type Props = {
  open: boolean
  item: SeedMeta | null
  onClose: () => void
  onUseSeed: (url: string) => void
}

export function HistoryModal({ open, item, onClose, onUseSeed }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !item) return null

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <Card className="max-h-[90vh] w-full max-w-3xl overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="sm:w-2/3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt={item.prompt} className="w-full rounded-xl object-cover" />
          </div>
          <div className="sm:w-1/3 space-y-3">
            <div>
              <div className="text-sm text-muted">Created</div>
              <div className="text-sm">{new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Prompt</div>
              <div className="text-sm whitespace-pre-wrap break-words">{item.prompt}</div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(item.prompt)}>Copy Prompt</Button>
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(item.url)}>Copy Image URL</Button>
              <Button variant="ghost" onClick={() => navigator.clipboard.writeText(location.origin + '/f/' + item.id)}>Copy Link</Button>
              <Button onClick={() => onUseSeed(item.url)}>Use as Seed</Button>
              <a href={`/f/${item.id}`} target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/15">Open</a>
              <a href={item.url} download className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm hover:bg-white/15">Download</a>
            </div>
          </div>
        </div>
      </Card>
    </div>,
    document.body
  )
}


