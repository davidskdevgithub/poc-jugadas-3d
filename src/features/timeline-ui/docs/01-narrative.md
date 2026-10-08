Tercera feature de la PoC. Playback ya provee el store (currentTime,
playing, seek) y scene ya reacciona al tiempo. Esta feature es la capa
2D que el usuario toca: la línea de tiempo con scrub y los botones de
play/pausa. Es el primer contacto real del CT con la PoC — de su
usabilidad depende gran parte de la hipótesis de "fácil de usar".

En esta feature NO hay lógica de tiempo (el store es de playback/) ni
cámara (camera/). Es una feature de UI pura sobre el store existente.

Barra de control fija en la parte inferior de la pantalla (overlay sobre
el canvas, no debajo): botón play/pause a la izquierda, línea de tiempo
ocupando el resto del ancho.

- Botón play/pause: ícono `play_arrow` / `pause` de Material Symbols,
  toggle — mismo botón cambia según `playing`.
- Línea de tiempo: barra horizontal con progreso relleno (color accent)
  sobre fondo neutro. Sin marcas de keyframes en esta feature (gap
  pendiente del glosario — ver review).

## Comportamiento

- **Scrub:** arrastre sobre la línea de tiempo llama a `seek(t)`.
  Mientras se arrastra, el tiempo sigue al cursor en tiempo real (la
  escena reacciona durante el arrastre, no solo al soltar) — es la
  interacción que más usa el CT para inspeccionar un instante exacto.
- **Click directo** en cualquier punto de la barra: seek a ese instante,
  sin necesidad de arrastrar.
- **Play/pause** llama a `toggle()` del store. El ícono refleja el
  estado actual.
- El progreso relleno y la posición del cursor derivan de `currentTime`
  — suscripción por selector (Decisión D), la UI se re-rendera con el
  tiempo pero la escena no.

## Estilo

Overlay semitransparente oscuro con blur sutil, coherente con la
estética de la PoC (oscuro, accent violeta). Controles con contraste
suficiente para proyectarse en una pantalla de reunión — es el contexto
de uso real del CT.

## Fuera de scope

Marcas de keyframes en la línea (gap pendiente), control de velocidad,
tiempo numérico restante/transcurrido (a confirmar en review), edición
de la jugada, presets de cámara.