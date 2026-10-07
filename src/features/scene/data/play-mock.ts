import type { Play, PlayerIdentity } from '../scene-types'

/**
 * Jugada mock (gap 5 del review de scene): progresión central con pase
 * filtrado, ~12 s, 6 keyframes, 8 vs 8 con arqueras incluidas (número 1).
 *
 * Cancha de fútbol 8: 50 × 30 m, origen en el centro, x a lo largo
 * (−25..25), z a lo ancho (−15..15). Nosotras atacamos hacia +x
 * (arco rival en x = +25).
 *
 * Historia: o7 conduce desde mitad propia, pasa por alto a o8 que recibió
 * el desmarque y llega al área rival; las rivales presionan alto al inicio
 * y el bloque retrocede marcando. La pelota avanza con altura variable
 * (pico del pase en t = 7.5, cae al piso en t = 9).
 */

const ourPlayers: PlayerIdentity[] = [
  { id: 'o1', team: 'own', number: 1 }, // arquera
  { id: 'o2', team: 'own', number: 2 },
  { id: 'o3', team: 'own', number: 3 },
  { id: 'o4', team: 'own', number: 4 },
  { id: 'o5', team: 'own', number: 5 },
  { id: 'o6', team: 'own', number: 6 },
  { id: 'o7', team: 'own', number: 7 }, // organizadora, conduce y pasa
  { id: 'o8', team: 'own', number: 8 }, // delantera, recibe el pase filtrado
]

const rivalPlayers: PlayerIdentity[] = [
  { id: 'r1', team: 'rival', number: 1 }, // arquera
  { id: 'r2', team: 'rival', number: 2 },
  { id: 'r3', team: 'rival', number: 3 },
  { id: 'r4', team: 'rival', number: 4 },
  { id: 'r5', team: 'rival', number: 5 },
  { id: 'r6', team: 'rival', number: 6 },
  { id: 'r7', team: 'rival', number: 7 }, // presiona a o7
  { id: 'r8', team: 'rival', number: 8 },
]

export const playMock: Play = {
  name: 'Progresión central con pase filtrado',
  duration: 12,
  players: [...ourPlayers, ...rivalPlayers],
  keyframes: [
    {
      t: 0,
      players: {
        o1: { x: -23, z: 0 },
        o2: { x: -14, z: -7 },
        o3: { x: -13, z: 0 },
        o4: { x: -14, z: 7 },
        o5: { x: -6, z: -5 },
        o6: { x: -6, z: 5 },
        o7: { x: -3, z: 0 },
        o8: { x: -1, z: -2 },
        r1: { x: 23, z: 0 },
        r2: { x: 14, z: -7 },
        r3: { x: 13, z: 0 },
        r4: { x: 14, z: 7 },
        r5: { x: 4, z: -4 },
        r6: { x: 4, z: 4 },
        r7: { x: 7, z: 0 },
        r8: { x: 8, z: -2 },
      },
      ball: { x: -2.5, y: 0, z: 0.5 },
    },
    {
      t: 3,
      players: {
        o1: { x: -22.5, z: 0.5 },
        o2: { x: -13, z: -6 },
        o3: { x: -11.5, z: 0 },
        o4: { x: -13, z: 6 },
        o5: { x: -4, z: -4.5 },
        o6: { x: -4, z: 4.5 },
        o7: { x: 0.5, z: 1 },
        o8: { x: 1.5, z: -3 },
        r1: { x: 23, z: 0 },
        r2: { x: 15, z: -6.5 },
        r3: { x: 14, z: 0 },
        r4: { x: 15, z: 6.5 },
        r5: { x: 6.5, z: -4.2 },
        r6: { x: 6.5, z: 4 },
        r7: { x: 5, z: 1 },
        r8: { x: 7, z: -1.8 },
      },
      ball: { x: 1.2, y: 0, z: 1.2 },
    },
    {
      t: 6,
      players: {
        o1: { x: -20, z: 1 },
        o2: { x: -11, z: -5 },
        o3: { x: -10, z: 0 },
        o4: { x: -11, z: 5 },
        o5: { x: -2, z: -4 },
        o6: { x: -2, z: 4 },
        o7: { x: 4, z: 0.5 },
        o8: { x: 5.5, z: -4 },
        r1: { x: 23, z: 0 },
        r2: { x: 16.5, z: -6 },
        r3: { x: 15.5, z: -0.5 },
        r4: { x: 16.5, z: 5.5 },
        r5: { x: 9, z: -4.4 },
        r6: { x: 9, z: 3.6 },
        r7: { x: 6.5, z: 0.6 },
        r8: { x: 8.5, z: -2.2 },
      },
      ball: { x: 4.8, y: 0, z: 0.8 },
    },
    {
      t: 7.5,
      players: {
        o1: { x: -19, z: 1 },
        o2: { x: -10, z: -4.8 },
        o3: { x: -9.5, z: -0.3 },
        o4: { x: -10, z: 4.6 },
        o5: { x: -0.5, z: -3.8 },
        o6: { x: -0.5, z: 3.8 },
        o7: { x: 5.5, z: 0.2 },
        o8: { x: 8, z: -3.8 },
        r1: { x: 23, z: 0 },
        r2: { x: 17, z: -5.8 },
        r3: { x: 16, z: -1 },
        r4: { x: 17, z: 5 },
        r5: { x: 10, z: -4.6 },
        r6: { x: 10, z: 3.3 },
        r7: { x: 8, z: 0.3 },
        r8: { x: 9.5, z: -2.6 },
      },
      ball: { x: 9, y: 2.4, z: -1.8 },
    },
    {
      t: 9,
      players: {
        o1: { x: -18, z: 1 },
        o2: { x: -9.5, z: -4.5 },
        o3: { x: -9, z: -0.6 },
        o4: { x: -9.5, z: 4.2 },
        o5: { x: 0.5, z: -3.6 },
        o6: { x: 0.5, z: 3.6 },
        o7: { x: 7, z: -0.2 },
        o8: { x: 12, z: -3.6 },
        r1: { x: 23, z: 0 },
        r2: { x: 17.5, z: -5.4 },
        r3: { x: 16.5, z: -1.6 },
        r4: { x: 17.5, z: 4.4 },
        r5: { x: 11, z: -4.8 },
        r6: { x: 11, z: 3 },
        r7: { x: 9.5, z: 0 },
        r8: { x: 10.5, z: -3 },
      },
      ball: { x: 12.5, y: 0, z: -3.6 },
    },
    {
      t: 12,
      players: {
        o1: { x: -16, z: 0.8 },
        o2: { x: -8, z: -4.2 },
        o3: { x: -8, z: -1 },
        o4: { x: -8, z: 3.8 },
        o5: { x: 1.5, z: -3.2 },
        o6: { x: 1.5, z: 3.2 },
        o7: { x: 9.5, z: -0.6 },
        o8: { x: 15.5, z: -5.5 },
        r1: { x: 23, z: 0 },
        r2: { x: 18, z: -5.8 },
        r3: { x: 17, z: -2.4 },
        r4: { x: 18, z: 4 },
        r5: { x: 12.5, z: -5.2 },
        r6: { x: 12.5, z: 2.4 },
        r7: { x: 11.5, z: -0.6 },
        r8: { x: 11.5, z: -3.4 },
      },
      ball: { x: 15.8, y: 0, z: -5.6 },
    },
  ],
}