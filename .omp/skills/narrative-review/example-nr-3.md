# Review: totales

## Resumen (10 segundos)
- **Qué describe:** Sección de totales del dashboard (Pagado / Pendiente / Balance Total) calculados en runtime, sin persistir en DB
- **Estado:** completa — gaps resueltos

## Definido por el usuario ✅
- Tres valores: **Pagado**, **Pendiente (con vencidos)**, **Balance Total** = pagado + pendiente
- Todo valor **calculado**, nada guardado en DB (coherente con el modelo derivado existente)
- **No sumar movimientos + total de tarjeta** (evitar doble conteo)
- HTML de referencia de Stitch con estructura, íconos (`check_circle`, `warning`) y estilos
- Alcance: mes activo

## Inferido por la IA ⚡
- Status efectivo: reutilizar `getEffectiveStatus` (`paidAt` almacenado, pending/overdue derivado de `dueDate`) — ya existe para gastos y `CardStatus` es el mismo tipo
- Formato de moneda: reutilizar `formatAmount` de `expenses/utils`
- Tarjeta inexistente o sin `dueDate` → contribuye $0 pagado / su total a pendiente (mismo modelo derivado)
- Label "Pendiente (con vencidos)" y tokens visuales salen del HTML de referencia

## Gaps a resolver ❓

### 1. ¿Qué valor se suma por tarjeta: `totalAmount` o la suma de movimientos?
**Qué falta:** la narrativa dice que los movimientos son "un desglose" del total de la tarjeta y que hay que evitar dobles. Pero no dice cuál de los dos es la fuente para el total. El glosario dice "movimientos de tarjetas cuya tarjeta contenedora tiene estado paid", pero `totalAmount` es el total manual del resumen (UC-G3) y puede no coincidir con la suma de movimientos.
**Por qué importa:** define el número principal del dashboard.
**Opciones:**
  - A) Usar `card.totalAmount` (el valor real del resumen; movimientos son solo desglose visual)
  - B) Sumar los movimientos visibles del mes
**Sugerencia:** A — `totalAmount` es el hecho almacenado del resumen; sumar movimientos puede divergir del resumen real de la tarjeta.
**Respuesta:** A) — `card.totalAmount`. Los movimientos son desglose visual, nunca se suman para totales.

### 2. ¿Dónde vive el componente de totales?
**Qué falta:** los totales son cross-feature (consumen gastos + tarjetas). No encaja en `expenses` ni en `credit-cards`.
**Por qué importa:** architecture.md exige colocation por feature; meterlo en una de las dos rompería la pertenencia.
**Opciones:**
  - A) Nueva feature `src/features/dashboard/` con `components/totales-bar.tsx` + `utils/` propios
  - B) Componente suelto en `src/app/dashboard/`
  - C) Dentro de `src/features/expenses/`
**Sugerencia:** A — es dominio del dashboard, consume ambas features vía sus barrels públicos.
**Respuesta:** C) — en `src/features/expenses/`. El usuario decide mantenerlo ahí (los gastos generales son la base del balance y la tarjeta es un agregado más).

### 3. ¿Dónde se calculan los totales: cliente o Convex?
**Qué falta:** `page.tsx` es Client Component y cada panel hace su propia query. Los totales necesitan ambos datasets.
**Por qué importa:** define si agregamos una query nueva en Convex o calculamos en cliente.
**Opciones:**
  - A) Hook `useMonthlyTotals(month, year)` que reusa las queries existentes (`expenses` por mes + `getCardWithMovements`) y calcula con utils puras testeables
  - B) Nueva query de Convex que agrega todo server-side
**Sugerencia:** A — Convex deduplica y cachea queries reactivas en el cliente, el modelo derivado ya vive en render, y las utils puras son testables (coherente con `getEffectiveStatus`).
**Respuesta:** A) — hook en cliente reusando las queries existentes, cálculo con utils puras testeables.
