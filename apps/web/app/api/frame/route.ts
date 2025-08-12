import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/http'
import { getById } from '@/lib/blob'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id') || ''
  if (!id) return err('BAD_REQUEST', 'Missing id', 400)
  const meta = await getById(id)
  if (!meta) return err('BAD_REQUEST', 'Not found', 404)
  return ok(meta)
}


