# Casos de Uso: Totales del Dashboard

**Narrativa fuente:** `docs/totales/01-narrativa.md`
**Review fuente:** `docs/totales-review/01-narrativa.md`
**Fecha:** 2026-09-01

---

## Happy Path

### UC-01: Mostrar balance total mensual
**Dado** un mes activo con gastos generales y una tarjeta de crédito
**Cuando** se renderiza la sección de totales
**Entonces** se muestra el Balance Total Mensual = total pagado + total pendiente, formateado como moneda

### UC-02: Calcular total pagado de gastos generales
**Dado** gastos generales del mes activo con estado efectivo `paid` (tienen `paidAt`)
**Cuando** se calcula el total pagado
**Entonces** se suma el `amount` de todos los gastos con estado efectivo `paid`

### UC-03: Calcular total pendiente de gastos generales (incluye vencidos)
**Dado** gastos generales del mes activo con estado efectivo `pending` y `overdue`
**Cuando** se calcula el total pendiente
**Entonces** se suma el `amount` de todos los gastos con estado efectivo `pending` **y** `overdue`

### UC-04: Tarjeta pagada contribuye al total pagado
**Dado** una tarjeta con estado efectivo `paid` y `totalAmount` = $150.000
**Cuando** se calcula el total pagado
**Entonces** se suma $150.000 (el `totalAmount` de la tarjeta) al total pagado

### UC-05: Tarjeta pendiente o vencida contribuye al total pendiente
**Dado** una tarjeta con estado efectivo `pending` (o `overdue`) y `totalAmount` = $200.000
**Cuando** se calcula el total pendiente
**Entonces** se suma $200.000 (el `totalAmount` de la tarjeta) al total pendiente

### UC-06: Formato de montos
**Dado** un balance total de 2768145.19
**Cuando** se renderiza el valor
**Entonces** se muestra "$2.768.145,19" (formato moneda local, `tabular-nums`)

### UC-07: Estructura visual según diseño de referencia
**Dado** la sección de totales renderizada
**Cuando** se observan los tres valores
**Entonces** se muestra: label "Balance Total Mensual" con el monto grande, card "Pagado" con ícono `check_circle` en verde, card "Pendiente (con vencidos)" con ícono `warning` en rojo

## Edge Cases

### UC-E1: Mes sin gastos ni tarjeta
**Dado** un mes activo sin gastos generales y sin tarjeta
**Cuando** se renderiza la sección de totales
**Entonces** los tres valores muestran "$0"

### UC-E2: Tarjeta sin dueDate
**Dado** una tarjeta sin `dueDate` y sin `paidAt`, con `totalAmount` = $100.000
**Cuando** se calculan los totales
**Entonces** su estado efectivo es `pending` y los $100.000 se suman al total pendiente

### UC-E3: Gasto sin dueDate
**Dado** un gasto general sin `dueDate` y sin `paidAt`
**Cuando** se calculan los totales
**Entonces** su estado efectivo es `pending` y su monto se suma al total pendiente

### UC-E4: Solo gastos vencidos
**Dado** un mes activo donde todos los gastos sin pagar tienen `dueDate` en el pasado
**Cuando** se calculan los totales
**Entonces** el total pagado es $0 y el total pendiente incluye todos esos vencidos

### UC-E5: Actualización reactiva al pagar un gasto
**Dado** un gasto pendiente de $5.000 visible en los totales
**Cuando** el usuario lo marca como pagado (se setea `paidAt`)
**Entonces** los totales se actualizan sin recargar: pagado +$5.000, pendiente −$5.000, balance total sin cambio

### UC-E6: Cambio de mes activo
**Dado** la sección de totales mostrando los valores del mes actual
**Cuando** el usuario navega a otro mes en el MonthRail
**Entonces** los totales se recalculan con los datos del nuevo mes activo

## Escenarios de gaps resueltos

### UC-G1: Los movimientos nunca se suman (gap 1)
**Dado** una tarjeta con `totalAmount` = $150.000 y 3 movimientos que suman $145.000
**Cuando** se calculan los totales
**Entonces** se suma $150.000 (el `totalAmount`) y los movimientos aportan $0 — sin doble conteo

### UC-G2: Totales viven en la feature de expenses (gap 2)
**Dado** la sección de totales implementada
**Cuando** se busca su ubicación en el código
**Entonces** vive en `src/features/expenses/` (componente + utils), consumiendo los datos de tarjetas vía la query pública de `credit-cards`

### UC-G3: Cálculo en cliente reusando queries existentes (gap 3)
**Dado** el dashboard renderizado
**Cuando** se calculan los totales
**Entonces** un hook de cliente reusa las queries existentes de Convex (gastos por mes + tarjeta con movimientos) y el cálculo se hace con utils puras testeables — sin query nueva de agregación en Convex
