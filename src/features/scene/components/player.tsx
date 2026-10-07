import { Billboard, Text } from '@react-three/drei'
import type { TeamId } from '../scene-types'

/**
 * Jugadora: cilindro bajo de altura fija (representación simple, la
 * legibilidad de posición manda sobre el realismo). Color por equipo:
 * propias verde oscuro, rivales blanco — mismas arqueras, el número 1
 * las marca (gap 4 del review de scene).
 *
 * El número vive encima del cilindro, billboardeado a la cámara para ser
 * legible desde cualquier ángulo, incluida la cenital (UC-E4).
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
  team: TeamId
  number: number
}

export function Player({ team, number }: PlayerProps) {
  return (
    <group>
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