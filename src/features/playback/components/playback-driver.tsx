import { useFrame } from '@react-three/fiber'
import { usePlaybackStore } from '../playback-store'

/**
 * Driver de avance: único clock del playback. Corre en useFrame del Canvas,
 * sincronizado con el render loop (sin setInterval ni rAF propios). El guard
 * (pausado / sin jugada) y el clamp del delta viven en la acción `advance`.
 */
export function PlaybackDriver() {
  useFrame((_, delta) => {
    usePlaybackStore.getState().advance(delta)
  })
  return null
}