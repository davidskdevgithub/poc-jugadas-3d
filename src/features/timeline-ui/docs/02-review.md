# Review: timeline-ui

## Resumen (10 segundos)
- **Qué describe:** Overlay 2D inferior — botón play/pause + línea de tiempo con scrub, sobre el store de `playback/`.
- **Estado:** Completa — 6 gaps identificados, todos resueltos.

## Definido por el usuario ✅
- Overlay fijo abajo, sobre el canvas: play/pause a la izquierda, línea ocupando el resto del ancho.
- Botón toggle con íconos Material Symbols (`play_arrow` / `pause`) según `playing`.
- Scrub en tiempo real (la escena reacciona durante el arrastre) y click directo = seek.
- Progreso y cursor derivan de `currentTime` por suscripción por selector (Decisión D).
- Estilo: overlay oscuro semitransparente con blur, accent violeta, contraste para proyector.
- Fuera de scope: marcas de keyframes, velocidad, edición, presets de cámara.
- API del store verificada: `usePlaybackStore` con `currentTime`/`playing`/`duration`/`toggle`/`seek` ya cubre clamp, fin de jugada y no-op sin jugada.

## Inferido por la IA ⚡
- Ubicación: `src/features/timeline-ui/components/` (arquitectura §1, módulo patrón — la carpeta aún no existe).
- Barrel `index.ts` como entry point público (Decisión H); consumo del store por `@/features/playback/playback-store`.
- `duration` viene del store (lo fija `Scene` al montar con `setDuration`); la línea usa ese valor para el fracción de progreso.
- Tests `*.test.tsx` al lado del componente (Decisión F — UI 2D sí lleva test).
- Input por pointer events (cubre mouse + touch en el mismo handler).

## Gaps a resolver ❓

### 1. Tiempo numérico visible o no
**Qué falta:** La narrativa lo dejaba "a confirmar en review".
**Por qué importa:** Cambia el layout de la barra y agrega un nodo que re-renderiza por frame.
**Opciones:** Sin número / transcurrido y total / solo transcurrido.
**Sugerencia:** Transcurrido/total — ayuda al CT a comunicar instantes.
**Respuesta:** ✅ Transcurrido / total ("0:07 / 0:12" pequeño junto a la barra), re-render aislado por selector.

### 2. Scrub mientras reproduce
**Qué falta:** El driver avanza `currentTime` por frame y `seek` escribe el mismo campo — no estaba definido quién gana durante el arrastre.
**Por qué importa:** Sin regla, la escena tiembla entre cursor y driver mientras se arrastra con play activo.
**Opciones:** Pausar al arrastrar y reanudar al soltar / seguir reproduciendo con seek pisando / throttle por frame.
**Sugerencia:** Pausar al arrastrar — comportamiento estándar de video players.
**Respuesta:** ✅ Pausar al arrastrar, reanudar al soltar (si estaba pausado, queda pausado).

### 3. Dueño del atajo Space
**Qué falta:** El toggle por Space vive en `App.tsx` y su comentario decía que timeline-ui lo reemplazaría — la narrativa no lo menciona.
**Por qué importa:** Decide si la feature queda dueña de todo el control de playback o App retiene el listener de window.
**Opciones:** Migrar a timeline-ui en esta feature / dejarlo en App por ahora.
**Sugerencia:** Dejarlo en App (listener de window = composición).
**Respuesta:** ✅ Migrar a timeline-ui ahora — la feature queda dueña de todo el control de playback; App deja de conocer `toggle`.

### 4. Íconos Material Symbols no cargados
**Qué falta:** La narrativa pide Material Symbols pero ninguna fuente de íconos está referenciada en el proyecto.
**Por qué importa:** Sin la fuente, los íconos no renderizan.
**Opciones:** CDN en index.html / SVG inline / caracteres unicode.
**Sugerencia:** CDN — coincide con la narrativa.
**Respuesta:** ✅ CDN de Material Symbols en index.html.

### 5. "Accent violeta" sin token
**Qué falta:** No existe ningún token de color en el proyecto (`index.css` no define `@theme`).
**Por qué importa:** Sin fuente única, cada feature copia o diverge del hex (la escena ya hardcodea colores).
**Opciones:** Token en `@theme` en index.css / hex inline.
**Sugerencia:** Token — primer pieza del design system.
**Respuesta:** ✅ Token `--color-accent` en `@theme` de index.css (Tailwind v4 genera `bg-accent`/`text-accent`).

### 6. Gap de marcas de keyframes en el glosario
**Qué falta:** La narrativa dice "sin marcas en esta feature" y derivaba el gap del glosario al review.
**Por qué importa:** Define si el glosario lo considera cerrado o sigue abierto.
**Opciones:** Cerrar como fuera de la PoC / dejar pendiente.
**Sugerencia:** Cerrar.
**Respuesta:** ✅ Queda pendiente para una feature futura — el glosario mantiene el gap abierto por si el CT pide ver los beats.

## Notas de implementación
- Pausar-al-arrastrar: la feature recuerda si estaba reproduciendo antes del drag y llama a `play()` al soltar — no toca el store ni el driver.
- `duration === 0` (sin jugada montada): la línea renderiza vacía y `seek` no-op del store cubre el resto.
- `App.tsx` pierde el listener de Space y el comentario sobre reemplazo; el trigger pasa a timeline-ui.
- El ícono numérico/formateo "0:07 / 0:12" se resuelve en implementación (util local de la feature).