---
name: e2e-verification
description: Verifica una feature implementada ejecutando sus casos de uso en el browser real (no mocks), contra el backend real. Loguea ✓/✗/bug por UC, clasifica los bugs encontrados (cosmético/lógico/de modelo) y actualiza el checklist. Use después de implementar una feature o parte de ella, con los use cases como guion. NOT para escribir tests automatizados — eso va en la implementación. NOT para features sin use cases documentados.
---

# E2E Verification

## Overview

Ejecuta los casos de uso de una feature **literalmente en el browser real** — contra el sistema real del proyecto (el backend/storage que exista), con datos reales — y reporta qué cumple, qué no, y qué bugs apareció. Los tests unitarios verifican lógica con mocks; esta skill verifica **integración**: reactividad del estado real (store, DB, backend — lo que exista), portales, hydration, orden de datos, fidelidad visual.

**Principio central:** los mocks de los tests asumen el comportamiento que deberían verificar. Un test que mockea `useQuery` con datos ya ordenados no puede detectar que la query real ordena mal. Solo el browser contra el sistema real ve eso.

**Flujo:**
```
Use cases (guion) + app corriendo → ejecutar UC por UC en browser → reporte ✓/✗/bug → bugs clasificados → checklist actualizado
```

**Esta skill no fixea nada.** Su output es el reporte y la clasificación. El fix puede ser directo (bug cosmético/lógico) o volver al pipeline (bug de modelo → nueva narrativa) — esa decisión es del usuario.

## When to Use

- Se implementó una feature (o parte) que tiene use cases documentados
- Los tests unitarios pasan pero falta verificar integración real
- Se quiere validar fidelidad visual contra los diseños de referencia
- NOT para: features sin use cases → primero generarlos con la skill `use-cases`
- NOT para: escribir tests automatizados → eso es parte de la implementación
- NOT para: fixear lo que se encuentra → la skill reporta, el usuario decide

## Inputs

| Archivo/Recurso | Rol | Si no existe |
|---|---|---|
| `README.md` | Intro del proyecto | La skill interpreta en base a la información disponible |
| `src/features/[feature]/docs/03-use-cases.md` | El guion: qué ejecutar y qué esperar | La skill no puede correr sin guion — detener y pedir que se generen |
| `src/features/[feature]/docs/04-checklist.md` | Dónde se registran los resultados | Registrar los resultados en el use-cases doc mismo |
| App corriendo (`pnpm dev`) | El entorno a verificar | Levantar antes de empezar |

## Core Process

### Fase 1: Preparar Entorno

1. **Levantar servidores** (si no están corriendo)
   - Usar la versión de Node definida en `.nvmrc` (si vitest falla con `styleText` de `node:util`, el Node es viejo)
   - `pnpm dev` en una terminal (background)
   - Verificar que responde
   - NO limitar el output con algo como `head -10`

2. **Abrir el browser**
   - Navegar a la URL de entrada (ej: `http://localhost:5173/`)
   - Setear viewport desktop (ej: 1440x900) — el default puede ser angosto y deformar la UI
   - Si post devuelve errores o queda "colgado" en un spinner, recargar la página y esperar que cargue.
   - Si vuelve a pasar, revisar la consola del browser y el output de la terminal.
   - Si sigue pasando, pedir al usuario que intente levantarlo por su cuenta (la skill no puede fixearlo)

3. **Cargar el guion**
   - Leer los use cases de la feature
   - Identificar: happy paths, edge cases, gaps resueltos
   - Ordenar la ejecución: happy paths primero, edge cases después (los edge cases pueden dejar estado sucio)

### Fase 2: Ejecutar el Guion

4. **Ejecutar cada UC literalmente**
   - El "Dado/Cuando/Entonces" mapea 1:1 a acciones de browser: Dado = setup, Cuando = acción (click/type/drag), Entonces = verificación (texto visible, estado del DOM, persistencia)
   - Un UC a la vez. Si un UC falla, anotarlo y continuar (el fallo puede ser causa o consecuencia de otro)

