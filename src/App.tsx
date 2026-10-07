import { Canvas } from '@react-three/fiber'
import { Scene } from '@/features/scene'

/**
 * Composición raíz: monta el Canvas R3F y la escena. Única pieza que conoce
 * ambas capas (arquitectura, §1).
 *
 * La pose oblicua es el encuadre por defecto provisorio (gap 6 del review de
 * scene): se reemplaza cuando exista la feature `camera/`, sin tocar scene.
 */
export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Canvas camera={{ position: [0, 42, 38], fov: 45, near: 0.5, far: 300 }}>
        <color attach="background" args={['#10151c']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[25, 45, 20]} intensity={1.2} />
        <Scene />
      </Canvas>
    </div>
  )
}