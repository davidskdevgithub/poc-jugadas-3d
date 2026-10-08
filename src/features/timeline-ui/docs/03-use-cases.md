# Casos de Uso: timeline-ui (composición con playback y scene)

**Narrativa fuente:** `src/features/timeline-ui/docs/01-narrative.md`
**Review fuente:** `src/features/timeline-ui/docs/02-review.md`
**Fecha:** 2026-10-08

> El gap 6 del review (marcas de keyframes en el glosario) es una decisión
> documental, sin comportamiento a implementar: su efecto visible ("la línea no
> lleva marcas") queda cubierto como UC-E4, y el gap sigue abierto en el
> glosario para una feature futura.

---

## Happy Path

### UC-01: Botón play arranca la reproducción
**Dado** la jugada cargada (duration ≈ 12 s), pausada en un instante intermedio (t ≈ 5) y la barra de control visible
**Cuando** se hace click en el botón play (ícono `play_arrow`)
**Entonces** la reproducción arranca desde ese instante — no reinicia desde 0 — y el ícono del botón pasa a `pause`
**Superficie** UI: click en botón play → `toggle()`

### UC-02: Botón pause congela en el instante exacto
**Dado** la reproducción corriendo a mitad de jugada
**Cuando** se hace click en el botón (ícono `pause`)
**Entonces** la reproducción se pausa y el tiempo queda congelado en el instante exacto — el ícono vuelve a `play_arrow`
**Superficie** UI: click en botón → `toggle()`

### UC-03: Click directo en la barra
**Dado** la jugada cargada y pausada en t ≈ 2
**Cuando** se hace click en un punto intermedio de la línea de tiempo (t ≈ 8)
**Entonces** el tiempo pasa a ese instante sin necesidad de arrastrar — el relleno y el cursor saltan a la posición del click y la escena refleja el instante
**Superficie** UI: click en la barra → `seek(t)`

### UC-04: Drag del scrubber sigue al cursor
**Dado** la jugada pausada en t ≈ 0 y la línea visible
**Cuando** se arrastra el cursor sobre la línea hasta t ≈ 9
**Entonces** el tiempo sigue al puntero en tiempo real durante todo el arrastre — el relleno y el cursor acompañan cada movimiento, no solo al soltar
**Superficie** UI: drag sobre la barra → `seek(t)` por movimiento

### UC-05: Progreso y cursor derivan de currentTime
**Dado** la reproducción corriendo
**Cuando** el tiempo avanza
**Entonces** el relleno accent crece y el cursor se desplaza en proporción al fracción `currentTime / duration` — ningún estado local duplica el tiempo
**Superficie** UI reactiva: suscripción por selector de `currentTime`/`duration` (Decisión D)

### UC-06: Tiempo numérico transcurrido / total
**Dado** la reproducción en t ≈ 7 de ≈ 12 s
**Cuando** se observa la barra de control
**Entonces** se muestra "0:07 / 0:12" junto a la línea y se actualiza en vivo con el tiempo — también durante scrub y reproducción
**Superficie** UI reactiva: suscripción por selector de `currentTime`/`duration`

## Edge Cases

### UC-E1: Click/drag más allá de los extremos
**Dado** la jugada cargada con duración D
**Cuando** se hace click (o drag) fuera de los límites de la barra — antes del inicio o después del final
**Entonces** el tiempo queda clampeado en 0 o D según el extremo — mismo contrato de clamp del store (UC-E1/E2 de playback); la UI no rompe ni muestra progreso inválido
**Superficie** UI: click/drag en extremos → `seek()` clampeado por el store

### UC-E2: Botón sin jugada cargada
**Dado** la app recién montada con `duration` en 0 (la escena todavía no montó la jugada) y la barra visible
**Cuando** se hace click en el botón play
**Entonces** no pasa nada: sigue pausado en 0, la línea renderiza vacía sin fracción infinita — el no-op es del store (UC-E4 de playback); la UI no crashea
**Superficie** UI: click en botón → `toggle()` no-op

### UC-E3: Espacio mantenido (auto-repeat)
**Dado** la tecla espacio mantenida presionada con la UI montada
**Cuando** el sistema repite el keydown
**Entonces** se dispara un único `toggle()` — los repeats se ignoran — y la página no scrollea
**Superficie** UI: tecla espacio → `toggle()` con guard de `e.repeat` + `preventDefault`

### UC-E4: Línea sin marcas de keyframes
**Dado** la jugada cargada con sus keyframes y la línea visible
**Cuando** se observa la línea de tiempo
**Entonces** no hay marcas ni ticks de keyframes — solo relleno y cursor (la decisión del gap 6 del glosario queda pendiente para una feature futura)
**Superficie** Visual: inspección de la línea

## Escenarios de gaps resueltos

### UC-G1: Drag iniciado con la jugada pausada queda pausado (gap 2)
**Dado** la jugada pausada y un drag del scrubber en curso
**Cuando** se suelta el drag en un instante intermedio
**Entonces** la jugada queda pausada en el instante soltado — "reanudar al soltar" solo aplica si estaba reproduciendo al iniciar el drag
**Superficie** UI: drag del scrubber → `seek()` por movimiento, sin `play()` al soltar

### UC-G2: Espacio migrado a timeline-ui (gap 3)
**Dado** la UI de timeline-ui montada
**Cuando** se presiona espacio con la jugada en cualquier estado
**Entonces** alterna reproducir/pausar igual que el botón — el listener vive en la feature y App ya no registra el suyo (sin doble toggle)
**Superficie** UI: tecla espacio → `toggle()`

### UC-G3: Íconos de Material Symbols (gap 4)
**Dado** la barra de control visible
**Cuando** se observa el botón play/pause
**Entonces** muestra los glifos `play_arrow`/`pause` de Material Symbols cargados por CDN en index.html — no unicode ni placeholders
**Superficie** Visual: glifo del botón

### UC-G4: Relleno con token accent (gap 5)
**Dado** la línea con progreso parcial
**Cuando** se inspecciona el color del relleno
**Entonces** usa el token `--color-accent` definido en `@theme` de index.css — no un hex copiado en el componente
**Superficie** Visual/estilo: color del relleno

## Composición con features previas

### UC-C1: Drag mientras la jugada se reproduce
**Dado** la jugada reproduciendo a mitad (t ≈ 5 de 12) y el scrubber visible
**Cuando** se inicia un drag del scrubber y se suelta en t = 8
**Entonces** al iniciar el arrastre la reproducción se pausa (el driver deja de competir con el seek — la escena sigue al cursor sin deriva) y al soltar se reanuda desde t = 8; durante el drag el tiempo avanza solo por el cursor
**Superficie** UI: drag del scrubber → `pause()` al iniciar + `seek()` por movimiento + `play()` al soltar

### UC-C2: Soltar el drag exactamente al final con la jugada reproduciendo
**Dado** la jugada reproduciendo y un drag del scrubber en curso (pausado por el drag, UC-C1)
**Cuando** se suelta el drag en t = D
**Entonces** la jugada queda pausada al final — NO se reanuda ni reinicia desde 0: el "reanudar al soltar" cede ante el contrato de seek al final (UC-E3 de playback) y ante la guard de reinicio de `play()` (UC-G2 de playback)
**Superficie** UI: drag del scrubber → `seek(D)` + guard de reanudación

### UC-C3: Botón y espacio disparan el mismo toggle
**Dado** la jugada en cualquier estado y la UI montada
**Cuando** se alterna entre click en el botón y la tecla espacio
**Entonces** ambas superficies disparan el mismo `toggle()` del store sin doble disparo ni estado duplicado (UC-E5 de playback); el trigger de espacio de App quedó reemplazado
**Superficie** UI: click en botón / tecla espacio → `toggle()`

### UC-C4: Play desde el final vía botón reinicia
**Dado** la reproducción terminada (tiempo en D, pausada al final)
**Cuando** se hace click en el botón play
**Entonces** el tiempo vuelve a 0 y arranca desde el inicio — el botón nunca queda muerto tras terminar (UC-G2 de playback) y el ícono refleja el estado
**Superficie** UI: click en botón play → `toggle()`

### UC-C5: La escena reacciona durante el scrub
**Dado** la jugada pausada a mitad y la escena 3D renderizando
**Cuando** se arrastra el scrubber por la línea
**Entonces** las posiciones de jugadoras y pelota se actualizan en tiempo real mientras el cursor se mueve — la escena consume el `currentTime` que el drag escribe, no solo el valor al soltar
**Superficie** UI: drag del scrubber → `seek()` por movimiento → escena (lectura por frame del store)