5. **Registrar por UC**
   - ✅ cumple (con evidencia: qué se vio)
   - ❌ no cumple (qué se esperaba vs qué pasó)
   - 🐛 bug nuevo no cubierto por ningún UC (descripción + pasos para reproducir)

### Fase 3: Clasificar y Reportar

6. **Clasificar cada bug encontrado**
   - **Cosmético:** visual, no afecta datos ni lógica (ej: un popup recortado). Fix directo.
   - **Lógico:** el comportamiento es incorrecto pero el modelo de datos está bien (ej: un click-outside que dispara la acción equivocada). Fix directo.
   - **De modelo:** el modelo de datos no soporta el comportamiento correcto (ej: un status almacenado que contradice las fechas). **No fixear directo** — requiere debate de diseño y probablemente nueva narrativa (volver al paso 3 del pipeline).

7. **Actualizar el checklist**
   - Marcar los UCs verificados con su resultado
   - Agregar sección "Verificación E2E" con fecha, qué se probó, y los bugs encontrados/corregidos
   - Listar lo que quedó pendiente de verificación

8. **Presentar el reporte**

```
📋 Verificación E2E: [Feature]

| UC | Descripción | Resultado |
|----|-------------|-----------|
| UC-01 | ... | ✅ |
| UC-E1 | ... | ✅ / 🐛 |

Bugs encontrados:
1. [descripción] — [cosmético/lógico/de modelo] — [corregido / pendiente]

Estado: [X/Y UCs verificados]
```

**PAUSE POINT: Decidir qué hacer con los bugs**

- Bugs cosméticos/lógicos → el usuario aprueba fixear en esta sesión
- Bugs de modelo → el usuario decide: fix directo o nueva narrativa (pipeline)
- Ningún bug → feature verificada, listo para commitear

## Addendum: estado conducido por frame (canvas, rAF, 3D)

Aplica cuando la feature tiene estado que avanza fuera del control de React (rAF, `useFrame`, animaciones, timelines). Los riesgos de integración cambian: no son portales ni hydration — son timing, deltas y visibilidad. Todo lo anterior sigue aplicando; esto se suma.

### Control de estado
- **Nunca yield con la state machine activa.** La tab sigue corriendo entre turnos (el idle-freeze no siempre alcanza): el próximo UC arranca del estado equivocado. Antes de cerrar una celda/turno, dejar el sistema quiescente (pausa, estado inicial) o ejecutar la secuencia completa en una celda atómica.
- **Setup determinista.** Preparar el "Dado" con acciones del store con assert del estado previo — nunca con eventos de UI "a ver qué pasa". Los eventos de UI (tecla, click) solo para el "Cuando" bajo test: un toggle accidental desde un estado no verificado ejecuta otro UC.

### Verificación de magnitudes
- "Avanza a 1x", "queda exactamente en el final", "no salta": verificar con **números y tolerancia explícita** — rate medido sobre una ventana de tiempo, igualdad exacta contra el valor esperado (`t === duration`) — no con presencia/ausencia ni un screenshot que "se ve bien".
- **Muestrear, no sondear.** Sampler dentro de la página (setInterval + lectura del store) con **buffer ≥ muestras esperadas × 2**; un cap chico deja la ventana crítica sin datos. Resetear el buffer justo antes de la ventana observada.

### Acceso al estado sin tocar código
- En Vite dev, `import('/src/.../store.ts')` desde la página devuelve **la misma instancia que usa la app**: permite un `addInitScript` que capture ventanas pre-monte (estado antes del primer render, ej: `duration = 0` antes de montar la escena) y samplers sin patchar código.
- Las ventanas pre-monte existen una sola vez por carga: si un UC aplica solo ahí, capturarlo con init script, no con reload manual.

