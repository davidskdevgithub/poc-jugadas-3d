# Checklist: expense-card

**Casos de uso fuente:** `src/features/expense-card/docs/03-use-cases.md`
**Review fuente:** `src/features/expense-card/docs/02-review.md`
**Fecha:** 2026-08-02

---

## Pendiente
- [ ] Status pill con metadata temporal (paid → PAGADO/emerald, pending → PENDIENTE/amber|orange, overdue → VENCIDO/red) — UC-01 a UC-04
- [ ] Mensaje temporal: "PAGADO EL DD/MM", "VENCE EN X DÍAS", "VENCIÓ EL DD/MM" — UC-01 a UC-04, UC-G1
- [ ] Íconos Material Symbols: `calendar_today` (paid), `schedule` (pending), `error` (overdue), `description` (note) — UC-G4
- [ ] Barra lateral con color calculado por posición en la lista (HSL palette) — UC-05, UC-E5, UC-E6
- [ ] Monto formateado en ARS con punto separador de miles — UC-06
- [ ] Nota con ícono `description` y texto uppercase caption — UC-07, UC-E1
- [ ] Utilidad `getDaysUntilDue(dueDate)` retorna entero de días — UC-G7, UC-G8
- [ ] `getStatusColor()` actualizado: parámetro opcional `daysRemaining` (≥5 → amber, <5 → orange) — UC-G2, UC-G3, UC-G9, UC-G10
- [ ] Tokens tipográficos del proyecto: `text-micro` (pills), `text-mini` (íconos), `text-caption` (nota) — UC-G5
- [ ] Estructura card: `overflow-hidden` + barra con `absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl` — UC-G6
- [ ] Edge cases: nombre largo truncado con ellipsis, monto cero, monto extremo — UC-E2 a UC-E4


## Hecho
- (nada)