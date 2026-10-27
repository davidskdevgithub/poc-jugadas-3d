import { describe, expect, it } from 'vitest'
import {
  PITCH_LENGTH,
  PITCH_WIDTH,
  type PlayerIdentity,
  type PositionsAtTime,
} from '@/features/scene/scene-types'
import {
  CAMERA_FOV,
  CENITAL_POSE,
  clampPanTarget,
  defaultFpvPlayerId,
  EYE_HEIGHT,
  FREE_LIMITS,
  getFpvPose,
  OBLICUA_POSE,
  PAN_MARGIN,
} from './presets'

// Medio fov en radianes, igual que en presets.ts.
const HALF_FOV_RAD = (CAMERA_FOV / 2) * (Math.PI / 180)

const IDENTITIES: PlayerIdentity[] = [
  { id: 'gk', team: 'own', number: 1 },
  { id: 'p7', team: 'own', number: 7 },
  { id: 'r1', team: 'rival', number: 1 },
]

const POSITIONS: PositionsAtTime = {
  players: {
    gk: { x: -22, z: 0 },
    p7: { x: 5, z: 3 },
    r1: { x: 20, z: -4 },
  },
  ball: { x: 8, y: 2.5, z: -6 },
}

// Sin arquera: solo jugadoras de campo, ninguna con número 1 en own.
const NO_GK_IDENTITIES: PlayerIdentity[] = [
  { id: 'p7', team: 'own', number: 7 },
  { id: 'r1', team: 'rival', number: 1 },
]

describe('CENITAL_POSE', () => {
  it('mira el centro de la cancha desde arriba con el ataque propio hacia arriba (UC-05, UC-G4)', () => {
    expect(CENITAL_POSE.target).toEqual([0, 0, 0])
    // Sin desvío lateral en z: la perpendicular cae sobre la línea media.
    expect(CENITAL_POSE.position[2]).toBe(0)
    // Ojo del lado propio (−x): con up +y, el ataque propio (+x) queda arriba.
    expect(CENITAL_POSE.position[0]).toBeLessThan(0)
  })

  it('encaja el largo completo de la cancha en el frustum vertical (UC-05)', () => {
    const minHeight = PITCH_LENGTH / 2 / Math.tan(HALF_FOV_RAD)
    expect(CENITAL_POSE.position[1]).toBeGreaterThanOrEqual(minHeight)
  })
})

describe('OBLICUA_POSE', () => {
  it('eleva 45° en la esquina propia de banda z positiva (UC-06, UC-G4)', () => {
    const [x, y, z] = OBLICUA_POSE.position
    expect(Math.atan2(y, Math.hypot(x, z))).toBeCloseTo(Math.PI / 4)
    expect(x).toBeLessThan(0) // mitad propia
    expect(z).toBeGreaterThan(0) // esquina elegida
  })

  it('queda dentro del zoom máximo para que OrbitControls no la reclame (UC-06)', () => {
    const [x, y, z] = OBLICUA_POSE.position
    const distance = Math.hypot(x, y, z)
    expect(distance).toBeLessThanOrEqual(FREE_LIMITS.maxDistance)
  })
})

describe('defaultFpvPlayerId', () => {
  it('devuelve la arquera propia nº 1 (UC-G2)', () => {
    expect(defaultFpvPlayerId(IDENTITIES)).toBe('gk')
  })

  it('sin arquera propia nº 1 devuelve null (UC-G2)', () => {
    expect(defaultFpvPlayerId(NO_GK_IDENTITIES)).toBeNull()
  })
})

describe('getFpvPose', () => {
  it('sin selección usa la arquera propia nº 1 y mira la pelota con su altura (UC-G2)', () => {
    const pose = getFpvPose(POSITIONS, null, IDENTITIES)
    expect(pose).not.toBeNull()
    expect(pose?.position).toEqual([-22, EYE_HEIGHT, 0])
    // El target incluye la y de la pelota, sin sumar radio.
    expect(pose?.target).toEqual([8, 2.5, -6])
  })

  it('con selección usa la posición de esa jugadora (UC-G1)', () => {
    const pose = getFpvPose(POSITIONS, 'p7', IDENTITIES)
    expect(pose).not.toBeNull()
    expect(pose?.position).toEqual([5, EYE_HEIGHT, 3])
  })

  it('con id inexistente en las posiciones cae a la arquera default (UC-E1)', () => {
    const pose = getFpvPose(POSITIONS, 'noexiste', IDENTITIES)
    expect(pose).not.toBeNull()
    expect(pose?.position).toEqual([-22, EYE_HEIGHT, 0])
  })

  it('sin arquera en la jugada y sin selección devuelve null (UC-G2)', () => {
    const pose = getFpvPose(POSITIONS, null, NO_GK_IDENTITIES)
    expect(pose).toBeNull()
  })
})

describe('clampPanTarget', () => {
  it('dentro de límites devuelve el target sin cambios, y intacto (UC-G5)', () => {
    const target: [number, number, number] = [10, 1.5, -8]
    expect(clampPanTarget(target)).toEqual([10, 1.5, -8])
  })

  it('clampa al borde en ambos sentidos de x y z, sin tocar y (UC-G5)', () => {
    const boundX = PITCH_LENGTH / 2 + PAN_MARGIN
    const boundZ = PITCH_WIDTH / 2 + PAN_MARGIN

    expect(clampPanTarget([100, 2, -100])).toEqual([boundX, 2, -boundZ])
    expect(clampPanTarget([-100, 0, 100])).toEqual([-boundX, 0, boundZ])
  })
})

describe('FREE_LIMITS', () => {
  it('frena el polar al ras del piso, sin mirar desde abajo (UC-E1)', () => {
    expect(FREE_LIMITS.maxPolarAngle).toBe(Math.PI / 2)
  })

  it('el zoom out alcanza la cancha completa de ancho visual (UC-E2)', () => {
    const visibleSpanAtMax = 2 * FREE_LIMITS.maxDistance * Math.tan(HALF_FOV_RAD)
    expect(visibleSpanAtMax).toBeGreaterThanOrEqual(PITCH_LENGTH)
  })

  it('el rango de zoom es válido (UC-E2)', () => {
    expect(FREE_LIMITS.minDistance).toBeLessThan(FREE_LIMITS.maxDistance)
  })
})
