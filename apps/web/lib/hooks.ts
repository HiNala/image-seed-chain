"use client"
import useSWR from 'swr'
import { jsonFetcher } from './fetcher'
import type { SeedMeta } from '@/types'

export function useCurrent() {
  return useSWR<SeedMeta>('/api/current', jsonFetcher, { refreshInterval: 4000, dedupingInterval: 2500 })
}

export function useHistory(limit = 20) {
  return useSWR<SeedMeta[]>(`/api/history?limit=${limit}`,
    async (url: string) => {
      const res = await jsonFetcher<{ items?: SeedMeta[] } | SeedMeta[]>(url)
      return Array.isArray(res) ? res : (res?.items ?? [])
    },
    { refreshInterval: 12000 }
  )
}


