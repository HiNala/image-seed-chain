import { ok } from '@/lib/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  return ok({
    ok: true,
    env: process.env.VERCEL ? 'vercel' : 'local',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    time: new Date().toISOString()
  })
}



