"use client"
import { useSound } from './SoundProvider'

export function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-white/20 bg-white/10 px-2 py-1 text-xs text-fg/80 transition duration-150 ease-in-out hover:bg-white/15"
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
      title="Toggle sounds"
    >
      {enabled ? 'Sound: On' : 'Sound: Off'}
    </button>
  )
}


