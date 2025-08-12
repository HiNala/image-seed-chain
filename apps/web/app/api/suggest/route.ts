import { NextRequest } from 'next/server'
import { z } from 'zod'
import { ok, err } from '@/lib/http'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

const QuerySchema = z.object({
  prompt: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(8).optional()
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const parsed = QuerySchema.safeParse({
      prompt: searchParams.get('prompt') ?? undefined,
      limit: searchParams.get('limit') ?? undefined
    })
    if (!parsed.success) return err('BAD_REQUEST', 'Invalid query', 400)
    const { prompt = '', limit = 3 } = parsed.data

    const suggestions = await generateSuggestions(prompt, limit)
    return ok({ suggestions })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unexpected error'
    return err('INTERNAL', message, 500)
  }
}

async function generateSuggestions(base: string, limit: number): Promise<string[]> {
  const curated = curatedSuggestions(base, limit)

  // Try OpenAI if key is present
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const sys = 'You suggest short, evocative image prompts. Return exactly 3 suggestions, each under 80 characters, no numbering.'
      const user = `Base prompt: ${base || 'abstract soft shapes'}\nSuggest ${limit} creative evolutions.`
      const chat = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ],
        temperature: 0.8,
        max_tokens: 120
      })
      const text = chat.choices?.[0]?.message?.content || ''
      const lines = text
        .split('\n')
        .map((l) => l.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, limit)
      return lines.length ? lines : curated
    } catch {
      // ignore and fall back
    }
  }
  return curated
}

function curatedSuggestions(base: string, limit: number): string[] {
  const trims = base.trim()
  const seed = trims || 'soft gradient abstract composition'
  const styles = [
    'at golden hour, watercolor wash',
    'as minimalist line art, high-key background',
    'nocturne palette, moody cinematic lighting',
    'macro detail, shallow depth of field',
    'dreamlike haze, pastel tones',
    'bold chiaroscuro, dramatic contrast'
  ]
  const picks = styles.slice(0, Math.min(limit, styles.length))
  return picks.map((s) => `${seed}, ${s}`)
}


