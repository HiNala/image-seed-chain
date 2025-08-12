import { getById } from '@/lib/blob'
import type { Metadata, PageProps, ResolvingMetadata } from 'next'

type Params = { id: string }

export default async function FramePage({ params }: PageProps<Params>) {
  const meta = await getById(params.id)
  if (!meta) return <div className="p-6 text-fg">Not found</div>
  return (
    <main className="mx-auto max-w-3xl p-4">
      <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.url} alt={meta.prompt} className="w-full rounded-xl object-contain" />
        <div className="mt-3 flex items-center justify-between text-sm text-muted">
          <span className="truncate">{meta.prompt}</span>
          <time suppressHydrationWarning className="tabular-nums opacity-70" dateTime={meta.createdAt}>
            {new Date(meta.createdAt).toLocaleString()}
          </time>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata(
  { params }: PageProps<Params>,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const m = await getById(params.id)
  if (!m) return {
    title: 'SeedChain frame',
    description: 'Frame not found'
  }
  return {
    title: 'SeedChain frame',
    description: m.prompt,
    openGraph: {
      images: [{ url: m.url, width: 1200, height: 630, alt: 'SeedChain frame' }]
    }
  }
}


