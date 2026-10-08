import { useEffect } from 'react'
import { usePlaybackStore } from '@/features/playback/playback-store'
import { PlayPauseButton } from './play-pause-button'
import { TimelineTrack } from './timeline-track'
import { TimeDisplay } from './time-display'

export function TimelineUi() {
  // Atajo de espacio (dueño único de la feature; migrado de App).
  // `e.repeat` ignora el auto-repeat; `preventDefault` evita el scroll.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return
      e.preventDefault()
      usePlaybackStore.getState().toggle()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // La raíz no se suscribe a nada → no re-renderiza por frame.
  return (
    <div className="fixed inset-x-0 bottom-0 flex items-center gap-4 bg-black/60 px-4 py-3 backdrop-blur-sm select-none">
      <PlayPauseButton />
      <TimelineTrack />
      <TimeDisplay />
    </div>
  )
}