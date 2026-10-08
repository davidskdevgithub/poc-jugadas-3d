# Checklist: playback (store de tiempo + avance)

**Casos de uso fuente:** `src/features/playback/docs/03-use-cases.md`
**Review fuente:** `src/features/playback/docs/02-review.md`
**Fecha:** 2026-10-07

---

## Pendiente

- (opcional) Re-verificar UC-G4 en un browser con oclusión real de tabs — el headless no la reproduce; el clamp quedó verificado con gap de rAF real de 5 s a nivel render loop (ver Verificación E2E).

## Hecho

- [x] Acciones de reproducción en el store: `play`, `pause` y `toggle` desde cualquier estado, sin reinicios ni avances duplicados — UC-01 a UC-03, UC-E5
- [x] Seek en el store con clamp a [0, duration], en pausa y en reproducción — UC-04, UC-E1, UC-E2
- [x] Carga de duration: acción `setDuration` en el store, llamada por Scene al montar la jugada (App no fija duración ni importa data) — UC-05, UC-G5
- [x] Driver de avance dentro del Canvas: `useFrame` con delta de frames a 1x, guard que no avanza pausado ni sin jugada cargada — UC-01, UC-02, UC-E4
- [x] Fin de reproducción: pausa con el tiempo exactamente en duration al llegar al final, y play desde el final reinicia desde 0 — UC-G1, UC-G2, UC-E3
- [x] Clamp del delta al volver de background: la jugada continúa desde donde estaba, sin salto al final — UC-G4
- [x] Montaje en App: barrel de playback y driver montado dentro del `<Canvas>` junto a Scene — UC-01
- [x] Trigger temporal: espacio alterna reproduce/pausa sin scrollear la página (reemplazable por timeline-ui) — UC-G3
- [x] Tests de clamp y fin al lado del archivo: seek fuera de rango en ambos extremos, fin exacto sin overshoot, reinicio desde el final (Decisión F) — UC-E1, UC-E2, UC-G1, UC-G2
- [x] Verificación E2E en browser: reproducción/pausa/seek con espacio, pausa exacta al final, continuidad tras background — UC-01 a UC-04, UC-G1 a UC-G4

## Verificación E2E

**Fecha:** 2026-10-07 — browser real (Chromium) contra `pnpm dev` (vite, Node v22.14.0 según `.nvmrc`), viewport 1440×900, jugada mock (duration = 12 s), 0 errores de consola, 23/23 tests unitarios en verde.

| UC | Verificado | Evidencia |
|----|-----------|-----------|
| UC-01 | ✅ | Espacio → playing; avance 0.991x medido sobre 1.78 s; escena anima (screenshots t=0 vs t≈2.2 con posiciones distintas) |
| UC-02 | ✅ | Pausa en t=4.8667; 12 muestras consecutivas idénticas (t congelado, playing=false) |
| UC-03 | ✅ | Reanuda desde 4.8667 → 4.90/4.93/5.00…; sin reinicio a 0 |
| UC-04 | ✅ | seek(8) reproduciendo → t=8 exacto, playing=true, continúa 8.07/8.10/8.17… |
| UC-05 | ✅ | Log de carga: duration 0 (t=20 ms) → 12 (t=530 ms, al montar Scene) |
| UC-E1 | ✅ | seek(-3) pausado → t=0, playing=false |
| UC-E2 | ✅ | seek(99) pausado → t=12, playing=false |
| UC-E3 | ✅ | Reproduciendo, seek(12) → t=12 exacto, playing=false |
| UC-E4 | ✅ | play() con duration=0 pre-monte (init script) → no-op: queda pausado, t=0 |
| UC-E5 | ✅ | play() ×2 reproduciendo → sin reinicio (t monótono 8.0→8.5, sin avance duplicado) |
| UC-G1 | ✅ | Desde 11.9 reproduciendo → t=12 exacto (`=== duration`), pausa, sin overshoot ni loop (6 muestras estables) |
| UC-G2 | ✅ | Espacio desde terminado (t=12, pausado) → t=0, playing=true |
| UC-G3 | ✅ | Espacio alterna play/pausa (probe: `defaultPrevented=true` en cada press); scrollY=0 (página no scrolleable por layout fixed) |
| UC-G4 | ✅* | Gap de rAF de 5.02 s reproduciendo → store congelado durante el gap; primer frame post-gap avanza +0.1003 (clamp 0.1 sobre delta real ≈5 s) y sigue 1x; sin salto al final ni fin anticipado |
| UC-G5 | ✅ | grep: `setDuration` solo se llama en `scene.tsx` (efecto de montaje, `playMock.duration`); App no importa data ni fija duración |

**\*Limitación de entorno (UC-G4):** el headless no reproduce oclusión real de tabs (dos tabs, `Target.activateTarget` y modo headed dejaron la página siempre `visible`, rAF corriendo; `Page.setWebLifecycleState('frozen')` mata la cadena rAF al reanudar — artefacto del instrumento). El gap se produjo tragando callbacks de rAF durante 5 s y re-flusheándolos: la cadena sobrevive y el delta post-gap (~5 s) entra real al `advance` vía `useFrame`. Re-verificación opcional en browser con oclusión real.

**Bugs encontrados:** ninguno funcional. Observación (no bug): la tab sigue reproduciendo si queda en idle sin pausar — comportamiento esperado del driver.

**Datos tocados:** ninguno persistido — el store es en memoria; la página quedó recargada en estado pristine (t=0, pausado, duration=12).
