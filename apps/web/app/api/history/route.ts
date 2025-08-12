import { NextRequest } from 'next/server'
import { listHistory, listHistoryCursor } from '@/lib/blob'
import { ok, err } from '@/lib/http'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Number(searchParams.get('limit') ?? '50')
  const cursor = searchParams.get('cursor')
  if (!Number.isFinite(limit) || limit <= 0) return err('BAD_REQUEST', 'Invalid limit', 400)
  try {
    if (cursor) {
      const page = await listHistoryCursor(Math.min(200, limit), cursor)
      return ok(page)
    }
    const items = await listHistory(Math.min(200, limit))
    return ok({ items, nextCursor: null })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return err('INTERNAL', message, 500)
  }
}


