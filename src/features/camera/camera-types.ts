/**
 * Contrato de la feature camera — dueña del modo de vista y de la jugadora
 * seleccionada. Entry point oficial `@/features/camera/camera-types` (Decisión H).
 */

/** Modo de vista: cámara libre (default) o uno de los tres presets (UC-05..09). */
export type ViewMode = 'free' | 'cenital' | 'oblicua' | 'jugadora'
