import { list, put } from '@vercel/blob'
import type { SeedMeta } from '@/types'
import fs from 'node:fs/promises'
import path from 'node:path'

const CURRENT_PATH = 'seed/current.json'
const HISTORY_DIR = 'seed/history'
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const useLocal = process.env.NODE_ENV === 'development' && !process.env.BLOB_READ_WRITE_TOKEN

export async function getCurrent(): Promise<SeedMeta | null> {
  try {
    if (useLocal) {
      const curFile = path.join(PUBLIC_DIR, CURRENT_PATH)
      try {
        const raw = await fs.readFile(curFile, 'utf8')
        return JSON.parse(raw) as SeedMeta
      } catch {
        return await bootstrapGenesis(true)
      }
    }
    const { blobs } = await list({ prefix: 'seed/' })
    const current = blobs.find((b) => b.pathname === CURRENT_PATH)
    if (!current) return await bootstrapGenesis(false)
    const res = await fetch(current.url, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as SeedMeta
  } catch {
    return {
      id: 'local-fallback',
      url: tinyPngDataUrl,
      prompt: 'Genesis seed',
      createdAt: new Date().toISOString()
    }
  }
}

export async function setCurrent(meta: SeedMeta): Promise<void> {
  if (useLocal) {
    const curFile = path.join(PUBLIC_DIR, CURRENT_PATH)
    await fs.mkdir(path.dirname(curFile), { recursive: true })
    await fs.writeFile(curFile, JSON.stringify(meta, null, 2), 'utf8')
    return
  }
  await put(CURRENT_PATH, JSON.stringify(meta, null, 2), { access: 'public', contentType: 'application/json' })
}

export async function savePng(bytes: Buffer): Promise<{ url: string; path: string }> {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const imagePath = `${HISTORY_DIR}/${ts}_${id}.png`
  if (useLocal) {
    const fileAbs = path.join(PUBLIC_DIR, imagePath)
    await fs.mkdir(path.dirname(fileAbs), { recursive: true })
    await fs.writeFile(fileAbs, bytes)
    return { url: '/' + imagePath, path: imagePath }
  }
  const { url } = await put(imagePath, bytes, { access: 'public', contentType: 'image/png' })
  return { url, path: imagePath }
}

export async function saveCurrentPNG(bytes: Buffer, meta: { prompt: string; authorHint?: string }): Promise<SeedMeta> {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const imagePath = `${HISTORY_DIR}/${ts}_${id}.png`

  let url: string
  if (useLocal) {
    const fileAbs = path.join(PUBLIC_DIR, imagePath)
    await fs.mkdir(path.dirname(fileAbs), { recursive: true })
    await fs.writeFile(fileAbs, bytes)
    url = '/' + imagePath
  } else {
    const resp = await put(imagePath, bytes, { access: 'public', contentType: 'image/png' })
    url = resp.url
  }

  const record: SeedMeta = {
    id,
    url,
    prompt: meta.prompt,
    createdAt: new Date().toISOString()
  }

  // Save sidecar history JSON for easy listing
  if (useLocal) {
    const sidecar = path.join(PUBLIC_DIR, `${HISTORY_DIR}/${ts}_${id}.json`)
    await fs.writeFile(sidecar, JSON.stringify(record, null, 2), 'utf8')
  } else {
    await put(`${HISTORY_DIR}/${ts}_${id}.json`, JSON.stringify(record, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })
  }

  await setCurrent(record)

  return record
}

export async function listHistory(limit = 50): Promise<SeedMeta[]> {
  if (useLocal) {
    try {
      const dir = path.join(PUBLIC_DIR, HISTORY_DIR)
      const files = await fs.readdir(dir).catch(() => [])
      const jsons = files.filter((f) => f.endsWith('.json')).sort().reverse()
      const slice = jsons.slice(0, Math.max(1, Math.min(limit, 200)))
      const metas: SeedMeta[] = []
      for (const file of slice) {
        const raw = await fs.readFile(path.join(dir, file), 'utf8').catch(() => '{}')
        metas.push(JSON.parse(raw))
      }
      return metas
    } catch {
      return []
    }
  }
  const { blobs } = await list({ prefix: HISTORY_DIR + '/', limit: 1000 })
  const jsons = blobs.filter((b) => b.pathname.endsWith('.json'))
  jsons.sort((a, b) => (a.pathname < b.pathname ? 1 : -1))
  const slice = jsons.slice(0, Math.max(1, Math.min(limit, 200)))
  const metas = await Promise.all(slice.map(async (b) => (await (await fetch(b.url, { cache: 'no-store' })).json()) as SeedMeta))
  return metas
}

export async function listHistoryCursor(limit = 20, cursor?: string | null): Promise<{ items: SeedMeta[]; nextCursor: string | null }> {
  const capped = Math.max(1, Math.min(limit, 200))
  if (useLocal) {
    const dir = path.join(PUBLIC_DIR, HISTORY_DIR)
    const files = await fs.readdir(dir).catch(() => [])
    const all = files.filter((f) => f.endsWith('.json')).sort().reverse() // newest first
    const startIdx = cursor ? all.findIndex((f) => f.includes(cursor)) + 1 : 0
    const chosen = all.slice(startIdx, startIdx + capped)
    const items: SeedMeta[] = []
    for (const file of chosen) {
      const raw = await fs.readFile(path.join(dir, file), 'utf8').catch(() => '{}')
      items.push(JSON.parse(raw))
    }
    const nextCursor = startIdx + capped < all.length ? chosen[chosen.length - 1]?.replace('.json', '').split('_').pop() || null : null
    return { items, nextCursor }
  }
  const { blobs } = await list({ prefix: HISTORY_DIR + '/', limit: 1000 })
  const all = blobs.filter((b) => b.pathname.endsWith('.json')).sort((a, b) => (a.pathname < b.pathname ? 1 : -1))
  const startIdx = cursor ? all.findIndex((b) => b.pathname.includes(cursor)) + 1 : 0
  const chosen = all.slice(startIdx, startIdx + capped)
  const items = await Promise.all(chosen.map(async (b) => (await (await fetch(b.url, { cache: 'no-store' })).json()) as SeedMeta))
  const nextCursor = startIdx + capped < all.length ? chosen[chosen.length - 1]?.pathname.replace('.json', '').split('_').pop() || null : null
  return { items, nextCursor }
}

export async function getById(id: string): Promise<SeedMeta | null> {
  if (!id) return null
  if (useLocal) {
    try {
      const dir = path.join(PUBLIC_DIR, HISTORY_DIR)
      const files = await fs.readdir(dir).catch(() => [])
      const match = files.find((f) => f.endsWith(`${id}.json`))
      if (!match) return null
      const raw = await fs.readFile(path.join(dir, match), 'utf8')
      return JSON.parse(raw) as SeedMeta
    } catch {
      return null
    }
  }
  try {
    const { blobs } = await list({ prefix: HISTORY_DIR + '/', limit: 1000 })
    const json = blobs.find((b) => b.pathname.endsWith(`${id}.json`))
    if (!json) return null
    const r = await fetch(json.url, { cache: 'no-store' })
    return (await r.json()) as SeedMeta
  } catch {
    return null
  }
}

export async function saveUpload(bytes: Buffer, originalName = 'seed.png'): Promise<{ url: string; path: string }> {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const safe = originalName.toLowerCase().replace(/[^a-z0-9_.-]/g, '') || 'seed.png'
  const uploadPath = `seed/uploads/${ts}_${safe}`
  if (useLocal) {
    const fileAbs = path.join(PUBLIC_DIR, uploadPath)
    await fs.mkdir(path.dirname(fileAbs), { recursive: true })
    await fs.writeFile(fileAbs, bytes)
    return { url: '/' + uploadPath, path: uploadPath }
  }
  const { url } = await put(uploadPath, bytes, { access: 'public', contentType: 'image/png' })
  return { url, path: uploadPath }
}

// --- internal
const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAH+wK3u7e3iQAAAABJRU5ErkJggg=='
const tinyPngDataUrl = `data:image/png;base64,${tinyPngBase64}`

async function bootstrapGenesis(_localPreferred: boolean): Promise<SeedMeta | null> {
  try {
    const bytes = Buffer.from(tinyPngBase64, 'base64')
    const { url, path: imagePath } = await savePng(bytes)
    const record: SeedMeta = {
      id: imagePath.split('_').pop()?.replace('.png', '') || 'genesis',
      url,
      prompt: 'Genesis seed',
      createdAt: new Date().toISOString(),
      remainingGenerations: 0
    }
    await setCurrent(record)
    // also drop sidecar json for history
    if (useLocal) {
      const sidecar = path.join(PUBLIC_DIR, imagePath.replace('.png', '.json'))
      await fs.writeFile(sidecar, JSON.stringify(record, null, 2), 'utf8')
    } else {
      const tsId = imagePath.replace('.png', '.json')
      await put(tsId, JSON.stringify(record, null, 2), { access: 'public', contentType: 'application/json' })
    }
    return record
  } catch {
    return null
  }
}


