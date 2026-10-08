# Casos de Uso: playback (store de tiempo + avance)

**Narrativa fuente:** `src/features/playback/docs/01-narrative.md`
**Review fuente:** `src/features/playback/docs/02-review.md`
**Fecha:** 2026-10-07

---

## Happy Path

### UC-01: Espacio inicia la reproducción desde el inicio
**Dado** la app cargada con la jugada cargada (duration ≈ 12 s), el tiempo en 0 y la reproducción pausada
**Cuando** se presiona espacio
**Entonces** la reproducción arranca y el tiempo avanza a velocidad 1x — la escena se anima desde el keyframe t=0

### UC-02: Espacio pausa a mitad de jugada
**Dado** la reproducción corriendo en un instante intermedio (t ≈ 5)
**Cuando** se presiona espacio
**Entonces** la reproducción se pausa y el tiempo queda congelado en el instante exacto — la escena queda estática en esa posición

### UC-03: Reanudar desde donde quedó
**Dado** la reproducción pausada a mitad de jugada (t ≈ 5, por pausa o por seek)
**Cuando** se presiona espacio
**Entonces** la reproducción continúa desde ese instante — no reinicia desde 0

### UC-04: Seek a un instante mientras reproduce
**Dado** la reproducción corriendo en t ≈ 5
**Cuando** se hace seek a t = 8
**Entonces** el tiempo pasa al nuevo instante y la reproducción sigue corriendo desde ahí — no se pausa ni reinicia

### UC-05: La jugada cargada fija la duración
**Dado** la app recién montada, antes de que exista jugada en el store
**Cuando** la escena monta la jugada mock
**Entonces** `duration` queda fijada con la duración de la jugada (≈ 12 s) — a partir de ahí el clamp de seek y el fin de reproducción tienen rango real

## Edge Cases

### UC-E1: Seek con instante negativo
**Dado** la jugada cargada y la reproducción pausada
**Cuando** se hace seek a un t menor que 0
**Entonces** el tiempo queda clampeado en 0 y la reproducción sigue pausada

### UC-E2: Seek más allá del final
**Dado** la jugada cargada con duración D y la reproducción pausada
**Cuando** se hace seek a un t mayor que D
**Entonces** el tiempo queda clampeado en D y la reproducción sigue pausada

### UC-E3: Seek exactamente al final mientras reproduce
**Dado** la reproducción corriendo
**Cuando** se hace seek a t = D (duración)
**Entonces** la reproducción termina: queda pausada en el instante final, como si hubiera llegado al final avanzando

### UC-E4: Play sin jugada cargada
**Dado** el store recién inicializado con `duration` en 0 (la escena todavía no montó la jugada)
**Cuando** se intenta reproducir (play, o espacio antes de la carga)
**Entonces** no hay reproducción: el estado queda en pausa y el tiempo en 0

### UC-E5: Play cuando ya está reproduciendo
**Dado** la reproducción corriendo a mitad de jugada
**Cuando** se vuelve a disparar play (doble espacio)
**Entonces** no hay cambio: sigue reproduciendo desde donde estaba, sin reinicio ni avance duplicado

## Escenarios de gaps resueltos

### UC-G1: Pausa al llegar al final (gap 1)
**Dado** la reproducción corriendo cerca del final (t ≈ 11.9 de ≈ 12 s)
**Cuando** el tiempo alcanza la duración
**Entonces** la reproducción termina en pausa: el estado pasa a pausado y el tiempo queda exactamente en la duración — sin overshoot, sin loop, sin volver a 0

### UC-G2: Play desde el final reinicia (gap 1)
**Dado** la reproducción terminada (tiempo en la duración, pausado al final)
**Cuando** se presiona espacio
**Entonces** el tiempo vuelve a 0 y la reproducción arranca desde el inicio — el trigger nunca queda muerto tras terminar

### UC-G3: Espacio como trigger sin UI (gap 3)
**Dado** la app sin ninguna UI de timeline (esta feature no tiene botones)
**Cuando** se presiona espacio con la jugada en cualquier estado
**Entonces** alterna entre reproducir y pausar, y la página no scrollea — trigger temporal hasta que timeline-ui lo reemplace

### UC-G4: Delta clampeado al volver de background (gap 4)
**Dado** la reproducción corriendo a mitad de jugada con la pestaña en background varios segundos (rAF pausado)
**Cuando** se vuelve a la pestaña
**Entonces** la jugada continúa desde donde estaba — el primer delta se clampea y el tiempo no salta al final ni termina de golpe

### UC-G5: La duración la fija Scene al montar (gap 2)
**Dado** la feature implementada
**Cuando** se inspecciona quién fija `duration` en el store
**Entonces** la fija la escena al montar la jugada (dueña de `playMock`) — App no importa data ni fija duración, y la acción de carga vive en el store de playback