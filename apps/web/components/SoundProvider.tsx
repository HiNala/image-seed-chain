"use client"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

type SoundContextType = {
  enabled: boolean
  toggle: () => void
  playStart: () => void
  playComplete: () => void
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('seedchain:sound')
    if (saved) setEnabled(saved === 'on')
  }, [])

  useEffect(() => {
    localStorage.setItem('seedchain:sound', enabled ? 'on' : 'off')
  }, [enabled])

  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      type AudioContextCtor = typeof AudioContext
      type WithWebkit = Window & { webkitAudioContext?: AudioContextCtor; AudioContext?: AudioContextCtor }
      const w = window as WithWebkit
      const Ctx = (w.AudioContext ?? w.webkitAudioContext) as AudioContextCtor
      audioCtxRef.current = new Ctx()
    }
    return audioCtxRef.current!
  }, [])

  const playTone = useCallback(
    (freqs: number[], durationMs = 600) => {
      if (!enabled) return
      const ctx = ensureCtx()
      const now = ctx.currentTime
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.06, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
      gain.connect(ctx.destination)

      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(f, now)
        osc.connect(gain)
        osc.start(now + i * 0.02)
        osc.stop(now + durationMs / 1000)
      })
    },
    [enabled, ensureCtx]
  )

  const playStart = useCallback(() => {
    // Soft ascending chime
    playTone([440, 554, 659], 500)
  }, [playTone])

  const playComplete = useCallback(() => {
    // Gentle resolving tone
    playTone([523, 392], 500)
  }, [playTone])

  const value = useMemo(
    () => ({ enabled, toggle: () => setEnabled((e) => !e), playStart, playComplete }),
    [enabled, playStart, playComplete]
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used within SoundProvider')
  return ctx
}


