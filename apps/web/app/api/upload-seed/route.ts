import { NextRequest } from 'next/server'
import { err, ok } from '@/lib/http'
import { saveUpload } from '@/lib/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return err('BAD_REQUEST', 'Missing file', 400)
    if (!['image/png', 'image/jpeg'].includes(file.type)) return err('BAD_REQUEST', 'Invalid type', 400)
    if (file.size > 4 * 1024 * 1024) return err('BAD_REQUEST', 'File too large', 400)

    const array = await file.arrayBuffer()
    const bytes = Buffer.from(array)
    const { url } = await saveUpload(bytes, file.name)
    return ok({ url })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return err('INTERNAL', message, 500)
  }
}


