import { Canvas } from '@react-three/fiber'
import { CameraRig, ViewModeSelector } from '@/features/camera'
import { PlaybackDriver } from '@/features/playback'
import { TimelineUi } from '@/features/timeline-ui'
import { Scene } from '@/features/scene'

/**
 * Composición raíz: monta el Canvas R3F y la escena. Única pieza que conoce
 * ambas capas (arquitectura, §1). Monta el driver de playback (único clock de
 * avance, corre en useFrame), el rig de cámara —dueño del default y de los
 * modos de vista— y los overlays 2D: selector de vista y barra timeline-ui.
 */
export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas>
        <color attach="background" args={['#10151c']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[25, 45, 20]} intensity={1.2} />
        <PlaybackDriver />
        <CameraRig />
        <Scene />
      </Canvas>
      <ViewModeSelector />
      <TimelineUi />
    </div>
  )
}