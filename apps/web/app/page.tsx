"use client"
import type { SeedMeta } from '@/types'
import SeedClient from './SeedClient'

export default function Home() {
  const initial: SeedMeta = {
    id: 'bootstrap',
    url: '',
    prompt: 'Loading current seed…',
    createdAt: new Date().toISOString()
  }
  return (
    <div className="mx-auto grid h-[calc(100dvh-8rem)] w-full max-w-6xl grid-cols-1 gap-4 px-2 sm:grid-cols-[1.3fr_0.7fr] sm:px-4">
      <div className="order-2 overflow-hidden sm:order-1">
        <SeedClient initial={initial} />
      </div>
      <aside className="order-1 sm:order-2">
        <RightNav />
      </aside>
    </div>
  )
}

function RightNav() {
  return (
    <div className="sticky top-4 space-y-3">
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-2xl shadow-ambient">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
        <h2 className="mb-3 font-playfair text-lg text-fg">Navigation</h2>
        <nav className="flex flex-col gap-2 text-sm text-fg/90">
          <a href="#history" className="ui-press rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg transition-all hover:bg-white/15 hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            History
          </a>
          <a href="#timelapse" className="ui-press rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg transition-all hover:bg-white/15 hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            Timelapse
          </a>
          <a href="#about" className="ui-press rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-lg transition-all hover:bg-white/15 hover:border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            About
          </a>
        </nav>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-2xl shadow-ambient">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/60 to-white/30" />
        <h3 className="mb-3 font-playfair text-lg text-fg">Game Control</h3>
        <p className="text-sm text-muted mb-3">Start fresh or continue evolving.</p>
        <button
          onClick={async () => {
            if (confirm('Reset the game and start fresh? This will clear the current seed.')) {
              try {
                const response = await fetch('/api/reset', { method: 'POST' })
                if (response.ok) {
                  window.location.reload()
                } else {
                  alert('Failed to reset game')
                }
              } catch {
                alert('Error resetting game')
              }
            }
          }}
          className="ui-press w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-white/15 hover:border-white/30 transition-all"
        >
          🔄 Reset Game
        </button>
      </div>
    </div>
  )
}
