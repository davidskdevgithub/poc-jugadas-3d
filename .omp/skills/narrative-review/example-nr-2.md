# Review: month-rail

## Resumen (10 segundos)
- **Qué describe:** `MonthRail` — navegación de meses en el header, 5 meses visibles, mes activo resaltado con barra accent
- **Estado:** completa — todos los gaps resueltos

## Definido por el usuario ✅
- Muestra 5 meses centrados con flechas prev/next (`chevron_left` / `chevron_right`)
- Mes activo: texto blanco, `font-extrabold`, barra inferior `bg-primary` redondeada arriba
- Meses inactivos: `text-slate-500`, hover → `text-primary`
- Al seleccionar Diciembre, los meses posteriores se ven "vacíos" (año selector postergado)
- HTML de referencia completo incluido
- Va en el header → visible siempre

## Inferido por la IA ⚡
- Formato de mes: abreviaturas en español ("Ago", "Sep", "OCT"...) — el HTML ya lo define
- Tests: `*.test.tsx` al lado del componente (Decisión F de architecture.md)
- El mes activo alimenta `ExpensesPanel`, `CreditCardsPanel` y `TotalesBar` (hoy hardcodeado a `new Date()` en `page.tsx`)
- El header vive en `src/app/dashboard/layout.tsx` — el MonthRail se renderiza ahí

## Gaps resueltos ❓✅

### 1. ¿Dónde vive el estado del mes activo?
**Qué falta:** hoy `page.tsx` calcula `month`/`year` con `new Date()` y el header es `layout.tsx`. El `MonthRail` (header) y los paneles (page) necesitan compartir el mes seleccionado.
**Por qué importa:** sin esto, cambiar de mes no actualiza los paneles.
**Opciones:**
- A) Context provider `ActiveMonthProvider` (patrón igual a `DashboardModeProvider`)
- B) URL search params (`?month=10&year=2026`)
**Sugerencia:** A) — sigue el patrón existente del proyecto y evita re-render de toda la ruta
**Respuesta:** **B) URL search params** — el mes activo vive en la URL (`?month=10&year=2026`). Los paneles y el MonthRail leen/escriben vía `useSearchParams` / `router.push`. Ventaja: el estado es compartible y sobrevive navegación.

### 2. ¿Dónde vive el componente MonthRail?
**Qué falta:** la narrativa no dice la ubicación. `ModeSwitch` vive en `src/app/dashboard/`, pero architecture.md dice que features con nombre de negocio van a `src/features/`.
**Opciones:**
- A) `src/features/month-rail/` (feature propia, según architecture.md)
- B) `src/app/dashboard/month-rail.tsx` (junto a `mode-switch.tsx`, precedencia existente)
**Sugerencia:** B) — es parte del header del dashboard, igual que ModeSwitch
**Respuesta:** **A) `src/features/month-rail/`** — feature propia según architecture.md. Estructura: `month-rail-types.ts`, `components/month-rail.tsx`, `utils/` (lógica de ventana de meses), `index.ts`.

### 3. ¿Qué hacen las flechas prev/next?
**Qué falta:** ambigüedad — ¿mueven la ventana de 5 meses o seleccionan el mes anterior/siguiente?
**Por qué importa:** cambia el comportamiento central del rail.
**Opciones:**
- A) Mueven la ventana: el mes activo no cambia, solo se desplaza qué meses se ven
- B) Seleccionan el mes adyacente al activo (y la ventana se recentra en él)
**Sugerencia:** B) — es el comportamiento esperado en apps de finanzas
**Respuesta:** **B) Seleccionan el mes adyacente** — prev va al mes anterior al activo, next al siguiente. La ventana de 5 meses se recentra en el nuevo mes activo. No existe "ventana desacoplada del activo".

### 4. ¿Los meses "vacíos" (futuros sin datos) son clickeables?
**Qué falta:** la narrativa dice que se ven "vacíos" pero no dice qué pasa al seleccionarlos.
**Opciones:**
- A) Clickeables — los paneles muestran su empty state y se pueden crear gastos en meses futuros
- B) Clickeables pero deshabilitados visualmente (no se puede planificar adelante)
**Sugerencia:** A) — permite registrar gastos futuros
**Respuesta:** **B) Deshabilitados** — los meses posteriores al mes actual real se renderizan pero no son clickeables (sin hover, cursor default, visualmente apagados). No se puede planificar adelante. Esto define "vacío": mes futuro respecto de la fecha real, no mes sin datos.

> **Actualizado 2026-09-03 (post e2e):** overturned por el usuario — la app funciona como planificador (cuotas de tarjeta y estimaciones generan datos en meses futuros), así que los meses futuros son clickeables y la flecha next navega hasta Diciembre. Ver UC-G4, UC-G5 y UC-G6 actualizados en `03-use-cases.md`.

### 5. ¿Hay límites de navegación?
**Qué falta:** ¿se puede retroceder indefinidamente (2024, 2023...)? ¿Hay mes máximo?
**Opciones:**
- A) Sin límites por ahora (año selector postergado)
- B) Límite: no retroceder más allá de X meses
**Sugerencia:** A) — simple, y el selector de año ya está en el radar
**Respuesta:** **Limitado al año actual** — en una primera instancia el rail solo lista los meses del año en curso (Ene–Dic). No hay navegación hacia años anteriores. Cuando el usuario llegue a Diciembre se disparará la feature de selector de años, que habilitará la navegación entre años. Hacia adelante el límite es el mes actual real (por gap 4).

### 6. ¿El mes seleccionado persiste al recargar?
**Qué falta:** si el usuario está en Julio y recarga, ¿vuelve al mes actual?
**Opciones:**
- A) No persiste — siempre arranca en el mes actual
- B) Persiste en URL (se conecta con el gap 1 opción B)
**Sugerencia:** A) — coherente con la opción A del gap 1
**Respuesta:** **B) Persiste en URL** — coherente con la decisión del gap 1. Al recargar, la URL mantiene `?month=&year=` y el dashboard arranca en ese mes. Sin params en la URL → default al mes actual real.

## Decisiones consolidadas

| # | Decisión | Elección |
|---|---|---|
| 1 | Estado del mes activo | URL search params (`?month=&year=`) |
| 2 | Ubicación del componente | `src/features/month-rail/` |
| 3 | Flechas prev/next | Seleccionan mes adyacente, ventana se recentra |
| 4 | Meses futuros | Clickeables (planificador) — actualizado post e2e 2026-09-03 |
| 5 | Límites de navegación | Solo meses del año actual; selector de años como feature futura al llegar a Diciembre |
| 6 | Persistencia | Persiste en URL; default al mes actual real |