# Review: playback 01-narrative

## Resumen (10 segundos)
- **Qué describe:** store de playback — dueño de `currentTime`, `playing` y `duration` — más la lógica de avance (driver en `useFrame`, 1x, seek con clamp)
- **Estado:** completa — 4 gaps identificados, todos resueltos

## Definido por el usuario ✅
- Estado: `currentTime` (arranca en 0), `playing` (arranca en false), `duration` (se fija al cargar la jugada)
- Acciones: `play()` / `pause()` / `toggle()`; `seek(t)` clampea a [0, duration]
- Avance 1x con el delta de frames, dentro de `useFrame` de un driver mínimo dentro del Canvas — sin `setInterval` ni rAF propios: un solo clock sincronizado con el render loop
- Desacople: playback no conoce scene; único acoplamiento permitido: ambos consumen `Play.duration` de scene-types
- `seek` mientras reproduce: sigue reproduciendo desde el nuevo punto
- Sin control de velocidad (1x fijo), sin cuenta regresiva, sin marcadores de keyframes
- Fuera de scope: UI 2D (timeline-ui), cámara (camera), edición de posiciones
- La propia narrativa marca un gap a resolver acá: comportamiento al llegar a `duration`

## Inferido por la IA ⚡
- Extender `playback-store.ts` in place — ya es entry point consumido por scene (gap 2 del review de scene)
- Driver en `playback/components/`, exportado por un `index.ts` nuevo; App lo monta dentro del `<Canvas>` junto a `<Scene />` (App es la capa de composición, arquitectura §1)
- Trigger de espacio: keydown listener temporal en `App.tsx` (composición); los botones de timeline-ui lo reemplazan después
- Lectura/escritura del store con `getState()`/`set()` dentro de `useFrame` (Decisión D): hoy nadie se suscribe reactivamente a `currentTime`, así que el write por frame no re-renderiza React
- `toggle()` = `playing ? pause() : play()`

## Gaps a resolver ❓

### 1. Comportamiento al llegar a `duration` (gap marcado en la narrativa)
**Qué falta:** "la reproducción termina" admite loop, stop o pausa; y falta qué hace `play()` cuando el tiempo ya está al final.
**Por qué importa:** define la transición central del store y si el trigger de reproducción queda muerto tras terminar.
**Opciones:** pausa al final (queda en `duration`, play reinicia desde 0) / loop infinito / stop (vuelve a 0).
**Sugerencia:** pausa al final — comportamiento de video-player; el CT analiza la posición final y el botón nunca queda muerto.
**Respuesta:** Pausa al final: `playing=false`, `currentTime` queda en `duration`. `play()` desde el final reinicia desde 0.

### 2. ¿Quién fija `duration` y con qué acción?
**Qué falta:** "se fija al cargar la jugada" no define acción de carga ni quién la llama. `playMock` es interno de scene — App no puede importarlo (Decisión H).
**Por qué importa:** sin `duration` el clamp de seek es [0, 0] y el driver no sabe cuándo terminar.
**Opciones:** Scene llama al montar (dueña de `playMock`, ya importa el store) vs App compone la carga (exportando `playMock` por el barrel de scene).
**Sugerencia:** Scene al montar — no expande el entry point de scene hacia data.
**Respuesta:** Scene al montar: acción `setDuration(d)`; Scene la llama con `playMock.duration` al montarse.

### 3. Trigger sin UI: ¿quién llama a `play()`?
**Qué falta:** el entregable son acciones que nadie llama — sin UI no hay forma de disparar el avance en browser (Decisión F).
**Por qué importa:** sin trigger, el comportamiento de avance no es demostrable al CT ni verificable.
**Opciones:** tecla espacio (keydown → toggle) / autoplay al cargar / solo consola (exponer el store en window).
**Sugerencia:** tecla espacio — trigger interactivo mínimo sin UI.
**Respuesta:** Tecla espacio: keydown listener temporal → `toggle()`. Los botones de timeline-ui lo reemplazan después.

### 4. Delta gigante al volver de una pestaña en background
**Qué falta:** con rAF pausado, el primer delta al volver puede ser de varios segundos: `t += dt` salta y la jugada "termina de golpe".
**Por qué importa:** en el demo ante el CT parece un bug; define el cálculo de avance del driver.
**Opciones:** clampear el delta (máx ~0.1 s por frame) vs delta real (1x estricto por reloj de pared).
**Sugerencia:** clampear — una línea, evita el salto.
**Respuesta:** Clamp del delta (máx 0.1 s): al volver, la jugada continúa desde donde estaba.

## Notas de implementación
- Fin de reproducción: al cruzar `duration`, `set({ currentTime: duration, playing: false })` — clamp sin overshoot por floating point; mismo clamp exacto en `seek`
- `play()` desde el final (`currentTime === duration`): reinicia y reproduce en un solo `set`
- Guard del driver: no avanza si `!playing` o `duration === 0` (antes de cargar la jugada, play no tiene efecto)
- `setDuration(d)` es idempotente — Safe bajo StrictMode (doble montaje de Scene)
- Delta clampeado en el driver: `dt = Math.min(dt, 0.1)`
- Trigger espacio en App: `preventDefault` para no scrollear la página