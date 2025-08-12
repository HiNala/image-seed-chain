import { setCurrent } from '@/lib/blob'
import { ok, err } from '@/lib/http'
import type { SeedMeta } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    // Reset to a clean genesis state
    const freshSeed: SeedMeta = {
      id: `genesis-${Date.now()}`,
      url: '',
      prompt: 'Fresh start! Describe your first creation...',
      createdAt: new Date().toISOString(),
      remainingGenerations: 0
    }
    
    await setCurrent(freshSeed)
    
    return ok({ 
      message: 'Game reset successfully',
      seed: freshSeed
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Reset failed'
    return err('INTERNAL', message, 500)
  }
}
