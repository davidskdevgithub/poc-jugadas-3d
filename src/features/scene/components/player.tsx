import { Billboard, Text } from '@react-three/drei'
import { useCameraStore } from '@/features/camera/camera-store'
import { defaultFpvPlayerId } from '@/features/camera/utils'
import type { PlayerId, TeamId } from '../scene-types'
import { playMock } from '../data/play-mock'

/**
 * Jugadora: cilindro bajo de altura fija (representación simple, la
 * legibilidad de posición manda sobre el realismo). Color por equipo:
 * propias verde oscuro, rivales blanco — mismas arqueras, el número 1
 * las marca (gap 4 del review de scene).
 *
 * El número vive encima del cilindro, billboardeado a la cámara para ser
 * legible desde cualquier ángulo, incluida la cenital (UC-E4).
 *
 * Click sobre la jugadora la selecciona en el store de camera (UC-G1). En
 * modo 'jugadora' la dueña del FPV se oculta entera (cilindro + número,
 * UC-G3/UC-E5): la seleccionada o, sin selección, la arquera default
 * (defaultFpvPlayerId — misma regla que getFpvPose); re-render React solo
 * al cambiar modo o selección — nunca por frame (Decisión D).
 */

const PLAYER_RADIUS = 0.5
const PLAYER_HEIGHT = 1.2
const NUMBER_Y = PLAYER_HEIGHT + 0.8
const NUMBER_FONT_SIZE = 0.9

const TEAM_COLORS: Record<TeamId, string> = {
  own: '#14532d',
  rival: '#f5f5f5',
}

const NUMBER_COLORS: Record<TeamId, string> = {
  own: '#ffffff',
  rival: '#1c1917',
}

type PlayerProps = {
  id: PlayerId
  team: TeamId
  number: number
}

export function Player({ id, team, number }: PlayerProps) {
  const viewMode = useCameraStore((s) => s.viewMode)
  const selectedPlayerId = useCameraStore((s) => s.selectedPlayerId)
  const setSelectedPlayerId = useCameraStore((s) => s.setSelectedPlayerId)
  const fpvOwner = selectedPlayerId ?? defaultFpvPlayerId(playMock.players)
  const isSelf = fpvOwner === id
  const hidden = viewMode === 'jugadora' && isSelf

  return (
    <group
      visible={!hidden}
      onClick={(e) => {
        e.stopPropagation()
        setSelectedPlayerId(id)
      }}
    >
      <mesh position={[0, PLAYER_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[PLAYER_RADIUS, PLAYER_RADIUS, PLAYER_HEIGHT, 24]} />
        <meshStandardMaterial color={TEAM_COLORS[team]} />
      </mesh>
      <Billboard position={[0, NUMBER_Y, 0]}>
        <Text
          font="/fonts/roboto-regular.woff"
          fontSize={NUMBER_FONT_SIZE}
          color={NUMBER_COLORS[team]}
          anchorX="center"
          anchorY="middle"
        >
          {String(number)}
        </Text>
      </Billboard>
    </group>
  )
}