/**
 * Delta máximo por frame (s): al volver de background el primer delta de rAF
 * puede ser de varios segundos — sin clamp la jugada saltaría al final.
 */
const MAX_DELTA = 0.1

/**
 * Avanza `currentTime` por `dt` (clampado a `MAX_DELTA`) sin pasar de
 * `duration`: al cruzar el final queda exactamente en `duration` y pausa
 * (UC-G1, sin overshoot por floating point).
 */
export function advanceTime(
  currentTime: number,
  dt: number,
  duration: number,
): { currentTime: number; playing: boolean } {
  const next = Math.min(currentTime + Math.min(dt, MAX_DELTA), duration)
  return { currentTime: next, playing: next < duration }
}