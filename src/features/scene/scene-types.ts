/**
 * Contrato del modelo de jugada — dueño: feature `scene/`.
 *
 * Consumido por playback, camera y timeline-ui por el entry point oficial
 * `@/features/scene/scene-types` (Decisión H). Portable-first (Decisión C):
 * sin imports de react, three ni r3f — migrable al repo destino tal cual.
 *
 * Unidades en metros, origen en el centro de la cancha:
 * x a lo largo (−25..25), z a lo ancho (−15..15), y hacia arriba.
 */

/** Identificador estable de una jugadora dentro de la jugada. */
export type PlayerId = string

/** Equipo: propio (verde oscuro) o rival (blanco). */
export type TeamId = 'own' | 'rival'

/** Posición de una jugadora en el plano de la cancha (metros). */
export type Position2D = {
  x: number
  z: number
}

/** Posición de la pelota. `y` es altura de apoyo: 0 = apoyada en el piso. */
export type BallPosition = {
  x: number
  y: number
  z: number
}

/** Identidad de una jugadora — vive una única vez en `Play`, nunca en los keyframes. */
export type PlayerIdentity = {
  id: PlayerId
  team: TeamId
  /** Número de camiseta; también identifica a la arquera (número 1). */
  number: number
}

/**
 * Snapshot de posiciones en un instante `t` (segundos desde el inicio).
 * Completo: incluye a TODAS las jugadoras y la pelota, no sparse.
 */
export type Keyframe = {
  t: number
  /** Posición de cada jugadora por id — la identidad (equipo, número) vive en `Play`. */
  players: Record<PlayerId, Position2D>
  ball: BallPosition
}

/** Una jugada completa: identidad de las jugadoras + keyframes ordenados por `t`. */
export type Play = {
  name: string
  /** Duración total en segundos. */
  duration: number
  players: PlayerIdentity[]
  /** Ordenados por `t` ascendente, desde t = 0 hasta t = duration. */
  keyframes: Keyframe[]
}

/** Posiciones interpoladas en un instante dado (salida de `getPositionsAtTime`). */
export type PositionsAtTime = {
  players: Record<PlayerId, Position2D>
  ball: BallPosition
}