# Verificación E2E: scene (contrato + escena estática)

**Casos de uso fuente:** `src/features/scene/docs/03-use-cases.md`  
**Checklist fuente:** `src/features/scene/docs/04-checklist.md`  
**Entorno de prueba:** `http://localhost:5173/` (Vite dev server)  
**Fecha:** 2026-10-07  
**Estado:** ✅ APROBADO

---

## 1. Resultados por Caso de Uso

### UC-01 & UC-08: Escena estática congelada en t=0
- **Resultado:** **APROBADO**
- **Observación:** La escena se monta leyendo `currentTime = 0` y `playing = false` desde el store de playback. Sin interacción ni avance de tiempo, todas las entidades permanecen estáticas en las posiciones iniciales del `playMock`.

### UC-02 & UC-G3: Cancha fútbol 8 con líneas y contraste resuelto
- **Resultado:** **APROBADO**
- **Observación:**
  - Plano de $50 \times 30\,\text{m}$ con material en verde claro/gris verdoso (`#7ca982`).
  - Líneas reglamentarias planas en $y = 0.01$ (sin z-fighting ni elevaciones de vallas): perímetro exterior completo, línea media, círculo central ($r = 6\,\text{m}$), áreas penales ($12 \times 20\,\text{m}$) y puntos penal ($9\,\text{m}$ de los arcos).
  - El contraste entre el césped verde claro y las jugadoras propias (verde bosque oscuro `#14532d`) es nítido y legible.

### UC-03, UC-G4 & UC-E4: 16 Jugadoras con dorsales billboardeados
- **Resultado:** **APROBADO**
- **Observación:**
  - 16 entidades en total: 8 del equipo propio (`#14532d`) y 8 rivales (`#f5f5f5`).
  - Cada una representada como cilindro bajo ($r = 0.5\,\text{m}$, $h = 1.2\,\text{m}$).
  - Números dorsales del 1 al 8 orientados a la cámara (billboard) utilizando la fuente WOFF local (`/fonts/roboto-regular.woff`), con texto blanco para propias y oscuro para rivales.
  - Arqueras identificadas con el número 1 y el mismo color de camiseta que su equipo.

### UC-04: Pelota 3D en posición t=0
- **Resultado:** **APROBADO**
- **Observación:** Esfera blanca ($r = 0.35\,\text{m}$) posicionada en $(-2.5, 0.35, 0.5)$, apoyada sobre la superficie junto a la jugadora #7.

### UC-G6: Encuadre completo con cámara oblicua inicial
- **Resultado:** **APROBADO**
- **Observación:** La cámara provisoria de `App.tsx` (posición `[0, 42, 38]`, FOV 45°) encuadra la totalidad de la cancha ($50 \times 30\,\text{m}$) en el viewport, con márgenes equilibrados sobre el fondo `#10151c`.

---

## 2. Inspección Técnica

- **Errores en consola (`console.error`):** 0
- **Peticiones de red:** 56 peticiones HTTP exitosas (código 200), incluyendo fuente WOFF y assets de Three.js.
- **Tests unitarios:** 4/4 pasando (`vitest run`).
- **Linter & Typecheck:** 0 errores / 0 advertencias (`oxlint`, `tsc -b`).
