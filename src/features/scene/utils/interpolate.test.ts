import { describe, expect, it } from 'vitest'
import type { Play } from '../scene-types'
import { getPositionsAtTime } from './interpolate'

const play: Play = {
  name: 'fixture',
  duration: 6,
  players: [
    { id: 'p1', team: 'own', number: 7 },
    { id: 'p2', team: 'rival', number: 4 },
  ],
  keyframes: [
    { t: 0, players: { p1: { x: 0, z: 0 }, p2: { x: 10, z: 10 } }, ball: { x: 0, y: 0, z: 0 } },
    { t: 4, players: { p1: { x: 2, z: 4 }, p2: { x: 14, z: 6 } }, ball: { x: 4, y: 2, z: 8 } },
    { t: 6, players: { p1: { x: 4, z: 8 }, p2: { x: 16, z: 4 } }, ball: { x: 8, y: 0, z: 12 } },
  ],
}

describe('getPositionsAtTime', () => {
  it('interpola al punto medio entre dos keyframes consecutivos (UC-05)', () => {
    const { players, ball } = getPositionsAtTime(play, 5)

    expect(players.p1).toEqual({ x: 3, z: 6 })
    expect(players.p2).toEqual({ x: 15, z: 5 })
    expect(ball).toEqual({ x: 6, y: 1, z: 10 })
  })

  it('en t exacto de un keyframe devuelve sus posiciones sin aporte del vecino (UC-E2)', () => {
    const atFour = getPositionsAtTime(play, 4)
    expect(atFour.players).toEqual(play.keyframes[1].players)
    expect(atFour.ball).toEqual(play.keyframes[1].ball)

    expect(getPositionsAtTime(play, 0).players).toEqual(play.keyframes[0].players)
    expect(getPositionsAtTime(play, 6).ball).toEqual(play.keyframes[2].ball)
  })

  it('clampa al keyframe más cercano fuera de rango, en ambos extremos (UC-E1)', () => {
    const before = getPositionsAtTime(play, -5)
    expect(before.players).toEqual(play.keyframes[0].players)
    expect(before.ball).toEqual(play.keyframes[0].ball)

    const after = getPositionsAtTime(play, 100)
    expect(after.players).toEqual(play.keyframes[2].players)
    expect(after.ball).toEqual(play.keyframes[2].ball)
  })

  it('interpola la altura de la pelota igual que x y z, descendiendo hasta el piso (UC-E3)', () => {
    // Entre t=4 (y=2) y t=6 (y=0): a mitad de camino y=1.
    expect(getPositionsAtTime(play, 5).ball.y).toBe(1)
    // Al llegar al keyframe final la pelota está apoyada.
    expect(getPositionsAtTime(play, 6).ball.y).toBe(0)
  })
})