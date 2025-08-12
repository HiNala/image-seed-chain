import { getCurrent } from '@/lib/blob'
import { ok } from '@/lib/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  const current = await getCurrent()
  return ok(
    current ?? {
      id: 'bootstrap',
      url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAH+wK3u7e3iQAAAABJRU5ErkJggg==',
      prompt: 'Genesis seed',
      createdAt: new Date().toISOString(),
      remainingGenerations: 0
    }
  )
}


