import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { usePlaybackStore } from '@/features/playback/playback-store'

export function TimelineTrack() {
  const currentTime = usePlaybackStore((s) => s.currentTime)
  const duration = usePlaybackStore((s) => s.duration)
  const trackRef = useRef<HTMLDivElement>(null)
  const wasPlayingRef = useRef(false)
  const [dragging, setDragging] = useState(false)

  const fraction = duration > 0 ? currentTime / duration : 0

  // Geometría leída en el momento del evento (no en render): si el track no
  // tiene rect medible (jsdom, pre-layout) devuelve 0 y el store clampea.
  const timeAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return 0
    return Math.max(0, (clientX - rect.left) / rect.width) * usePlaybackStore.getState().duration
  }

  // Regla única de scrub: toda presión es una sesión — click directo = seek
  // inmediato; si estaba reproduciendo queda pausado durante la presión y
  // reanuda al soltar (si no terminó en el final).
  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    wasPlayingRef.current = usePlaybackStore.getState().playing
    usePlaybackStore.getState().pause()
    usePlaybackStore.getState().seek(timeAt(e.clientX))
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return

    const onPointerMove = (e: PointerEvent) => {
      usePlaybackStore.getState().seek(timeAt(e.clientX))
    }
    const onPointerUp = (e: PointerEvent) => {
      usePlaybackStore.getState().seek(timeAt(e.clientX))
      const { currentTime, duration, play } = usePlaybackStore.getState()
      if (wasPlayingRef.current && currentTime < duration) play()
      setDragging(false)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragging])

  return (
    <div
      ref={trackRef}
      className="relative h-6 flex-1 cursor-pointer touch-none select-none"
      onPointerDown={handlePointerDown}
    >
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/20" />
      <div
        className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent"
        style={{ width: `${fraction * 100}%` }}
      />
      <div
        className="absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
        style={{ left: `${fraction * 100}%` }}
      />
    </div>
  )
}