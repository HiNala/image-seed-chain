let pending = 0
let chain: Promise<unknown> = Promise.resolve()
let avgDurationMs = 12000 // start with a sane default ~12s

export function getPendingCount(): number {
  return pending
}

export function getAverageDurationMs(): number {
  return avgDurationMs
}

export function estimateEtaMs(): number {
  // rough: pending * avgDuration
  return Math.max(0, pending - 1) * avgDurationMs
}

export function enqueue<T>(task: () => Promise<T>): Promise<T> {
  pending += 1
  const startedAt = Date.now()
  const run = async () => {
    try {
      return await task()
    } finally {
      const dur = Date.now() - startedAt
      // exponential moving average toward observed duration
      avgDurationMs = Math.round(avgDurationMs * 0.7 + dur * 0.3)
      pending -= 1
    }
  }
  const next = chain.then(run, run)
  chain = next.then(() => undefined, () => undefined)
  return next as Promise<T>
}


