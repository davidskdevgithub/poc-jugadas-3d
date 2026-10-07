# Review: expense-card

## Resumen (10 segundos)
- **Qué describe:** ExpenseCard — componente de gasto general del panel izquierdo (modo visibilidad)
- **Estado:** Completa — 5 gaps identificados, todos resueltos

## Definido por el usuario ✅
- Regla: status `paid` → "PAGADO EL DD/MM", ícono `calendar_today`
- Regla: status `overdue` → "VENCIÓ EL DD/MM", ícono `error`
- Regla: status `pending` → "VENCE EN X DÍAS", ícono `schedule`
- Regla: pending ≥5 días → amber, <5 días → orange
- Código: `getCategoryColor(index, total)` — función completa con paleta HSL
- HTML de referencia: estructura completa con 4 status y barra lateral
- Formato de monto: int → "$1.500.400" (resuelto en `format-amount.ts`)
- Props: datos vienen de Convex (tipo `Expense`)

## Inferido por la IA ⚡
- Ubicación: `src/features/expenses/components/expense-card.tsx` (ya existe)
- Tipo: `Expense` de `expenses-types.ts` (ya definido)
- Barrel export: `src/features/expenses/index.ts`

## Gaps a resolver ❓

### 1. Mensaje de pending: "VENCE EN X DÍAS" vs "VENCE EL {dueDate}"
**Qué falta:** El componente actual muestra `VENCE EL {expense.dueDate}` (fecha cruda). La narrativa dice "VENCE EN ... dias" con la cantidad de días restantes.
**Por qué importa:** El usuario espera ver "VENCE EN 10 DÍAS", no una fecha estática.
**Opciones:**
- A) Crear utilidad `getDaysUntilDue(dueDate)` en `utils/` que retorne días restantes
- B) Calcular inline en el componente
**Sugerencia:** A) — separar la lógica en utils facilita tests y reutilización
**Respuesta:** A) — crear utilidad separada `getDaysUntilDue()` en utils/

### 2. Color condicional para pending (amber ≥5 días, orange <5 días)
**Qué falta:** `getStatusColor()` solo retorna amber para todos los pending.
**Por qué importa:** Los 4 ejemplos de HTML de la narrativa muestran amber para ≥5 días y orange para <5 días.
**Opciones:**
- A) Agregar parámetro opcional `daysRemaining` a `getStatusColor`
- B) Crear función separada `getPendingColor(daysRemaining)`
**Sugerencia:** A) — es backward-compatible y mantiene todo en un solo lugar
**Respuesta:** A) — agregar parámetro opcional `daysRemaining` a `getStatusColor()`

### 3. Íconos de Material Symbols ausentes
**Qué falta:** La narrativa incluye íconos explícitamente: `description` (nota), `calendar_today` (paid), `schedule` (pending), `error` (overdue). El componente actual no renderiza ninguno.
**Por qué importa:** Son parte explícita del diseño de referencia.
**Opciones:**
- A) Implementar íconos ahora con `material-symbols-outlined`
- B) Postergar a una pass visual posterior
**Sugerencia:** A) — la narrativa los incluye y son parte del diseño
**Respuesta:** A) — implementar íconos ahora

### 4. Tokens tipográficos: arbitrary values vs tokens del proyecto
**Qué falta:** El HTML de Stitch usa `text-[9px]`, `text-[10px]`, `text-[11px]`. Las convenciones del repo dicen "NUNCA usar text-[9px], text-[10px], text-[11px] en features".
**Por qué importa:** Consistencia en todo el proyecto.
**Opciones:**
- A) Mapear: `text-[9px]` → `text-micro`, `text-[10px]` → `text-mini`, `text-[11px]` → `text-caption`
- B) Ignorar por ahora y alinear en refactor posterior
**Sugerencia:** A) — la narrativa dice "seguir los lineamientos de la aplicacion"
**Respuesta:** A) — usar tokens para mantener consistencia

### 5. Estructura del card: overflow-hidden + barra absoluta vs flex
**Qué falta:** El HTML de referencia tiene `overflow-hidden` en el card y la barra lateral posicionada con `absolute` y `w-1` (4px). El componente actual usa flex sin overflow-hidden y la barra es un flex child con `w-px` (1px).
**Por qué importa:** La posición absoluta + overflow-hidden crea un efecto visual donde la barra se recorta con el border-radius del card.
**Opciones:**
- A) Alinear con la narrativa: `overflow-hidden` + `absolute` + `w-1` (4px)
- B) Mantener el diseño actual (flex, `w-px`)
**Sugerencia:** A) — la narrativa es explícita en el HTML y el efecto visual es diferente
**Respuesta:** A) — alinear con la narrativa

### 6. Color de barra lateral: getCategoryColor vs categoryColor de DB
**Qué falta:** La implementación actual usa `expense.categoryColor` de la DB. La narrativa define `getCategoryColor(index, total)` que calcula el color según posición en la lista.
**Por qué importa:** El color debe ser dinámico según la posición, no estático de la DB. Esto además alimenta la Progress Bar (Feature 4).
**Opciones:**
- A) Usar `getCategoryColor(index, total)` — el componente necesita props `index` y `total`
- B) Mantener `expense.categoryColor` de la DB
**Sugerencia:** A) — la narrativa es explícita en la función y el color debe ser dinámico
**Respuesta:** A) — usar `getCategoryColor(index, total)`, agregar props `index` y `total` al componente, crear `get-category-color.ts` en utils/

## Notas de implementación
- `getStatusColor` firma nueva: `getStatusColor(status, daysRemaining?: number)`
- `getDaysUntilDue` retorna número entero de días, se usa para mensaje Y para color condicional
- `getCategoryColor(index, total)` — crear en `utils/get-category-color.ts`, usar en ExpenseCard Y en ProgressBar (Feature 4)
- ExpenseCard necesita props `index: number` y `total: number` para calcular el color
- Íconos: `<span class="material-symbols-outlined text-mini">icon_name</span>` (text-mini = 10px)
- Barra: `<div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor }} />` con `overflow-hidden` en el card