### Instrumentos y límites del entorno
- **Desconfiar del instrumento, no de la app.** Después de instrumentar, probe (¿la app sigue respondiendo normalmente?). Instrumentos que congelan la página pueden matar la cadena de rAF al reanudar (artefacto del instrumento, no bug) → recargar antes de continuar.
- **Simulación ≠ verificación literal.** Si el entorno no reproduce la condición del UC (ej: oclusión real de tabs en headless), producir la condición equivalente a nivel app (ej: gap de rAF con la cadena intacta) y **registrar la limitación en el checklist**. Nunca reportar la simulación como si fuera el escenario literal.
- **Wording del UC vs superficie existente.** Los UCs se escriben antes de la UI: si el "Cuando" nombra una UI que no existe, mapearlo a la acción equivalente del store y anotar la interpretación en la evidencia.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Los tests pasan, no hace falta verificar en browser" | Los tests mockean justo lo que esta skill verifica: reactividad, portales, hydration, orden real de los datos. Esta skill encontró 4 bugs que 76 tests verdes no veían |
| "Lo pruebo yo manualmente rápido" | El valor no es solo probar: es ejecutar los UCs como guion y dejar registro de qué se verificó y qué bugs saltaron. El manual sin registro no escala entre sesiones |
| "Los bugs que encontré los fixeo de una" | Un bug de modelo fixeado directo genera un parche sobre un diseño roto. Clasificar primero: cosmético/lógico se fixea, de modelo se debate |
| "Verifico solo los happy paths" | Los edge cases son donde aparecen los bugs de integración (portales, click-outside, estado sucio). Esta skill encontró el bug del portal justamente en un edge case |
| "El screenshot se ve bien, listo" | El screenshot verifica lo visual. La persistencia se verifica recargando. Son dos verificaciones distintas |
| "Uso la sesión de implementación para verificar" | Sesión fresca = contexto fresco. La verificación en sesión nueva además valida que la feature funciona sin el contexto de quien la escribió |
| "El estado sigue como lo dejé cuando vuelva" | Con estado por frame (rAF), la tab sigue corriendo entre turnos — el idle-freeze no siempre alcanza. Yield con animación activa = ejecutar el próximo UC desde otro estado. Dejar quiescente o celda atómica |

## Red Flags

- Verificar sin los use cases a mano (improvisás el guion y te salteás casos)
- Marcar un UC como ✅ sin verificar persistencia (solo el estado optimista) — persistencia = el mecanismo real del proyecto (reload, storage, backend); si la app es en memoria, verificar qué sobrevive a un reload y registrar el resultado
- Fixear un bug de modelo sin debatir antes con el usuario
- No registrar los resultados en el checklist (la verificación sin registro no sirve para la próxima sesión)
- Correr los edge cases antes que los happy paths (dejan estado sucio que contamina los happy paths)
- Asumir que un click fallido del automation es un bug de la app (puede ser un pitfall del hit-testing — verificar con JS click)
- Yield con la reproducción/animación corriendo entre pasos (el estado avanza solo y el próximo UC arranca mal)
- Preparar el "Dado" con eventos de UI sin assert del estado previo (un toggle accidental ejecuta el UC equivocado)
- Reportar una simulación de entorno como si fuera el escenario literal del UC (registrar la limitación en el checklist)
- Verificar con datos de prueba que el usuario no sabe que fueron creados/modificados (avisar siempre qué datos se tocan)
- Cerrar la sesión de verificación sin el PAUSE POINT de clasificación de bugs

## Verification

- [ ] Servidores de la app corriendo (los del proyecto: dev server y backend si existen) con el Node del .nvmrc
- [ ] Use cases cargados como guion
- [ ] Happy paths ejecutados antes que edge cases
- [ ] Cada UC tiene resultado registrado (✓/✗/bug)
- [ ] Bugs clasificados: cosmético / lógico / de modelo
- [ ] PAUSE POINT de clasificación ejecutado con el usuario
- [ ] Checklist actualizado con sección "Verificación E2E"
- [ ] Se avisó al usuario qué datos de prueba se crearon/modificaron/eliminaron
- [ ] (estado por frame) Sistema quiescente antes de cada yield; setup con asserts de estado
- [ ] (estado por frame) Magnitudes verificadas con números y tolerancia; condiciones irreproducibles registradas como limitación
