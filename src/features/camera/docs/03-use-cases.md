# Casos de Uso: cámara (orbital libre + presets)

**Narrativa fuente:** `src/features/camera/docs/01-narrative.md`
**Review fuente:** `src/features/camera/docs/02-review.md`
**Fecha:** 2026-10-08

---

## Happy Path

### UC-01: Cámara libre por defecto al cargar
**Dado** la app cargada con la feature camera montada (escena y playback ya montadas)
**Cuando** se observa la pantalla sin interactuar
**Entonces** la cámara está en modo libre con los controles orbitales activos y el encuadre inicial muestra la cancha completa — ya no la pose provisional de App.tsx (UC-G6 de scene)
**Superficie** Montaje de la feature (sin interacción)

### UC-02: Rotación orbital
**Dado** la cámara en modo libre
**Cuando** se arrastra con el botón izquierdo sobre el canvas
**Entonces** la cámara orbita alrededor de la escena manteniendo el centro de la cancha como referencia
**Superficie** UI: drag izquierdo sobre el canvas

### UC-03: Zoom con scroll
**Dado** la cámara en modo libre
**Cuando** se hace scroll sobre el canvas
**Entonces** la cámara se acerca o aleja suavemente respecto del target
**Superficie** UI: scroll sobre el canvas

### UC-04: Pan con drag derecho
**Dado** la cámara en modo libre
**Cuando** se arrastra con el botón derecho sobre el canvas
**Entonces** el encuadre se desplaza (target) sin rotar la vista
**Superficie** UI: drag derecho sobre el canvas

### UC-05: Preset cenital posiciona
**Dado** la cámara en cualquier modo y la jugada pausada
**Cuando** se hace click en el botón "Cenital"
**Entonces** la cámara queda perpendicular sobre el centro de la cancha mirando hacia abajo — la jugada se ve como pizarra táctica — y el botón queda en estado activo
**Superficie** UI: click en botón "Cenital" → `setViewMode('cenital')`

### UC-06: Preset oblicua posiciona
**Dado** la cámara en cualquier modo y la jugada pausada
**Cuando** se hace click en el botón "Oblicua"
**Entonces** la cámara queda elevada a ~45° mirando la cancha — la vista clásica de video de análisis — y el botón queda en estado activo
**Superficie** UI: click en botón "Oblicua" → `setViewMode('oblicua')`

### UC-07: Preset jugadora posiciona en el instante actual
**Dado** la jugada pausada a mitad y una jugadora seleccionada
**Cuando** se hace click en el botón "Jugadora"
**Entonces** la cámara queda en la posición de esa jugadora en el instante actual (`currentTime` del store de playback) mirando hacia la pelota — sin suavizado, posición interpolada directa
**Superficie** UI: click en botón "Jugadora" → `setViewMode('jugadora')`

### UC-08: Mover la cámara con un preset activo vuelve a libre
**Dado** un preset activo (cenital, oblicua o jugadora)
**Cuando** se mueve la cámara manualmente (rotar, zoom o pan)
**Entonces** el preset se desactiva — ningún botón queda activo — y el estado vuelve a cámara libre, con la cámara donde el usuario la dejó; no existe estado "preset desincronizado"
**Superficie** UI: drag/scroll sobre el canvas con preset activo

### UC-09: Cambio directo entre presets
**Dado** un preset activo
**Cuando** se hace click en otro botón del selector
**Entonces** la cámara se reposiciona según el nuevo preset, en el mismo frame — sin transición animada (fuera de scope en la PoC)
**Superficie** UI: clicks en los botones del selector

## Edge Cases

### UC-E1: Polar angle clampeado — la cámara no va bajo el piso
**Dado** la cámara en modo libre
**Cuando** se arrastra la rotación sostenidamente hacia abajo
**Entonces** la cámara se frena al llegar al ras del piso y nunca mira desde abajo de la cancha
**Superficie** UI: drag izquierdo sostenido hacia abajo

### UC-E2: Límites de zoom
**Dado** la cámara en modo libre
**Cuando** se hace scroll sostenido hacia afuera, y luego sostenido hacia adentro
**Entonces** hacia afuera se detiene cuando el encuadre alcanza a ver toda la cancha; hacia adentro se detiene a nivel de jugadoras — nada más cerca ni más lejos
**Superficie** UI: scroll sostenido en ambos sentidos

### UC-E3: Modo jugadora con la jugada terminada
**Dado** la jugada pausada al final (contrato de playback: pausa al llegar a `duration`)
**Cuando** se hace click en el botón "Jugadora"
**Entonces** la cámara queda en la posición final de la jugadora mirando la pelota final — estable, sin movimiento extra ni error
**Superficie** UI: click en botón "Jugadora" con playback en el final

