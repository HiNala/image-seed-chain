import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { getCurrent, savePng, setCurrent } from '@/lib/blob'
import { ok, err } from '@/lib/http'
import { z } from 'zod'
import { isRateLimited } from './ratelimit'
import type { SeedMeta } from '@/types'
import { put } from '@vercel/blob'
import { enqueue, getPendingCount, estimateEtaMs } from '@/lib/queue'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  prompt: z.string().min(1).max(400),
  overrideSeedUrl: z.string().min(1).optional(),
  generationsLock: z.coerce.number().int().min(0).max(100).optional(),
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional()
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) return err('RATE_LIMITED', 'Please wait before generating again', 429)

    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) return err('BAD_REQUEST', 'Invalid request body', 400)
    const { prompt, overrideSeedUrl, generationsLock, size } = parsed.data
    if (isDisallowed(prompt)) return err('BAD_REQUEST', 'Prompt contains disallowed content', 400)
    
    // Better validation for empty prompts
    if (!prompt.trim()) return err('BAD_REQUEST', 'Prompt cannot be empty', 400)

    let seedUrl = overrideSeedUrl
    const currentBefore = await getCurrent()
    if (!seedUrl) {
      seedUrl = currentBefore?.url
    }

    // Enforce lock server-side: if remainingGenerations is 0, require a new generationsLock to start a run
    if (
      typeof currentBefore?.remainingGenerations === 'number' &&
      currentBefore.remainingGenerations <= 0 &&
      !(typeof generationsLock === 'number' && generationsLock > 0)
    ) {
      return err('BAD_REQUEST', 'Seed is free; set generationsLock (1–100) to start a new run', 400)
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const withTimeout = async <T,>(promise: Promise<T>, ms = 60_000): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Generation timed out')), ms))
      ])
    }

    const attempt = async (): Promise<Buffer> => {
      // Try image-to-image when a seed is available
      if (seedUrl) {
        try {
          const seedBuffer = await getSeedBuffer(seedUrl)
          const uploadable = new File([seedBuffer], 'seed.png', { type: 'image/png' })
          const edit = await withTimeout(openai.images.edit({
            model: 'dall-e-2',
            prompt,
            image: uploadable,
            size: '1024x1024' as const
          }))
          const b64 = edit.data?.[0]?.b64_json
          if (b64) return Buffer.from(b64, 'base64')
        } catch {
          // ignore and fall through to text-to-image
        }
      }
      const gen = await withTimeout(openai.images.generate({ model: 'dall-e-3', prompt, size: (size || '1024x1024') as '1024x1024' | '1792x1024' | '1024x1792' }))
      const b64 = gen.data?.[0]?.b64_json
      if (!b64) throw new Error('No image returned')
      return Buffer.from(b64, 'base64')
    }

    const pngBuffer = await enqueue(() => runWithRetry(attempt, 1))

    // Save PNG and set current
    const { url, path } = await savePng(pngBuffer)
    const id = path.split('_').pop()?.replace('.png', '') || cryptoRandomId()
    // Apply lock: when set (>0), the seed cannot be reset until remainingGenerations hits 0
    const currentPrev = currentBefore
    let remainingGenerations = currentPrev?.remainingGenerations
    if (typeof remainingGenerations === 'number' && remainingGenerations > 0) {
      // continuing run: decrement
      remainingGenerations = Math.max(0, remainingGenerations - 1)
    } else if (typeof generationsLock === 'number' && generationsLock > 0) {
      // starting new run: count the current generation as the first; set to lock-1
      remainingGenerations = Math.max(0, generationsLock - 1)
    } else {
      remainingGenerations = 0
    }

    const meta: SeedMeta = { id, url, prompt, createdAt: new Date().toISOString(), remainingGenerations }
    await setCurrent(meta)
    // save sidecar for history listing
    await put(path.replace('.png', '.json'), JSON.stringify(meta, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    return ok({ ...meta, queue: getPendingCount(), etaMs: estimateEtaMs() })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return err('INTERNAL', message, 500)
  }
}

function cryptoRandomId(): string {
  const g = globalThis as { crypto?: { randomUUID?: () => string } }
  return g.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
}

async function getSeedBuffer(url: string): Promise<ArrayBuffer> {
  if (url.startsWith('data:')) {
    const [, data] = url.split(',')
    return Uint8Array.from(Buffer.from(data, 'base64')).buffer
  }
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 15_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('Failed to fetch seed image')
    return await res.arrayBuffer()
  } finally {
    clearTimeout(t)
  }
}

async function runWithRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (retries > 0) return runWithRetry(fn, retries - 1)
    throw e
  }
}

function isDisallowed(prompt: string): boolean {
  const banned = ['nsfw', 'gore', 'hate', 'abuse']
  const lower = prompt.toLowerCase()
  return banned.some((w) => lower.includes(w))
}


