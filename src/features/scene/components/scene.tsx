import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group } from 'three'
import { usePlaybackStore } from '@/features/playback/playback-store'
import { playMock } from '../data/play-mock'
import { getPositionsAtTime } from '../utils/interpolate'
import { Ball } from './ball'
import { Field } from './field'
import { Player } from './player'

/**
 * Escena: compone cancha + jugadoras + pelota en el instante del store de
 * playback. Scene no mantiene tiempo propio — el instante mostrado es siempre
 * `currentTime` del store (UC-07). Al montar fija `duration` de la jugada en
 * el store (UC-05); sin interacción la jugada queda pausada en t=0 (UC-08) —
 * el avance solo lo dispara el store de playback (espacio por ahora, luego
 * timeline-ui).
 *
 * Decisión D: el tiempo se lee con `getState()` dentro de `useFrame` y las
 * posiciones se mutan por refs — React nunca re-renderiza por frame.
 * La identidad (equipo, número) se renderiza una vez; solo cambian posiciones.
 */
export function Scene() {
  const playerRefs = useRef<(Group | null)[]>([])
  const ballRef = useRef<Group>(null)

  // Fija la duración de la jugada al montar (UC-05): idempotente bajo el
  // doble montaje de StrictMode. getState() dentro del effect — la acción es
  // estable, no hook reactivo (Decisión D).
  useEffect(() => {
    usePlaybackStore.getState().setDuration(playMock.duration)
  }, [])

  useFrame(() => {
    const { currentTime } = usePlaybackStore.getState()
    const { players, ball } = getPositionsAtTime(playMock, currentTime)

    playMock.players.forEach((identity, i) => {
      const group = playerRefs.current[i]
      const position = players[identity.id]
      if (group && position) group.position.set(position.x, 0, position.z)
    })

    if (ballRef.current) ballRef.current.position.set(ball.x, ball.y, ball.z)
  })

  return (
    <group>
      <Field />

      {playMock.players.map((identity, i) => (
        <group
          key={identity.id}
          ref={(el) => {
            playerRefs.current[i] = el
          }}
        >
          <Player team={identity.team} number={identity.number} />
        </group>
      ))}

      <group ref={ballRef}>
        <Ball />
      </group>
    </group>
  )
}