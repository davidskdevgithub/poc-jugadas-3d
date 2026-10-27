import {
  PITCH_LENGTH,
  PITCH_WIDTH,
  type PlayerId,
  type PlayerIdentity,
  type PositionsAtTime,
} from '@/features/scene/scene-types'

/**
 * Poses de cámara — puro, sin three ni react (Decisión C). Cenital y oblicua
 * fijas (calculadas desde las dimensiones de la cancha y el fov); desde
 * jugadora derivada de getPositionsAtTime + altura de ojo. El rig
 * (components/camera-rig.tsx) aplica las poses al objeto camera por frame.
 */

/** Pose de cámara: posición del ojo y punto al que mira, en metros. */
export type CameraPose = {
  position: [number, number, number]
  target: [number, number, number]
}

/** fov vertical del Canvas — de acá se deriva la altura de la cenital. */
export const CAMERA_FOV = 45

/** Altura de ojo en FPV: la de la jugadora (cilindro de 1.2 m en scene/player.tsx). */
export const EYE_HEIGHT = 1.2

/** Límites de la cámara libre; el pan se clampea aparte (UC-G5). */
export const FREE_LIMITS = {
  /** Zoom máximo de acercamiento: nivel de jugadoras (cilindros de 1.2 m). */
  minDistance: 4,
  /** Zoom máximo de alejamiento: ve la cancha completa (2·70·tan(fov/2) ≈ 58 m ≥ 50, UC-E2). */
  maxDistance: 70,
  /** Nunca mira desde abajo de la cancha: frena al ras del piso (UC-E1). */
  maxPolarAngle: Math.PI / 2,
} as const

/** Margen del pan más allá del perímetro de la cancha (UC-G5). */
export const PAN_MARGIN = 3

/** Pose inicial de la cámara libre (la que tenía App.tsx): cancha completa encuadrada (UC-01). */
export const INITIAL_POSE: CameraPose = { position: [0, 42, 38], target: [0, 0, 0] }

// Medio fov en radianes: (fov° / 2) · π/180. De acá salen la altura de la
// cenital y el chequeo de zoom out de los tests.
const HALF_FOV_RAD = (CAMERA_FOV / 2) * (Math.PI / 180)

/**
 * Cenital (UC-05): perpendicular sobre el centro de la cancha. El ojo va
 * 0.5 m hacia el lado propio (−x): el lookAt con up +y resuelve entonces el
 * ataque propio (+x) hacia arriba de la pantalla (UC-G4); el desvío de la
 * vertical es 0.46°, imperceptible. La altura encaja el largo (50 m) con margen.
 */
const CENITAL_HEIGHT = PITCH_LENGTH / 2 / Math.tan(HALF_FOV_RAD) + 2
export const CENITAL_POSE: CameraPose = { position: [-0.5, CENITAL_HEIGHT, 0], target: [0, 0, 0] }

/**
 * Oblicua (UC-06): elevada 45° en la esquina propia de banda z positiva, a
 * distancia fija del centro — la vista clásica de video de análisis. La
 * distancia queda dentro de [minDistance, maxDistance] para que OrbitControls
 * no la reclame al primer input.
 */
const OBLIQUE_DISTANCE = 44
const OBLIQUE_H = OBLIQUE_DISTANCE * Math.cos(Math.PI / 4) // avance horizontal ≈ 31.11
const CORNER_X = -PITCH_LENGTH / 2 // esquina propia: arco propio en x = −25
const CORNER_Z = PITCH_WIDTH / 2
const CORNER_LEN = Math.hypot(CORNER_X, CORNER_Z)
export const OBLICUA_POSE: CameraPose = {
  position: [
    (CORNER_X / CORNER_LEN) * OBLIQUE_H,
    OBLIQUE_DISTANCE * Math.sin(Math.PI / 4),
    (CORNER_Z / CORNER_LEN) * OBLIQUE_H,
  ],
  target: [0, 0, 0],
}

/**
 * Clamp del target del pan a cancha + margen (UC-G5). Se aplica por frame en el
 * rig en modo libre; el eje y no se toca (el pan de OrbitControls es horizontal).
 */
export function clampPanTarget(target: CameraPose['target']): CameraPose['target'] {
  const boundX = PITCH_LENGTH / 2 + PAN_MARGIN
  const boundZ = PITCH_WIDTH / 2 + PAN_MARGIN
  return [
    Math.min(Math.max(target[0], -boundX), boundX),
    target[1],
    Math.min(Math.max(target[2], -boundZ), boundZ),
  ]
}

/**
 * Dueña del FPV sin selección: la arquera propia nº 1 (UC-G2); null si no hay
 * arquera en la jugada. La resolución completa (seleccionada y su existencia
 * en las posiciones) vive en getFpvPose; Player usa esta regla para ocultar
 * la malla propia (UC-G3) — mismo default, sin duplicar la regla del número 1.
 */
export function defaultFpvPlayerId(players: PlayerIdentity[]): PlayerId | null {
  return players.find((p) => p.team === 'own' && p.number === 1)?.id ?? null
}

/**
 * Pose del modo jugadora (UC-07): ojo en la posición 2D de la jugadora a
 * EYE_HEIGHT mirando la pelota en su posición 3D (incluye su altura y).
 * selectedPlayerId null o inexistente en las posiciones → arquera por defecto
 * (defaultFpvPlayerId, UC-G2); sin arquera en la jugada → null (el rig no
 * mueve la cámara).
 */
export function getFpvPose(
  positions: PositionsAtTime,
  selectedPlayerId: PlayerId | null,
  players: PlayerIdentity[],
): CameraPose | null {
  const id =
    selectedPlayerId != null && positions.players[selectedPlayerId]
      ? selectedPlayerId
      : defaultFpvPlayerId(players)
  const pos = id ? positions.players[id] : undefined
  if (!pos) return null
  const { ball } = positions
  return { position: [pos.x, EYE_HEIGHT, pos.z], target: [ball.x, ball.y, ball.z] }
}
