Segunda feature de la PoC. `scene` ya renderiza la escena como función
pura de `(play, currentTime)` — esta feature es dueña de `currentTime`:
hace que avance, se detenga y se pueda saltear. 
Es la fuente única de estado que todo lo demás consume.

En esta feature NO hay UI (la barra y los botones son `timeline-ui/`),
ni presets de cámara (`camera/`). El entregable es el store y su lógica
de avance del tiempo.

## El store (zustand)

Estado:
- `currentTime`: segundos transcurridos desde el inicio. Empieza en 0.
- `playing`: boolean. Empieza en false.
- `duration`: se fija al cargar la jugada.

Acciones:
- `play()` / `pause()` / `toggle()`
- `seek(t)`: salta a un instante. Clampea a [0, duration].

Comportamiento de avance:
- Con `playing = true`, el tiempo avanza a velocidad 1x usando el delta
  de frames. El avance corre dentro de `useFrame` de un pequeño driver
  dentro del Canvas — no con `setInterval` ni `requestAnimationFrame`
  propios: un solo clock, sincronizado con el render loop.
- La escena reacciona sola: `scene` ya lee `currentTime` del store, así
  que playback no la conoce. Único acoplamiento permitido: ambos
  consumen `Play.duration` de los types de scene.

## Comportamiento

- Al llegar a `duration` con `playing = true`: la reproducción termina
  (ver gap de review: ¿loop, stop en el final, o pausa?).
- `seek` mientras está reproduciendo: sigue reproduciendo desde el
  nuevo punto.
- No hay control de velocidad (1x fijo), ni cuenta regresiva, ni
  marcadores de keyframes en esta feature.

## Fuera de scope

Barra de progreso, botones, cualquier UI 2D (timeline-ui). Presets y
rotación de cámara (camera). Edición de posiciones (excluido de la PoC).