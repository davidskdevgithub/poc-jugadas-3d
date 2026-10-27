import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, type ComponentRef } from 'react'
import { usePlaybackStore } from '@/features/playback/playback-store'
import { playMock } from '@/features/scene'
import { getPositionsAtTime } from '@/features/scene/utils'
import { useCameraStore } from '../camera-store'
import {
  CAMERA_FOV,
  CENITAL_POSE,
  clampPanTarget,
  FREE_LIMITS,
  getFpvPose,
  INITIAL_POSE,
  OBLICUA_POSE,
  type CameraPose,
} from '../utils'

// ComponentRef resuelve el tipo de three-stdlib a través del .d.ts de drei
// (three-stdlib NO es importable directo: pnpm no hoistea deps transitivas).
type OrbitControlsImpl = ComponentRef<typeof OrbitControls>

/**
 * Rig de cámara: dueño de la cámara y sus modos. Libre por defecto con
 * OrbitControls (rotación drag izq, zoom scroll, pan drag der — UC-01..04) y
 * límites; los presets se aplican por frame desde utils/presets (cambio
 * directo, sin transición — UC-09). El evento 'start' de OrbitControls solo
 * dispara con input del usuario, nunca con las poses programáticas: con
 * preset activo, mover la cámara vuelve a libre en ese mismo gesto (UC-08,
 * UC-C4) y la cámara queda donde el usuario la dejó.
 *
 * Decisión D: el modo se lee con getState() dentro de useFrame; React nunca
 * re-renderiza por frame. El update() de OrbitControls de drei corre en
 * prioridad −1; este useFrame (prioridad 0) escribe después, así la pose del
 * preset es la que llega al render del frame.
 *
 * Salida de preset por input real (UC-08, UC-C4): se detecta arrastre real
 * (> umbral desde el pointerdown) o scroll sobre el canvas, no el pointerdown
 * en sí — un click simple (p.ej. para seleccionar jugadora, UC-G1) no saca
 * del preset. La salida corta el seguimiento en el mismo gesto: OrbitControls
 * sigue atendiendo el gesto ya en modo libre, sin pelear con la pose.
 */

/** Menos que esto entre pointerdown y pointermove es un click, no un arrastre. */
const DRAG_THRESHOLD_PX = 3

export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const domElement = gl.domElement
    let downAt: { x: number; y: number } | null = null
    const exitToFree = () => {
      const { viewMode, setViewMode } = useCameraStore.getState()
      if (viewMode !== 'free') setViewMode('free')
    }
    const onPointerDown = (e: PointerEvent) => {
      downAt = { x: e.clientX, y: e.clientY }
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!downAt) return
      if (
        Math.abs(e.clientX - downAt.x) > DRAG_THRESHOLD_PX ||
        Math.abs(e.clientY - downAt.y) > DRAG_THRESHOLD_PX
      ) {
        downAt = null
        exitToFree()
      }
    }
    const onPointerUp = () => {
      downAt = null
    }
    // El scroll siempre es intención de zoom (aunque esté clampeado) → sale.
    const onWheel = () => exitToFree()
    domElement.addEventListener('pointerdown', onPointerDown)
    domElement.addEventListener('pointermove', onPointerMove)
    domElement.addEventListener('pointerup', onPointerUp)
    domElement.addEventListener('pointercancel', onPointerUp)
    domElement.addEventListener('wheel', onWheel)
    return () => {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointercancel', onPointerUp)
      domElement.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  useFrame((state) => {
    const controls = controlsRef.current
    if (!controls) return
    const { viewMode } = useCameraStore.getState()

    if (viewMode === 'free') {
      // Clamp del pan a cancha + margen (UC-G5): solo si el pan desbordó.
      const [x, y, z] = clampPanTarget([controls.target.x, controls.target.y, controls.target.z])
      if (x !== controls.target.x || z !== controls.target.z) {
        controls.target.set(x, y, z)
        state.camera.lookAt(x, y, z)
      }
      return
    }

    let pose: CameraPose | null
    if (viewMode === 'cenital') pose = CENITAL_POSE
    else if (viewMode === 'oblicua') pose = OBLICUA_POSE
    else {
      // jugadora: posición interpolada del instante actual + pelota
      // (UC-07 en pausa/scrub; UC-C1 seguimiento al reproducir; UC-C3 salto a t=0).
      const { currentTime } = usePlaybackStore.getState()
      const positions = getPositionsAtTime(playMock, currentTime)
      const { selectedPlayerId } = useCameraStore.getState()
      pose = getFpvPose(positions, selectedPlayerId, playMock.players)
    }
    if (!pose) return
    state.camera.position.set(...pose.position)
    controls.target.set(...pose.target)
    state.camera.lookAt(...pose.target)
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={INITIAL_POSE.position} fov={CAMERA_FOV} near={0.5} far={300} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        // Sin damping: sin inercia residual que pelee con las poses de preset (PoC sin suavizado).
        enableDamping={false}
        minDistance={FREE_LIMITS.minDistance}
        maxDistance={FREE_LIMITS.maxDistance}
        maxPolarAngle={FREE_LIMITS.maxPolarAngle}
      />
    </>
  )
}
