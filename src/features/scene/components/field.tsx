/**
 * Cancha de fútbol 8: estática y decorativa (sin datos ni estado).
 * Plano verde claro/gris verdoso con líneas reglamentarias simplificadas:
 * perímetro, línea media, círculo central, áreas y puntos penal.
 * Las líneas son planas sobre el piso (no muros, no vallas).
 *
 * El verde claro resuelve el contraste con las propias (verde oscuro),
 * gap 3 del review de scene.
 */

const LENGTH = 50 // eje x (metros)
const WIDTH = 30 // eje z (metros)
const LINE_WIDTH = 0.25
const CIRCLE_RADIUS = 6
const AREA_DEPTH = 12
const AREA_WIDTH = 20
const PENALTY_SPOT_DIST = 9 // distancia del punto penal al arco
const SPOT_RADIUS = 0.2
const LINE_Y = 0.01 // sobre el piso para evitar z-fighting
const PITCH_COLOR = '#7ca982'
const LINE_COLOR = '#f5f5f5'

type Segment = {
  x: number
  z: number
  /** Extensión en x y en z del rectángulo que representa la línea. */
  width: number
  depth: number
}

const LINES: Segment[] = [
  // perímetro
  { x: 0, z: -WIDTH / 2, width: LENGTH, depth: LINE_WIDTH },
  { x: 0, z: WIDTH / 2, width: LENGTH, depth: LINE_WIDTH },
  { x: -LENGTH / 2, z: 0, width: LINE_WIDTH, depth: WIDTH },
  { x: LENGTH / 2, z: 0, width: LINE_WIDTH, depth: WIDTH },
  // línea media
  { x: 0, z: 0, width: LINE_WIDTH, depth: WIDTH },
  // área izquierda: frente + laterales (el fondo es la línea de arco)
  { x: -LENGTH / 2 + AREA_DEPTH, z: 0, width: LINE_WIDTH, depth: AREA_WIDTH },
  { x: -LENGTH / 2 + AREA_DEPTH / 2, z: -AREA_WIDTH / 2, width: AREA_DEPTH, depth: LINE_WIDTH },
  { x: -LENGTH / 2 + AREA_DEPTH / 2, z: AREA_WIDTH / 2, width: AREA_DEPTH, depth: LINE_WIDTH },
  // área derecha
  { x: LENGTH / 2 - AREA_DEPTH, z: 0, width: LINE_WIDTH, depth: AREA_WIDTH },
  { x: LENGTH / 2 - AREA_DEPTH / 2, z: -AREA_WIDTH / 2, width: AREA_DEPTH, depth: LINE_WIDTH },
  { x: LENGTH / 2 - AREA_DEPTH / 2, z: AREA_WIDTH / 2, width: AREA_DEPTH, depth: LINE_WIDTH },
]

const SPOTS = [
  { x: 0, z: 0 }, // punto central
  { x: -(LENGTH / 2 - PENALTY_SPOT_DIST), z: 0 }, // punto penal izquierdo
  { x: LENGTH / 2 - PENALTY_SPOT_DIST, z: 0 }, // punto penal derecho
]

export function Field() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[LENGTH, WIDTH]} />
        <meshStandardMaterial color={PITCH_COLOR} />
      </mesh>

      {LINES.map((line, i) => (
        <mesh key={i} position={[line.x, LINE_Y, line.z]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[line.width, line.depth]} />
          <meshBasicMaterial color={LINE_COLOR} />
        </mesh>
      ))}

      {/* círculo central */}
      <mesh position={[0, LINE_Y, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[CIRCLE_RADIUS - LINE_WIDTH / 2, CIRCLE_RADIUS + LINE_WIDTH / 2, 64]} />
        <meshBasicMaterial color={LINE_COLOR} />
      </mesh>

      {SPOTS.map((spot, i) => (
        <mesh key={i} position={[spot.x, LINE_Y, spot.z]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[SPOT_RADIUS, 24]} />
          <meshBasicMaterial color={LINE_COLOR} />
        </mesh>
      ))}
    </group>
  )
}