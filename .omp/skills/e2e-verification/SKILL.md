---
name: e2e-verification
description: Verifica una feature implementada ejecutando sus casos de uso en el browser real (no mocks), contra el backend real. Loguea ✓/✗/bug por UC, clasifica los bugs encontrados (cosmético/lógico/de modelo) y actualiza el checklist. Use después de implementar una feature o parte de ella, con los use cases como guion. NOT para escribir tests automatizados — eso va en la implementación. NOT para features sin use cases documentados.
---

# E2E Verification

## Overview

Ejecuta los casos de uso de una feature **literalmente en el browser real** — contra el backend real, con datos reales — y reporta qué cumple, qué no, y qué bugs apareció. Los tests unitarios verifican lógica con mocks; esta skill verifica **integración**: reactividad de la DB, portales, hydration, orden de datos, fidelidad visual.

**Principio central:** los mocks de los tests asumen el comportamiento que deberían verificar. Un test que mockea `useQuery` con datos ya ordenados no puede detectar que la query real ordena mal. Solo el browser contra el backend real ve eso.

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
| `docs/[feature]/03-use-cases.md` | El guion: qué ejecutar y qué esperar | La skill no puede correr sin guion — detener y pedir que se generen |
| `docs/[feature]/04-checklist.md` | Dónde se registran los resultados | Registrar los resultados en el use-cases doc mismo |
| App corriendo (`pnpm dev` + `npx convex dev`) | El entorno a verificar | Levantar ambos antes de empezar |
| Credenciales de login (si aplica) | Acceso a la app | Pedir al usuario |

## Core Process

### Fase 1: Preparar Entorno

1. **Levantar servidores** (si no están corriendo)
   - Usar la versión de Node definida en `.nvmrc` (si vitest falla con `styleText` de `node:util`, el Node es viejo)
   - `pnpm dlx convex dev` en una terminal (background)
   - `pnpm dev` en otra terminal (background)
   - Verificar que ambos responden antes de continuar
   - NO limitar el output con algo como `head -10`

2. **Abrir el browser**
   - Navegar a la URL de entrada (ej: `http://localhost:3000/dashboard`)
   - Setear viewport desktop (ej: 1440x900) — el default puede ser angosto y deformar la UI
   - Loguear si la app lo requiere
      - email: `david@gmail.com`
      - pass: `david12345`
   - Si post login queda "colgado" en un spinner, recargar la página y esperar que cargue el dashboard
   - Si vuelve a pasar, revisar la consola del browser y el output de `convex dev` para ver si hay errores de backend
   - Si sigue pasando, pedir al usuario que arregle intente levantarlo por su cuenta (la skill no puede fixearlo)

3. **Cargar el guion**
   - Leer los use cases de la feature
   - Identificar: happy paths, edge cases, gaps resueltos
   - Ordenar la ejecución: happy paths primero, edge cases después (los edge cases pueden dejar estado sucio)

### Fase 2: Ejecutar el Guion

4. **Ejecutar cada UC literalmente**
   - El "Dado/Cuando/Entonces" mapea 1:1 a acciones de browser: Dado = setup, Cuando = acción (click/type/drag), Entonces = verificación (texto visible, estado del DOM, persistencia)
   - Verificar **persistencia real**: después de cada mutation, recargar la página y confirmar que el dato sobrevivió. La reactividad de Convex puede mostrar el dato optimistamente aunque la mutation haya fallado
   - Tomar screenshots en los puntos visuales clave (comparar contra los HTML de referencia de Stitch si existen)
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

## Pitfalls Técnicos (leídos de sangre)

Estos son errores reales cometidos durante la verificación E2E de este proyecto. Codificados para no repetirlos:

