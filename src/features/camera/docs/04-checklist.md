# Checklist: cámara (orbital libre + presets)

**Casos de uso fuente:** `src/features/camera/docs/03-use-cases.md`
**Review fuente:** `src/features/camera/docs/02-review.md`
**Fecha:** 2026-10-08

---

## Pendiente

- [x] Verificación E2E en browser: presets, límites, FPV y costuras con playback — todos los UC (2026-10-08, ver abajo)
- [x] Fix de los 2 bugs de la verificación E2E (abajo) + re-verificación en browser

## Verificación E2E (browser real, 2026-10-08)

**Setup:** dev server + tab persistente; cámara leída del grafo de escena (números con tolerancia 0.01–0.05) y stores leídos por import de módulo de Vite (misma instancia). Interacciones reales (clicks Playwright) + eventos sintéticos para drags/scrub.

| UC | Resultado | Evidencia |
|---|---|---|
| UC-01 libre default | ✓ | PerspectiveCamera del grafo en `[0, 42, 38]` = `INITIAL_POSE`; cancha completa encuadrada |
| UC-02 rotación | ✓ | drag izq: pos `[−2.4, 33.6, 45.5]` → `[−46.7, 27.4, 16.6]`, radio preservado (56.6) — orbita el target |
| UC-03 zoom | ✓ | wheel: radio 70 → 15 → 4 |
| UC-04 pan | ✓ | drag der: pos se mueve, dirección de mirada idéntica (pan, no rotación) |
| UC-05 cenital | ✓ | pose exacta a `CENITAL_POSE` `[-0.5, 62.36, 0]`; botón activo; pizarra táctica |
| UC-06 oblicua | ✓ | pose exacta a `OBLICUA_POSE` `[-26.68, 31.11, 16.01]`; botón activo |
| UC-07 jugadora | ✓ | cámara exacta en o3 `[-13, 1.2, 0]` (altura de ojo), mirada a la pelota t actual |
| UC-08 mover → libre | ✓ | drag con oblicua activa → `free`, sin botón activo, cámara donde la dejó |
| UC-09 switch directo | ✓ | cenital→oblicua: pose exacta al primer frame leído, sin transición |
| UC-E1 polar clamp | ✓ | 8 drags hacia arriba: y converge a 0 (ras del piso), nunca negativo; y=4 al ir al cénit (= target.y + minDistance) |
| UC-E2 límites zoom | ✓ | zoom in converge a exactamente 4.0 y se detiene; zoom out a exactamente 70 |
| UC-E3 jugadora al final | ✓ | t=12: cámara `[-8, 1.2, -1]` = o3 final, estable entre frames |
| UC-E4 jugadora en t=0 | ✓ | cámara `[-23, 1.2, 0]` = arquera t=0, mira pelota t=0 `[-2.5, 0.5]` |
| UC-E5 malla reaparece | ✓ | flag `visible` del grupo interno de o3: `false` en modo jugadora → `true` al pasar a cenital |
| UC-G1 click selecciona | ✓ | click real sobre o3 → `selectedPlayerId: 'o3'` (click sintético no dispara el raycast de R3F: pitfall del automation, no bug) |
| UC-G2 default arquera | ✓ | sin selección, botón Jugadora → cámara en o1 (nº 1 propia) |
| UC-G3 malla oculta | ✓* | con selección explícita: grupo interno de la seleccionada `visible: false` — *bug en caso default, ver abajo |
| UC-G4 orientación | ✓ | cenital: arquera propia en x=−23 (abajo) y rival en x=23 (arriba) → ataque propio hacia arriba; oblicua desde esquina propia (x<0, z>0) |
| UC-G5 pan clamp | ✓ | target clavado exactamente en `[±28, ±18]` (25/15 + margen 3) en ambas direcciones |
| UC-G6 estructura | ✓ | `src/features/camera/` con nombres en inglés (no es E2E, verificación de repo) |
| UC-C1 follow al reproducir | ✓ | 7 muestras a 400 ms: cámara = posición interpolada de o3 (±0.05) y mirada a la pelota (dot > 0.999) en todas |
| UC-C2 scrub | ✓ | scrub 40%→70%: cámara reposeciona a o3 de t=4.8 y t=8.4, sigue en modo jugadora |
| UC-C3 play desde final | ✓ | t reinicia a 0, cámara salta a o3 t=0 y sigue (posición = interpolada al t muestreado, error < 0.001) |
| UC-C4 mover corta follow | ✓ | drag durante reproducción → `free`, cámara fija donde la dejó, la jugada siguió hasta el final natural |

