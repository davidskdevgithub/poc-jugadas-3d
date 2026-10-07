---
name: use-cases
description: Genera casos de uso en formato "dado/cuando/entonces" a partir de una narrativa y sus respuestas de review. Cada escenario cubre un comportamiento específico de la feature. Use después de narrative-review para tener los escenarios antes de implementar.
---

# Use Cases

## Overview

Genera casos de uso en formato **"dado / cuando / entonces"** a partir de una narrativa y las respuestas del review. Cada escenario cubre un comportamiento específico que debe ser testeado.

**Flujo:**
```
Narrativa + review responses → casos de uso → guían implementación y tests
```

## When to Use

- Se completó `narrative-review` y se tienen las respuestas
- Se quiere tener los escenarios antes de implementar
- Se quiere verificar cobertura de tests contra comportamiento documentado
- NOT para: features que no tienen narrative-review completado

## Inputs

| Archivo | Rol |
|---|---|
| Narrativa del usuario | Comportamiento descrito |
| Review con respuestas | Decisiones tomadas |

## Core Process

1. **Leer narrativa + review**
   - Identificar cada regla de negocio
   - Identificar cada gap resuelto (la respuesta define el comportamiento)
   - Identificar edge cases de la narrativa

2. **Generar escenarios**
   - Por cada regla → al menos 1 escenario happy path
   - Por cada gap resuelto → 1 escenario que valide la decisión
   - Por cada edge case → 1 escenario de borde
   - Format: **Dado** [contexto] **Cuando** [acción] **Entonces** [resultado esperado]

3. **Presentar al usuario**
   - Lista de escenarios para validar
   - El usuario confirma, agrega o elimina

4. **Guardar**
   - Guardar en `src/features/{feature}/docs/03-use-cases.md`

## Formato de Output

```markdown
# Casos de Uso: [Feature/Componente]

**Narrativa fuente:** [ruta]
**Review fuente:** [ruta]
**Fecha:** [fecha]

---

## Happy Path

### UC-01: [Nombre del escenario]
**Dado** [contexto inicial]
**Cuando** [acción del usuario o sistema]
**Entonces** [resultado esperado]

### UC-02: ...

## Edge Cases

### UC-E1: [Nombre del edge case]
**Dado** [contexto]
**Cuando** [situación borde]
**Entonces** [comportamiento esperado]

## Escenarios de gaps resueltos

### UC-G1: [Nombre]
**Dado** [contexto del gap]
**Cuando** [situación]
**Entonces** [lo que se decidió en el review]
```

## Ejemplos de referencia

Los siguientes archivos contienen ejemplos reales de Reviews bien escritos. Usalos como guía de razonamiento, no como template:

- [example-uc-1.md](./example-uc-1.md) — Totales del Dashboard con Happy Path, Edge Cases y Gaps resueltos


## Reglas

1. **Un escenario = un comportamiento** — no meter múltiples assertions
2. **Formato consistente** — siempre Dado/Cuando/Entonces
3. **Sin código** — el escenario describe comportamiento, no implementación
4. **Cada gap resuelto tiene su escenario** — validar que la decisión se implementó
