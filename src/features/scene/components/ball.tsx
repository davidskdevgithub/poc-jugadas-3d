/**
 * Pelota: esfera blanca — la legibilidad de posición manda sobre el realismo.
 *
 * La `y` del keyframe es altura de apoyo (0 = apoyada en el piso): la esfera
 * se dibuja con su centro a BALL_RADIUS por encima de esa altura.
 */

const BALL_RADIUS = 0.35
const BALL_COLOR = '#ffffff'

export function Ball() {
  return (
    <mesh position={[0, BALL_RADIUS, 0]}>
      <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
      <meshStandardMaterial color={BALL_COLOR} />
    </mesh>
  )
}