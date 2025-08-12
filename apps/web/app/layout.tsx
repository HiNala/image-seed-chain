import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SoundProvider } from '@/components/SoundProvider'
import Providers from './Providers'
import { SoundToggle } from '@/components/SoundToggle'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'SeedChain',
  description: 'A single, living image everyone co-creates.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'SeedChain',
    description: 'A single, living image everyone co-creates.',
    images: [
      {
        url: '/api/current',
        width: 1200,
        height: 630,
        alt: 'SeedChain current seed'
      }
    ]
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} text-fg antialiased`}>
        <SoundProvider>
          <Providers>
            <div className="mx-auto w-full max-w-7xl px-4 py-3">
              <Header />
              <main className="mt-4">{children}</main>
            </div>
          </Providers>
          <Toaster position="top-center" />
        </SoundProvider>
      </body>
    </html>
  )
}

function Header() {
  return (
    <div className="relative flex items-center justify-between rounded-2xl border border-border bg-card/80 px-4 py-2 backdrop-blur-2xl shadow-soft">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-haze-600 text-xs font-bold text-white">⚡</span>
        <span className="font-semibold tracking-wide">SeedChain</span>
      </div>
      <HeaderActions />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/30 via-white/50 to-white/30" />
    </div>
  )
}

function HeaderActions() {
  return <HeaderActionsClient />
}

// Client wrapper for sound toggle
function HeaderActionsClient() {
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-px rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        <a href="#history" className="ui-press rounded-lg px-3 py-1.5 text-sm text-fg/85 transition-all hover:bg-white/15 hover:text-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          History
        </a>
        <a href="#timelapse" className="ui-press rounded-lg px-3 py-1.5 text-sm text-fg/85 transition-all hover:bg-white/15 hover:text-fg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          Timelapse
        </a>
      </div>
      <SoundToggle />
    </div>
  )
}

// SoundToggle imported as client component