### UC-E4: Modo jugadora en t=0 inicial
**Dado** la jugada recién cargada, pausada en t=0, sin haberse reproducido
**Cuando** se hace click en el botón "Jugadora"
**Entonces** la cámara queda en la posición de la jugadora en t=0 mirando la pelota de t=0
**Superficie** UI: click en botón "Jugadora" sin haber reproducido

### UC-E5: La malla propia reaparece al salir del modo jugadora
**Dado** el preset jugadora activo con la malla de la jugadora seleccionada oculta
**Cuando** se activa otro preset o se mueve la cámara manualmente (vuelve a libre)
**Entonces** la malla de la jugadora seleccionada vuelve a verse en la escena
**Superficie** UI: click en otro botón del selector / drag tras modo jugadora

## Escenarios de gaps resueltos

### UC-G1: Click sobre una jugadora la selecciona (gap 1)
**Dado** la escena renderizada con jugadoras de ambos equipos
**Cuando** se hace click sobre la malla de una jugadora
**Entonces** esa jugadora queda seleccionada — el preset "Jugadora" la usará en la próxima activación
**Superficie** UI: click sobre la jugadora en el canvas 3D → `setSelectedPlayerId(id)`

### UC-G2: Default arquera nº 1 sin selección previa (gap 1)
**Dado** la app recién cargada, sin ningún click sobre jugadoras
**Cuando** se hace click en el botón "Jugadora"
**Entonces** la cámara se posiciona en la arquera (número 1)
**Superficie** UI: click en botón "Jugadora" sin selección previa

### UC-G3: Malla propia oculta durante el modo jugadora (gap 2)
**Dado** el preset jugadora activo
**Cuando** se observa la escena desde la cámara de la jugadora
**Entonces** la malla de la jugadora seleccionada no se ve — ni el cilindro ni el número flotante frente a la vista; FPV limpia
**Superficie** UI: activar modo jugadora y observar

### UC-G4: Orientación de cenital y oblicua (gap 3)
**Dado** la jugada del mock con dirección de ataque propia definida
**Cuando** se activa la vista cenital y luego la oblicua
**Entonces** en cenital el ataque propio apunta hacia arriba de la pantalla; la oblicua está elevada en una esquina propia (~45°) — la orientación decidida en el review
**Superficie** UI: activar "Cenital" y "Oblicua" y observar

### UC-G5: Pan clampeado a la cancha + margen (gap 4)
**Dado** la cámara en modo libre
**Cuando** se arrastra el pan sostenidamente hacia afuera del campo
**Entonces** el target se frena al límite de la cancha más margen — la escena nunca se pierde del encuadre
**Superficie** UI: drag derecho sostenido hacia afuera

### UC-G6: La feature vive en `src/features/camera/` con nombres en inglés (gap 5)
**Dado** la feature implementada
**Cuando** se busca su ubicación y nombres en el código
**Entonces** vive en `src/features/camera/` (carpeta renombrada desde `camara/`) con `camera-types.ts`, `useCameraStore` y `utils/presets.ts` — consistente con architecture.md (Decisión C) y los cross-references de las otras features
**Superficie** Estructura del repo (no es verificación E2E)

## Composición con features previas

### UC-C1: Seguimiento frame a frame durante la reproducción
**Dado** la jugada reproduciendo (trigger de timeline-ui o espacio) y el preset jugadora activo
**Cuando** el tiempo avanza frame a frame
**Entonces** la cámara permanece en la posición de la jugadora frame a frame — sin suavizado ni retardo visible — y mantiene la mirada en la pelota mientras esta se mueve
**Superficie** UI: botón play de timeline-ui (o espacio) con modo jugadora activo

### UC-C2: Scrub durante el modo jugadora
**Dado** el preset jugadora activo con la jugada pausada
**Cuando** se arrastra el scrubber de timeline-ui a otro instante y se suelta
**Entonces** la cámara se reposiciona en la jugadora del nuevo instante y la mirada pasa a la pelota de ese instante — sin salir del modo ni desincronizarse
**Superficie** UI: drag del handle del scrubber → `seek()`

### UC-C3: Play desde el final con modo jugadora activo
**Dado** la jugada pausada en el final y el preset jugadora activo
**Cuando** se dispara la reproducción (espacio o botón play)
**Entonces** playback reinicia desde 0 reproduciendo (UC-G2 de playback) y la cámara salta a la posición de la jugadora en t=0 y sigue frame a frame — no se queda mirando el final
**Superficie** UI: espacio o botón play → `play()`

### UC-C4: Mover la cámara manualmente mientras reproduce corta el seguimiento
**Dado** la jugada reproduciendo y el preset jugadora activo
**Cuando** se mueve la cámara manualmente (rotar, zoom o pan)
**Entonces** el modo vuelve a libre (UC-08) y el seguimiento se detiene en ese frame: la cámara queda donde el usuario la dejó mientras la jugada sigue avanzando
**Superficie** UI: drag/scroll durante reproducción con modo jugadora activo