import { NextResponse } from 'next/server'

export type ApiErrorCode = 'BAD_REQUEST' | 'RATE_LIMITED' | 'INTERNAL'

const defaultHeaders = { 'Cache-Control': 'no-store' }

export function ok<T extends Record<string, unknown> | unknown[]>(
  data: T,
  init?: ResponseInit
) {
  return NextResponse.json(data, { ...(init || {}), headers: { ...defaultHeaders, ...(init?.headers || {}) } })
}

export function err(code: ApiErrorCode, message: string, status = 400, init?: ResponseInit) {
  return NextResponse.json(
    { error: message, code },
    { status, ...(init || {}), headers: { ...defaultHeaders, ...(init?.headers || {}) } }
  )
}


