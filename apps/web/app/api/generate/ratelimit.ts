const WINDOW_MS = 10_000
const lastCallByIp = new Map<string, number>()

export function isRateLimited(ip: string | null | undefined): boolean {
  const key = ip || 'unknown'
  const now = Date.now()
  const last = lastCallByIp.get(key) || 0
  if (now - last < WINDOW_MS) {
    return true
  }
  lastCallByIp.set(key, now)
  return false
}


