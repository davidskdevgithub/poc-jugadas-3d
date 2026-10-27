import { useCameraStore } from '../camera-store'
import type { ViewMode } from '../camera-types'

const MODES: { mode: ViewMode; label: string }[] = [
  { mode: 'cenital', label: 'Cenital' },
  { mode: 'oblicua', label: 'Oblicua' },
  { mode: 'jugadora', label: 'Jugadora' },
]

/**
 * Selector provisional de vista (tres botones; su diseño no es prioridad —
 * se valida el punto de vista resultante, no el selector). Activo = el modo
 * del store (UC-05..07, UC-09); libre no tiene botón (se vuelve a él moviendo
 * la cámara — UC-08).
 */
export function ViewModeSelector() {
  const viewMode = useCameraStore((s) => s.viewMode)
  const setViewMode = useCameraStore((s) => s.setViewMode)

  return (
    <div className="fixed left-4 top-4 z-10 flex select-none gap-2">
      {MODES.map(({ mode, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => setViewMode(mode)}
          className={`cursor-pointer rounded px-3 py-1.5 text-sm backdrop-blur-sm transition-colors ${
            viewMode === mode ? 'bg-accent text-white' : 'bg-black/60 text-white/70 hover:bg-black/80'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