### Browser automation
- **`confirm()` nativo bloquea el click**: registrar el handler ANTES de la acción (`page.once('dialog', d => d.accept())`) o usar la tool de manejo de diálogos. El click queda esperando hasta que el diálogo se resuelva
- **Elementos con `opacity: 0` hasta hover** (ej: drag handles): hacer `hover()` previo o el click/drag no se activa
- **Drag & drop necesita movimiento gradual**: `mouse.down()` → mover en pasos de ~60ms → `mouse.up()`. Un salto directo no activa los sensores de dnd-kit
- **Portales rompen el hit-testing**: un elemento del portal puede estar "tapado" por elementos de la página según Playwright aunque visualmente esté encima. Si el click por locator falla con "intercepts pointer events", hacer el click via `page.evaluate` (JS click)
- **Selectores genéricos matchean el primer elemento del DOM**: `button:has(span:text-is("delete"))` matchea la PRIMERA card, no la que querés. Scoping al contenedor (`.card-inset-ghost button...`) o usar refs del snapshot
- **Dropdowns en portal son toggle**: dos clicks lógicos seguidos = abierto y cerrado. Preferir click por ref del snapshot sobre locators por texto
- **Distinguir datos reales de estado temporal**: un input del ghost row con valor "99" matchea "lista de montos". Verificar contra el backend (recargar) antes de concluir que algo se creó

### Entorno
- **Node viejo rompe vitest**: si `vitest` falla con `styleText` de `node:util`, usar el Node del `.nvmrc` (`export PATH="$HOME/.nvm/versions/node/vXX/bin:$PATH"`)
- **Fechas en tests**: `toISOString().split("T")[0]` es UTC — después de las 21:00 en UTC-3 es "mañana". Usar helper local (`getFullYear/getMonth/getDate`)

### Verificación de datos
- **El dato optimista no es el dato persistido**: Convex actualiza la UI antes de confirmar la mutation. Para verificar persistencia real: recargar y re-leer
- **El orden de la lista puede no ser el orden visual**: verificar el orden tras un reload, no solo en la primera renderización

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "Los tests pasan, no hace falta verificar en browser" | Los tests mockean justo lo que esta skill verifica: reactividad, portales, hydration, orden real de la DB. Esta skill encontró 4 bugs que 76 tests verdes no veían |
| "Lo pruebo yo manualmente rápido" | El valor no es solo probar: es ejecutar los UCs como guion y dejar registro de qué se verificó y qué bugs saltaron. El manual sin registro no escala entre sesiones |
| "Los bugs que encontré los fixeo de una" | Un bug de modelo fixeado directo genera un parche sobre un diseño roto. Clasificar primero: cosmético/lógico se fixea, de modelo se debate |
| "Verifico solo los happy paths" | Los edge cases son donde aparecen los bugs de integración (portales, click-outside, estado sucio). Esta skill encontró el bug del portal justamente en un edge case |
| "El screenshot se ve bien, listo" | El screenshot verifica lo visual. La persistencia se verifica recargando. Son dos verificaciones distintas |
| "Uso la sesión de implementación para verificar" | Sesión fresca = contexto fresco. La verificación en sesión nueva además valida que la feature funciona sin el contexto de quien la escribió |

## Red Flags

- Verificar sin los use cases a mano (improvisás el guion y te salteás casos)
- Marcar un UC como ✅ sin verificar persistencia (solo el estado optimista)
- Fixear un bug de modelo sin debatir antes con el usuario
- No registrar los resultados en el checklist (la verificación sin registro no sirve para la próxima sesión)
- Correr los edge cases antes que los happy paths (dejan estado sucio que contamina los happy paths)
- Asumir que un click fallido del automation es un bug de la app (puede ser un pitfall del hit-testing — verificar con JS click)
- Verificar con datos de prueba que el usuario no sabe que fueron creados/modificados (avisar siempre qué datos se tocan)
- Cerrar la sesión de verificación sin el PAUSE POINT de clasificación de bugs

## Verification

- [ ] Servidores corriendo (convex dev + next dev) con el Node del .nvmrc
- [ ] Login realizado (si aplica) y viewport desktop seteado
- [ ] Use cases cargados como guion
- [ ] Happy paths ejecutados antes que edge cases
- [ ] Cada UC tiene resultado registrado (✓/✗/bug)
- [ ] Persistencia verificada con reload después de cada mutation
- [ ] Screenshots tomados en los puntos visuales clave
- [ ] Bugs clasificados: cosmético / lógico / de modelo
- [ ] PAUSE POINT de clasificación ejecutado con el usuario
- [ ] Checklist actualizado con sección "Verificación E2E"
- [ ] Se avisó al usuario qué datos de prueba se crearon/modificaron/eliminaron
