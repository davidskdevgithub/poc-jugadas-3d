Primera feature de la PoC de visualización 3D de jugadas de fútbol 8.
Es la base de todo: define el modelo de datos de la jugada (el contrato
que van a consumir playback, camera y timeline-ui) y renderiza la escena
en la cancha 3D.

En esta feature NO hay controles de reproducción (son de `playback/`) ni
presets de cámara (son de `camera/`). La escena se renderiza en el tiempo
actual que viene del store de playback, que en esta feature arranca en 0
y no se mueve — para el E2E de esta feature, la escena estática en t=0 es
el entregable.

Decisiones de modelo que tomo:
- **Dos equipos.** Sin rivales no hay errores defensivos ni espacios, que
  son exactamente lo que la PoC tiene que validar. Fútbol 8 completo:
  8 vs 8 (con arquera incluida en cada equipo).
- **Keyframes completos, no sparse.** Cada keyframe incluye a todas las
  jugadoras y la pelota. La interpolación es lineal entre keyframes
  consecutivos. Simple, suficiente para la PoC.
- **Unidades en metros, origen en el centro de la cancha.** x a lo largo,
  z a lo ancho, y hacia arriba.

La cancha tiene que ser Estática y decorativa. 
Cancha completa de fútbol 8 (~50 x 30 m),
plano verde oscuro con líneas reglamentarias simplificadas: perímetro,
línea media, círculo central, áreas y puntos penal. Las líneas son
planas sobre el piso (no muros, no vallas). No tiene datos ni estado:
es un objeto fijo de la escena.

**Jugadoras:** por el momento las representamos concilindros bajos 
(disco con algo de altura, ~1.8m de alto visual no — representación 
simple, altura fija baja) color por equipo:
equipo propio en verde oscuro, rival en blanco. El número se
muestra encima de cada cilindro.

**Pelota:** esfera blanca — la legibilidad de posición manda sobre el realismo. Su altura (y) se interpola igual quex y z.

**Fuera de scope de esta feature:** controles de reproducción y scrub
(playback), rotación/zoom de cámara y presets (camera), cualquier UI 2D
(timeline-ui), edición de posiciones (excluido de la PoC).