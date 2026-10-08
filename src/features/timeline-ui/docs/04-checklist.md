# Checklist: timeline-ui

**Casos de uso fuente:** `src/features/timeline-ui/docs/03-use-cases.md`
**Review fuente:** `src/features/timeline-ui/docs/02-review.md`
**Fecha:** 2026-10-08

---

## Pendiente

- (nada — verificado E2E el 2026-10-08, ver sección "Verificación E2E")

## Hecho

- [x] Setup visual: token `--color-accent` en `@theme` de index.css + Material Symbols por CDN en index.html — UC-G3, UC-G4
- [x] Barra de control: overlay fijo abajo (blur oscuro semitransparente, contraste para proyector), play/pause a la izquierda + línea al resto, sin marcas de keyframes — UC-01 a UC-03, UC-E4
- [x] Botón play/pause: toggle del store, ícono `play_arrow`/`pause` según estado — UC-01, UC-02
- [x] Trigger de espacio migrado a timeline-ui (App pierde el listener, guard de `e.repeat`, sin scroll) — UC-G2, UC-E3, UC-C3
- [x] Botón nunca muerto: play desde el final reinicia desde 0; sin jugada cargada → no-op — UC-C4, UC-E2
- [x] Línea: relleno accent + cursor derivados de `currentTime`/`duration` por selector (Decisión D) — UC-05
- [x] Click directo en la barra: seek al instante con clamp de extremos — UC-03, UC-E1
- [x] Scrub por drag: seek por movimiento, escena reacciona en tiempo real — UC-04, UC-C5
- [x] Contrato drag ↔ reproducción: pausa al arrastrar, reanudar al soltar solo si estaba reproduciendo, soltar en t = D queda pausado al final (sin reinicio) — UC-C1, UC-C2, UC-G1
- [x] Tiempo numérico "0:07 / 0:12" en vivo junto a la línea — UC-06

## Verificación E2E

**Fecha:** 2026-10-08 · **Sesión fresca de verificación** (browser real contra `pnpm dev` / Vite v8, Node v22.14.0 del `.nvmrc`, viewport 1440×900)

### Resultados por UC

| UC | Descripción | Resultado |
|----|-------------|-----------|
| UC-01 | Play desde t≈5 arranca sin reiniciar, ícono → `pause` | ✅ (t=5.029 al clickear, no vuelve a 0) |
| UC-02 | Pause congela el instante exacto, ícono → `play_arrow` | ✅ (20 muestras en 1 s, delta exacto 0) |
| UC-03 | Click directo → seek a ese instante | ✅ (click al 66.7% → t=8.000 exacto; relleno y cursor saltan) |
| UC-04 | Drag sigue al cursor en tiempo real | ✅ (8 pasos muestreados: 1.13→2.25→…→9.00, cada movimiento, no solo al soltar) |
| UC-05 | Progreso/cursor derivan de `currentTime` | ✅ (50 muestras: ratio relleno y cursor = 8.333 %/s constante = 100/12; crecimiento monótono) |
| UC-06 | "0:07 / 0:12" en vivo | ✅ (durante reproducción: 0:02→0:03→0:04; durante scrub: actualiza por paso) |
| UC-E1 | Click/drag fuera de extremos → clamp | ✅ (drag −40px → t=0, fill 0%; drag +40px reproduciendo → t=12, fill 100%, queda pausado; sin NaN) |
| UC-E2 | Play sin jugada (duration=0) → no-op | ✅ (p=false, línea "0%", texto "0:00 / 0:00", sin crash; duration restaurada a 12) |
| UC-E3 | Espacio sostenido: repeats ignorados, sin scroll | ✅ con limitación (guard `e.repeat` verificado con 6 keydowns `repeat:true` sintéticos; auto-repeat del SO no reproducible por CDP) |
| UC-E4 | Línea sin marcas de keyframes | ✅ (3 hijos: fondo/relleno/cursor; 0 elementos tick; screenshot limpia) |
| UC-G1 | Drag con pausado queda pausado al soltar | ✅ (suelta en 50% → t=6, p=false) |
| UC-G2 | Espacio dueño de timeline-ui, toggle único | ✅ (false→true→false, un cambio por press; App sin listener propio — código verificado) |
| UC-G3 | Glifos Material Symbols por CDN | ✅ (`document.fonts.check` true, familia correcta, glifo renderizado en screenshot) |
| UC-G4 | Relleno con token `--color-accent` | ✅ (computed `rgb(139, 92, 246)` = token `#8b5cf6` resuelto) |
| UC-C1 | Drag reproduciendo: pausa al arrastrar, reanuda al soltar | ✅ (down en t=4 → p=false; durante: tiempos exactos por cursor 5/6/7/8; up → p=true desde t=8) |
| UC-C2 | Soltar en t=D reproduciendo → pausado al final | ✅ (14 muestras/700 ms: t=12 constante, nunca playing, sin reinicio a 0) |
| UC-C3 | Botón y espacio, mismo toggle sin doble disparo | ✅ (click/space/click/space → true/false/true/false estricto) |
| UC-C4 | Play desde el final reinicia desde 0 | ✅ (t=12 → clic → t=0.017, playing, ícono `pause`) |
| UC-C5 | La escena reacciona durante el scrub | ✅ (control de determinismo: 2 shots sin interacción idénticos; t=3 vs t=6 durante drag → pixels diferentes; drag sostenido sin mover → idénticos, sin deriva) |

### Bugs encontrados

- **Ninguno de la aplicación.** Comportamiento íntegro: los 19 UCs cumplen.

### Eventos de entorno y limitaciones del instrumento (registrados)

1. **Suspensión del sistema a mitad de sesión** (la notebook entró en reposo): produjo huecos del sampler, reads de `dataset` obsoletos (valor fantasma 10.47), `page.screenshot` colgado ×2 y un press de Space tragado/duplicado (lectura `p:true` inesperada en la celda de UC-E4). Artefactos atribuidos al entorno: el re-test controlado con sistema despierto muestra un press = un toggle exacto y el control de determinismo pasa. Ninguna medición positiva depende de la ventana contaminada (UC-C4/C5 se re-verificaron limpios tras reload).
2. **`tab.run` corre en mundo aislado** (no ve `window.__store`): se resolvió con un mirror del store en `dataset` del `<html>` (30 ms, main world).
3. **Idle-freeze del tab entre turnos** congela intervals/rAF: despertar con un helper directo antes de trabajo de página cruda; ante sesión CDP colgada, recargar.
4. **UC-E2 literal:** la ventana pre-monte (`duration=0`, capturada por init script: 10 muestras + `duration-set` a los 745 ms) es inalcanzable para un clic automatizado post-carga; se ejecutó el estado equivalente a nivel store (`setDuration(0)`) con el trigger UI real.
5. **Click literal fuera del rect del track** (UC-E1) cae en otros nodos del overlay (hit-testing): el clamp se ejercitó con click en bordes exactos + drag más allá de los extremos (mismo contrato del store).
6. El browser gestionado corrió headless pese a `headed: true` (decisión del harness); la fidelidad visual se documenta con screenshots.

### Pendiente de verificación

- (nada)