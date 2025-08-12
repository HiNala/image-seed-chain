"use client"
import { SWRConfig } from 'swr'
import { useEffect, useState } from 'react'

function OfflineBanner() {
  const [online, setOnline] = useState(true)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])
  if (online) return null
  return (
    <div className="fixed left-1/2 top-2 z-50 -translate-x-1/2 rounded-full border border-white/20 bg-amber-500/20 px-3 py-1 text-xs text-amber-100 backdrop-blur-xs">
      You are offline — changes will retry automatically
    </div>
  )
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        shouldRetryOnError: true,
        onErrorRetry: (error: unknown, _key, _config, revalidate, { retryCount }) => {
          const errorObj = error as { status?: number; response?: { status?: number } }
          const status = errorObj?.status || errorObj?.response?.status
          if (status && [400, 401, 403, 404].includes(status)) return
          const maxRetry = 4
          if (retryCount >= maxRetry) return
          const timeout = Math.min(16000, 1000 * Math.pow(2, retryCount))
          setTimeout(() => revalidate({ retryCount }), timeout)
        }
      }}
    >
      <OfflineBanner />
      {children}
    </SWRConfig>
  )
}