**Bugs encontrados y fixeados (re-verificados en browser):**

1. 🐛→✓ **lógico (latente):** UC-G3 con arquera *default* (`selectedPlayerId: null`) — `player.tsx` solo ocultaba cuando `selectedPlayerId === id`, así que la arquera default no se ocultaba. Latente: backface culling ocultaba el cilindro y la pelota nunca pasa detrás de la arquera (min x de pelota: −2.5 vs arquera en −23), pero con otros datos el número billboard de la arquera aparecería en el FPV. **Fix:** regla única `defaultFpvPlayerId(players)` en `utils/presets.ts` (la misma que usa `getFpvPose`); `Player` oculta a la dueña del FPV, seleccionada o default. Re-verificado: modo jugadora sin selección → grupo de o1 `visible: false`, FPV limpio.
2. 🐛→✓ **lógico (menor):** el `onStart` de OrbitControls se dispara con el `pointerdown` aunque no haya arrastre — un click simple sobre el canvas con un preset activo lo desactivaba (UC-08 dice *mover* la cámara, no tocarla). **Fix:** el rig detecta gesto real con listeners de pointer (pointerdown → move > 3px → salida en el mismo gesto; wheel sale siempre) y ya no usa `onStart`. Re-verificado: click sin arrastre en cenital mantiene el modo; drag y scroll siguen saliendo a libre (UC-08) y cortando el follow (UC-C4).

**Cambio de comportamiento derivado del fix 2:** con un preset activo, click sobre otra jugadora ahora la selecciona y el FPV se re-apunta a ella en el mismo modo (antes el click tiraba a libre y la selección quedaba para la próxima activación, UC-G1). Coherente con "el estado activo siempre es uno y es consistente"; los use cases no lo contemplaban explícitamente.

## Hecho

- [x] Store de cámara: `camera-types.ts` + `useCameraStore` — `viewMode` ∈ {libre, cenital, oblicua, jugadora} y `selectedPlayerId` con default arquera (nº 1) — UC-G2, UC-G6
- [x] Presets puros en `utils/presets.ts`: cenital y oblicua calculados desde la cancha, con la orientación decidida (esquina propia, ataque propio hacia arriba en cenital) — UC-G4
- [x] Cámara libre con OrbitControls: default al cargar, rotación (drag izq), zoom (scroll) y pan (drag der) con límites — zoom mínimo/máximo, polar clampeado al ras del piso, pan clampeado a cancha + margen — UC-01 a UC-04, UC-E1, UC-E2, UC-G5
- [x] Selector mínimo de tres botones con estado activo y cambio directo entre presets, sin transición animada — UC-05, UC-06, UC-09
- [x] Salida de preset al mover la cámara manualmente: vuelve a libre y corta el seguimiento en el mismo frame — UC-08, UC-C4
- [x] Click sobre una jugadora en la escena la selecciona (Player escribe en el store de cámara, patrón scene → playback-store) — UC-G1
- [x] Vista desde jugadora: cámara en la posición de la jugadora del instante actual mirando la pelota — pausada, al final (posición estable) y en t=0 — UC-07, UC-E3, UC-E4
- [x] Seguimiento frame a frame y costuras con playback: follow durante reproducción con mirada en la pelota que se mueve, scrub reposiciona sin salir del modo, play desde el final salta a la jugadora en t=0 — UC-C1, UC-C2, UC-C3
- [x] Malla propia oculta durante el modo jugadora (sin cilindro ni número flotante) y reaparece al salir — UC-G3, UC-E5
- [x] Integración en App: prop `camera` del `<Canvas>` eliminada (la cámara libre es dueña del default) y selector montado en el overlay — UC-01, UC-G6
- [x] Tests de presets y límites al lado del archivo (Decisión F): orientación y valores de presets, clamp de target/polar/zoom en ambos extremos — UC-E1, UC-E2, UC-G4, UC-G5
