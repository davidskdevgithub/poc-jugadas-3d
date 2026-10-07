import type { BallPosition, Play, PlayerId, Position2D, PositionsAtTime } from '../scene-types'

const lerp = (a: number, b: number, alpha: number): number => a + (b - a) * alpha

/**
 * Posiciones en el instante `t`, interpoladas linealmente entre keyframes
 * consecutivos (los keyframes son completos: incluyen a todas las jugadoras).
 *
 * - Fuera de rango (t < primer keyframe o t > último): keyframe más cercano,
 *   sin error ni posiciones indefinidas (UC-E1).
 * - t exactamente en un keyframe: posiciones de ese keyframe, sin aporte del
 *   vecino (UC-E2) — devuelve referencias del keyframe, sin copiar.
 * - La altura (y) de la pelota se interpola igual que x y z (UC-E3).
 */
export function getPositionsAtTime(play: Play, t: number): PositionsAtTime {
  const keyframes = play.keyframes
  const first = keyframes[0]
  const last = keyframes[keyframes.length - 1]

  if (t <= first.t) return { players: first.players, ball: first.ball }
  if (t >= last.t) return { players: last.players, ball: last.ball }

  // Índice i tal que keyframes[i].t <= t < keyframes[i+1].t
  let i = 0
  while (i < keyframes.length - 2 && keyframes[i + 1].t <= t) i += 1

  const a = keyframes[i]
  const b = keyframes[i + 1]

  // Keyframes duplicados en t (datos degenerados): quedarnos en `a`.
  if (a.t === b.t) return { players: a.players, ball: a.ball }

  const alpha = (t - a.t) / (b.t - a.t)

  // Hit exacto: referencias del keyframe — la escena llama esto por frame.
  if (alpha === 0) return { players: a.players, ball: a.ball }

  const players: Record<PlayerId, Position2D> = {}
  for (const id in a.players) {
    const pa = a.players[id]
    const pb = b.players[id] ?? pa
    players[id] = { x: lerp(pa.x, pb.x, alpha), z: lerp(pa.z, pb.z, alpha) }
  }

  const ball: BallPosition = {
    x: lerp(a.ball.x, b.ball.x, alpha),
    y: lerp(a.ball.y, b.ball.y, alpha),
    z: lerp(a.ball.z, b.ball.z, alpha),
  }

  return { players, ball }
}