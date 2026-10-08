# Ejemplo de referencia: feature compuesta (composición con features previas)

> **Qué demuestra este ejemplo:** cómo estructurar los UCs cuando la feature nueva agrega superficie que interactúa con features ya implementadas. Escenario real de este proyecto: `timeline-ui` (botones + scrubber) sobre `playback` (store de tiempo ya implementado, con trigger temporal de espacio en App).
>
> Los archivos `01-narrative.md` / `02-review.md` de timeline-ui son ilustrativos — la estructura es lo que importa.

# Casos de Uso: timeline-ui (composición con playback)

**Narrativa fuente:** `src/features/timeline-ui/docs/01-narrative.md` (ilustrativo)
**Review fuente:** `src/features/timeline-ui/docs/02-review.md` (ilustrativo)
**Fecha:** [fecha]

---

## Happy Path

*(los UCs propios de la feature van acá con el formato estándar — este ejemplo solo muestra la sección de composición)*

## Composición con features previas

### UC-C1: Drag del scrubber mientras la jugada se reproduce
**Dado** la jugada reproduciendo a mitad (t ≈ 5 de 12) y el scrubber visible
**Cuando** se arrastra el handle hasta t = 8 y se suelta
**Entonces** el tiempo queda en 8 y la reproducción continúa desde ahí — la ráfaga de seeks del drag respeta el clamp y no pausa la reproducción
**Superficie** UI: drag del handle del scrubber → `seek()` por movimiento

### UC-C2: Soltar el drag exactamente al final con la jugada reproduciendo
**Dado** la jugada reproduciendo y un drag del scrubber en curso
**Cuando** se suelta el drag en t = 12
**Entonces** la reproducción termina pausada en el final — mismo contrato que seek a t = D mientras reproduce (UC-E3 de playback)
**Superficie** UI: drag del scrubber → `seek(12)`

### UC-C3: Botón play reemplaza al trigger temporal de espacio
**Dado** la jugada pausada a mitad y la UI de timeline-ui montada
**Cuando** se hace click en el botón play
**Entonces** la reproducción arranca desde el instante actual — mismo contrato que el espacio hoy; si se mantiene el keydown de espacio, ambas superficies disparan el mismo `toggle()` sin doble-disparo (UC-E5 de playback)
**Superficie** UI: click en botón play → `toggle()`

---

## Convenciones usadas en este ejemplo

1. **El Dado describe el estado de ambas features** ("la jugada reproduciendo a mitad **y** el scrubber visible") — el Entonces es el contrato combinado, no el de una sola.
2. **Superficie siempre es UI nueva → acción de la feature previa.** Esa cadena explícita es el mapping que la verificación E2E ejecuta.
3. **Cross-references a UCs previos:** UC-C2 no re-define el contrato de fin — lo referencia (UC-E3 de playback). La feature previa no se re-verifica entera; el checklist de timeline-ui registra los resultados y playback queda con cross-reference.
4. **Superseded:** si timeline-ui reemplaza el trigger de espacio de App, en el doc de playback se marca: "UC-G3 — superseded por UC-C3 de timeline-ui". No se borra: los docs de UCs son historia del guion y la marca evita que una sesión futura ejecute un UC que ya no aplica.