import { create } from 'zustand'
import type { PlayerId } from '@/features/scene/scene-types'
import type { ViewMode } from './camera-types'

/**
 * Store de camera: `viewMode` y `selectedPlayerId` (Decisión D). Lectura por
 * selectores; lectura por frame con getState() en useFrame (rig), nunca hooks
 * reactivos del render loop.
 */
export type CameraState = {
  /** Modo de vista activo. Arranca en libre (UC-01). */
  viewMode: ViewMode
  /** Jugadora del modo 'jugadora'; null = sin selección → arquera propia nº 1 (UC-G2). */
  selectedPlayerId: PlayerId | null
  setViewMode: (mode: ViewMode) => void
  /** Lo escribe Player al hacer click sobre una jugadora (UC-G1). */
  setSelectedPlayerId: (id: PlayerId) => void
}

export const useCameraStore = create<CameraState>()((set) => ({
  viewMode: 'free',
  selectedPlayerId: null,
  setViewMode: (mode) => set({ viewMode: mode }),
  setSelectedPlayerId: (id) => set({ selectedPlayerId: id }),
}))
