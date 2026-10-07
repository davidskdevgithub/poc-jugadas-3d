import { create } from 'zustand'

/**
 * Store mínimo de playback (gap 2 del review de scene): fuente única del
 * tiempo que consume la escena. Sin acciones todavía — play/pausa/scrub los
 * agrega la feature `playback/` cuando corresponda.
 *
 * Lectura por frame: `usePlaybackStore.getState()` dentro de `useFrame`
 * (Decisión D) — nunca un hook reactivo del render loop.
 *
 * Nota: junto con `{feature}-types`, este archivo es entry point de la
 * feature: la escena lo consume directo, los internals no.
 */
export type PlaybackState = {
  /** Instante actual de la jugada, en segundos. */
  currentTime: number
  /** ¿La reproducción está avanzando? */
  playing: boolean
}

export const usePlaybackStore = create<PlaybackState>()(() => ({
  currentTime: 0,
  playing: false,
}))