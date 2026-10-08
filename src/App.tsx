import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PlaybackDriver } from '@/features/playback'
import { usePlaybackStore } from '@/features/playback/playback-store'
import { Scene } from '@/features/scene'

/**
 * Composición raíz: monta el Canvas R3F y la escena. Única pieza que conoce
 * ambas capas (arquitectura, §1). Monta el driver de playback (único clock de
 * avance, corre en useFrame) y el trigger temporal de espacio — composición
 * que timeline-ui reemplazará después.
 *
 * La pose oblicua es el encuadre por defecto provisorio (gap 6 del review de
 * scene): se reemplaza cuando exista la feature `camera/`, sin tocar scene.
 */
export default function App() {
  // Trigger temporal de espacio (UC-G3): toggle play/pausa. `e.repeat` se
  // ignora — el auto-repeat alternaría en ráfaga; `preventDefault` evita el
  // scroll de la página. App no se suscribe reactivamente (Decisión D).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return
      e.preventDefault()
      usePlaybackStore.getState().toggle()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas camera={{ position: [0, 42, 38], fov: 45, near: 0.5, far: 300 }}>
        <color attach="background" args={['#10151c']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[25, 45, 20]} intensity={1.2} />
        <PlaybackDriver />
        <Scene />
      </Canvas>
    </div>
  )
}