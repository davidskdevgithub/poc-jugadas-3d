import { create } from 'zustand'
import { advanceTime } from './utils/advance-time'

/**
 * Store de playback: fuente única de `currentTime`/`playing`/`duration` de la
 * jugada. Entry point de la feature `playback/` — la escena lo consume directo
 * (`@/features/playback/playback-store`); los internals (`components/`,
 * `utils/`) no se consumen desde afuera.
 *
 * Lectura y mutación por frame: `getState()` y acciones dentro de `useFrame`
 * (Decisión D) — nunca un hook reactivo del render loop.
 */
export type PlaybackState = {
  /** Instante actual de la jugada, en segundos; arranca en 0. */
  currentTime: number
  /** ¿La reproducción está avanzando? Arranca en false. */
  playing: boolean
  /** Duración de la jugada cargada, en segundos. 0 = sin jugada cargada. */
  duration: number
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (t: number) => void
  /** Avanza el tiempo `dt` segundos (llamado por el driver por frame). */
  advance: (dt: number) => void
  /** Fija la duración de la jugada cargada (lo llama Scene al montar). */
  setDuration: (duration: number) => void
}

export const usePlaybackStore = create<PlaybackState>()((set, get) => ({
  currentTime: 0,
  playing: false,
  duration: 0,

  play: () => {
    const { duration, currentTime } = get()
    // Sin jugada cargada: no-op (UC-E4).
    if (duration === 0) return
    // Terminada: reinicia desde 0 reproduciendo (UC-G2).
    if (currentTime >= duration) return set({ currentTime: 0, playing: true })
    // Repetido mientras reproduce: no reinicia (UC-E5).
    set({ playing: true })
  },

  pause: () => set({ playing: false }),

  toggle: () => {
    const { playing, pause, play } = get()
    if (playing) pause()
    else play()
  },

  seek: (t) => {
    const { duration, playing } = get()
    // Clamp en ambos extremos (UC-E1/E2); al instante exacto del final corta
    // la reproducción sin overshoot (UC-E3), intermedio conserva el estado (UC-04).
    const clamped = Math.min(Math.max(t, 0), duration)
    set({ currentTime: clamped, playing: clamped >= duration ? false : playing })
  },

  advance: (dt) => {
    // Guard de reproducción en el store (fuente única), no en el driver.
    const { currentTime, playing, duration } = get()
    if (!playing || duration === 0) return
    set(advanceTime(currentTime, dt, duration))
  },

  setDuration: (duration) => set({ duration }),
}))