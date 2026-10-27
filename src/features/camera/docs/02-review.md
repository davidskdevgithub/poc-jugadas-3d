# Review: cámara — orbital libre + presets (cenital, oblicua, desde jugadora)

## Resumen (10 segundos)
- **Qué describe:** cuarta feature de la PoC — cámara orbital libre (default) y tres presets de vista, con selector mínimo
- **Estado:** completa — 5 gaps identificados, todos resueltos

## Definido por el usuario ✅
- Cámara libre por defecto al cargar la app (reemplaza la pose provisional de App.tsx, gap 6 del review de scene)
- OrbitControls: rotación (drag izquierdo), zoom (scroll), pan (drag derecho)
- Límites: zoom mínimo ve toda la cancha, máximo a nivel de jugadoras; clamp de polar angle (no mirar desde abajo de la cancha)
- El "gap central" de la narrativa ya está resuelto en su propio texto: mover la cámara con un preset activo lo desactiva y vuelve a libre — sin estado "preset desincronizado"; el estado siempre ∈ libre | cenital | oblicua | jugadora
- Presets: cenital (perpendicular al centro, pizarra táctica), oblicua (esquina elevada ~45°, vista de análisis), desde jugadora (posición actual de la jugadora, mirando a la pelota)
- Desde jugadora: sigue frame a frame mientras reproduce, mantiene la mirada en la pelota; en pausa/scrub se posiciona en la jugadora del instante actual; sin suavizado
- Sin transiciones animadas (cambio directo); UI del selector no prioritaria (tres botones provisionales)
- Fuera de scope: grabación de vistas, múltiples cámaras, transiciones, UI elaborada del selector, edición de posiciones

## Inferido por la IA ⚡
- Store de la feature con `viewMode` y `selectedPlayerId` (Decisión D — zustand, suscripción por selector)
- `utils/presets.ts` puro (Decisión C): cálculo de posiciones/targets sin three, testeable con Vitest (Decisión F)
- OrbitControls de drei (ya en stack); App.tsx deja de pasar la prop `camera` al `<Canvas>`
- lookAt a la posición 3D de la pelota (incluye su altura `y` de `BallPosition`)
- Selector 2D mínimo como componente de la feature, montado por App en el overlay

## Gaps a resolver ❓

### 1. Selección de jugadora (gap marcado en la narrativa)
**Qué falta:** mecanismo para elegir qué jugadora.
**Por qué importa:** sin mecanismo, el preset "desde jugadora" no es demostrable.
**Opciones:** click sobre la jugadora en la escena / botones con número de camiseta / tecla cíclica.
**Sugerencia:** click — el gesto natural del CT, no agrega UI; scene ya escribe en un store ajeno (playback-store).
**Respuesta:** Click sobre la jugadora en la escena. Default mientras no hay selección: arquera (nº 1).

### 2. Cuerpo propio en la vista FPV
**Qué falta:** con la cámara a altura de ojo dentro del cilindro (1.2 m), el número billboardeado (y=2.0) queda frente a la vista.
**Por qué importa:** ensucia la experiencia "ver la jugada desde adentro" que es el punto del preset.
**Opciones:** ocultar la malla propia mientras el preset está activo / offset sobre el hombro (tercera persona) / dejar tal cual.
**Sugerencia:** ocultar — FPV limpia.
**Respuesta:** Ocultar la malla propia mientras el preset está activo — scene necesita conocer la jugadora seleccionada.

### 3. Orientación de cenital y oblicua
**Qué falta:** desde qué esquina se ve la oblicua y qué lado queda arriba en la cenital.
**Por qué importa:** define el encuadre que el CT interpreta (dirección de ataque).
**Opciones:** esquina propia + ataque propio hacia arriba / oblicua lateral (banda) / cualquier esquina.
**Sugerencia:** esquina propia — la clásica de pizarra de análisis.
**Respuesta:** Oblicua desde esquina propia; cenital con el ataque propio hacia arriba.

### 4. Pan sin límites
**Qué falta:** la narrativa define límites de zoom y polar pero no menciona el pan.
**Por qué importa:** el CT (no técnico) puede perder la cancha en el demo.
**Opciones:** pan libre / clamp del target al rectángulo de la cancha + margen.
**Sugerencia:** clamp — misma decisión ya tomada para zoom y polar.
**Respuesta:** Clamp del target al rectángulo de la cancha + margen.

### 5. Nombre: carpeta `camara/` vs `camera/`
**Qué falta:** architecture.md (árbol global + Decisión C) y App.tsx dicen `camera/`; la carpeta existía como `camara/`.
**Por qué importa:** afecta nombres de tipos y store, y dejaba el doc de arquitectura desviado.
**Opciones:** renombrar a `camera/` + código en inglés / mantener `camara/` en español.
**Sugerencia:** renombrar hoy — gratis ahora, churn después.
**Respuesta:** Renombrar a `camera/` (hecho en este review); código en inglés: `camera-types.ts`, `useCameraStore`, `viewMode`.

## Notas de implementación
- `viewMode`: `free | cenital | oblicua | jugadora`
- `presets.ts` retorna posición + target por preset: cenital/oblicua fijos (calculados desde las dimensiones de la cancha y el fov), desde jugadora derivado de `getPositionsAtTime` + altura de ojo
- Click en jugadora: Player escribe `setSelectedPlayerId(id)` en `useCameraStore` (mismo patrón que scene ya usa con playback-store)
- Ocultar malla propia solo con `viewMode === 'jugadora'` y para `selectedPlayerId`
- Pan: clamp del target; polar: clamp de ángulo; zoom: min/max distance
- App.tsx: quitar la prop `camera` del `<Canvas>` — la cámara libre pasa a ser dueña del default