Cuarta y última feature de la PoC. La escena se reproduce y se controla;
falta el pilar del análisis táctico: mirar la jugada desde distintos
puntos de vista. Esta feature implementa la cámara orbital libre y los
tres presets: cenital, oblicua y desde jugadora.

En esta feature NO hay lógica de tiempo (consume currentTime del store
de playback) ni lógica de la escena (lee posiciones vía la utilidad de
interpolación de scene/).

## Cámara libre

- OrbitControls de drei: rotación (drag izquierdo), zoom (scroll) y
  pan (drag derecho) sobre la escena.
- Es el modo por defecto al cargar la app.
- Límites: zoom mínimo que ve toda la cancha, zoom máximo a nivel de
  jugadoras. Sin límites de rotación (la cámara puede ir bajo el piso
  se resuelve con un clamp de polar angle — no permitir mirar desde
  abajo de la cancha).

## Modos de vista

Tres presets seleccionables — la UI del selector es mínima en esta
feature (tres botones provisionales; su diseño final no es prioridad
para la validación — lo que se valida es el punto de vista resultante,
no el selector):

- **Cenital:** cámara perpendicular sobre el centro de la cancha,
  mirando hacia abajo. Ve las posiciones como en una pizarra táctica.
- **Oblicua:** cámara elevada en una esquina, ángulo ~45° — la vista
  clásica de video de análisis. Útil para profundidad y espacios.
- **Desde jugadora:** cámara en la posición de una jugadora en el
  instante actual, mirando hacia la pelota. Requiere elegir qué
  jugadora (ver gap).

## Comportamiento entre modos (gap central)

Seleccionar un preset posiciona la cámara según el preset. Mover la
cámara manualmente (rotar/zoom/pan) mientras un preset está activo
**desactiva el preset** y vuelve a cámara libre — no hay estado de
"preset desincronizado". El estado activo siempre es uno de:
libre | cenital | oblicua | jugadora.

## Vista desde jugadora — comportamiento

- **Sigue a la jugadora:** mientras la jugada se reproduce, la cámara
  permanece en la posición de la jugadora frame a frame y mantiene la
  mirada en la pelota. Es la experiencia "ver la jugada desde adentro"
  — si fuera estática, el jugador saldría de cuadro enseguida.
- Mientras la jugada está pausada o en scrub, la cámara se posiciona
  en la jugadora del instante actual.
- No hay suavizado complejo en la PoC: la cámara sigue la posición
  interpolada directamente.

## Fuera de scope

Grabación de vistas, múltiples cámaras simultáneas, transiciones
animadas entre presets (la PoC cambia directo), cualquier UI elaborada
del selector, edición de posiciones.