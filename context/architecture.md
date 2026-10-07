# Arquitectura — poc-jugadas-3d

## Estado
Borrador — Octubre 2026

## Contexto
Arquitectura de carpetas por feature para una SPA de Vite + React 19 +
Three.js (R3F). Módulo patrón por colocation: cada feature se autoabastece
de tipos, componentes, datos y utilidades.

---

## 1. Módulo Patrón (El Plano)

Idéntico en espíritu al de gastos-tracking: cada feature se autoabastece
de tipos, componentes, datos y utilidades.

```text
src/features/{feature}/
├── index.ts                     # Barrel de componentes públicos
├── {feature}-types.ts           # Diccionario Único de Tipos del dominio
├── data/
│   └── {feature}-mock.ts        # Datos estáticos (ej: jugada de prueba)
├── components/
│   ├── {component}.tsx
│   ├── {component}.test.tsx
│   └── {subcomponent}.tsx
└── utils/
    ├── index.ts
    ├── {util}.ts
    └── {util}.test.ts
```

### Estructura global del proyecto

```text
├── public/
├── src/
│   ├── features/
│   │   ├── playback/            # Store de tiempo, play/pausa, scrub
│   │   ├── scene/               # Cancha, jugadoras, pelota, interpolación
│   │   ├── camera/              # Cámara libre + presets de vista
│   │   └── timeline-ui/         # Línea de tiempo y controles 2D
│   ├── ui/                      # Componentes genéricos sin dominio
│   ├── lib/                     # Infraestructura global sin dominio
│   │   └── cn.ts
│   ├── App.tsx                  # Composición: Canvas + overlay de UI
│   └── main.tsx
└── vite.config.ts
```

Los `{component}.test.tsx` del árbol aplican solo a UI 2D; los
componentes R3F no llevan test de componente (Decisión F).

**Composición:** `App.tsx` monta el `<Canvas>` de R3F y el overlay de UI
2D. Es la única pieza que conoce ambas capas. Las features se importan
entre sí únicamente por los entry points oficiales (Decisión H) — los
interns (`components/`, `data/`) no se consumen desde afuera.

`scene/` es dueña del modelo de la jugada (`scene-types.ts`,
`utils/interpolate.ts`); playback, camera y timeline-ui lo consumen por
esos entry points.

### Regla de pertenencia

| Vive en... | Qué contiene | Por qué |
| :--- | :--- | :--- |
| `src/features/{feature}/` | Tipos, componentes, datos, utilidades de negocio | Si tiene nombre de negocio, va acá |
| `src/ui/` | Componentes genéricos sin dominio | Reusables entre features |
| `src/lib/` | `cn()` y utilidades puras globales | Infraestructura. Sin dominio, sin estado |

---

## 2. Decisiones de Arquitectura

### Decisión A: Convención de Nombres
`kebab-case` en archivos, `PascalCase` en
componentes y tipos, `camelCase` en funciones y variables.

### Decisión B: Diccionario Único de Tipos
`{feature}-types.ts` como única fuente de verdad, flujo unidireccional
(sin imports de subcarpetas hacia arriba), tipos de props dentro del `.tsx`.

### Decisión C: Core portable-first (framework-agnostic)
La lógica que sobrevive a la PoC vive en módulos puros de TypeScript, sin
imports de react, three ni r3f:
- `scene/scene-types.ts` — modelo de la jugada (`Play`, `Keyframe`)
- `scene/utils/interpolate.ts` — `getPositionsAtTime(play, t)`
- `camera/utils/presets.ts` — cálculo de posiciones de cámara

`scene/` es dueña del modelo de la jugada; las demás features lo consumen
por los entry points oficiales (Decisión H).

**Por qué:** la migración al repo destino (Next 16) debe poder copiar estos
archivos tal cual. Si un util necesita three, se justifica en comentario.
Los componentes R3F son la cáscara; la lógica es el contenido.

### Decisión D: Estado global — zustand con suscripción por selector
Un store de zustand por feature. El tiempo de reproducción (`currentTime`,
`playing`) vive en el store de la feature `playback/`; el modo de vista y
la jugadora seleccionada (`viewMode`, `selectedPlayerId`) viven en el
store de `camera/`.

- La UI 2D y la escena 3D consumen por selectores: `usePlayback(s =>
  s.currentTime)` — nunca desestructurando el store completo.
- La escena NUNCA re-renderiza React por frame: los valores que cambian
  por frame se leen dentro de `useFrame` vía `getState()` o con
  suscripciones de zustand, no con hooks reactivos.

**Por qué:** un `setState` por frame re-renderiza el árbol de React 60
veces por segundo. El objetivo de rendimiento de la PoC es que el render
loop sea la única cosa que corre por frame.

### Decisión E: R3F declarativo, three imperativo como excepción
- Todo lo expresable como JSX declarativo de R3F/drei, va así.
- `useFrame` es el único lugar autorizado para mutar objetos three por
  frame (posiciones, cámara).
- Accesos imperativos al scene graph fuera de `useFrame` (refs salteadas,
  `scene.getObjectByName` en handlers) requieren justificación en
  comentario — son la fuente clásica de bugs de sincronización.

### Decisión F: Tests
Al lado del archivo, Vitest, cobertura de comportamiento. En esta PoC:
- `*.test.ts` — la mayoría: interpolación, presets de cámara, límites
  de la ventana de tiempo.
- `*.test.tsx` — solo para la UI 2D (timeline, controles).
- Los componentes R3F no se testean con render — su comportamiento se
  verifica en browser real, manualmente: un agente de IA levanta el
  browser y ejecuta los escenarios. Mockear el canvas es construir un
  test que verifica el mock.

### Decisión G: Datos de la jugada
La jugada vive como valor TS tipado en `scene/data/play-mock.ts`,
tipado con `Play` de `scene-types.ts`. No hay backend, no hay fetch,
no hay validación en runtime (sin zod): el mock es un valor TS y el
compilador es el chequeo — si en el repo destino llegan JSON externos,
la validación se agrega ahí. Este contrato de tipos es lo que migrará
primero.

### Decisión H: Alias de imports
```ts
// vite.config.ts
resolve: {
  alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
}
```

Y su espejo en TS:

```jsonc
// tsconfig.app.json
"paths": { "@/*": ["./src/*"] }
```

Entry points oficiales por feature — lo único que se consume desde
otras features:
- `@/features/{feature}` — barrel `index.ts` (componentes públicos)
- `@/features/{feature}/{feature}-types` — diccionario de tipos
- `@/features/{feature}/utils` — `utils/index.ts`

---

## 3. Cheatsheet de Decisiones Rápidas

| Si quiero crear... | ¿Dónde? | ¿Cómo lo nombro? |
| :--- | :--- | :--- |
| Componente R3F (dentro del Canvas) | `features/scene/components/` | `kebab-case.tsx` |
| Componente UI 2D (overlay) | `features/timeline-ui/components/` o `src/ui/` | `kebab-case.tsx` |
| Utilidad de interpolación / cámara | `features/{f}/utils/` | `kebab-case.ts` |
| Tipo de dominio (Keyframe, Play) | `{feature}-types.ts` | `PascalCase` |
| Jugada de prueba | `scene/data/play-mock.ts` | `kebab-case.ts` |
| Test | Al lado del archivo | `{nombre}.test.{ts\|tsx}` |
| Valor leído por frame | Dentro de `useFrame` con `getState()` | — |

---

## 4. Anti-Patterns

| Anti-Pattern | Por qué no | En su lugar |
| :--- | :--- | :--- |
| `setState` / hook reactivo del store dentro del render loop | Re-render de React 60fps | `getState()` o suscripción dentro de `useFrame` |
| Lógica de interpolación inline en componentes | No es testeable ni portable | `scene/utils/interpolate.ts` (Decisión C) |
| `new THREE.*` en el cuerpo del componente | Se recrea en cada render, leak de geometrías | Memoizar o dejar que R3F lo gestione declarativamente |
| Acceso imperativo al scene graph en handlers | Desincroniza con el árbol declarativo | Refs + `useFrame` (Decisión E) |
| Módulos three/react dentro de `scene-types.ts` o utils puros | Rompe la portabilidad al repo destino | Tipos primitivos, lógica sin imports (Decisión C) |
| Importar internals de otra feature (`components/`, `data/`) | Acoplamiento oculto | Consumir entry points oficiales (Decisión H); composición en `App.tsx` |
| Carpeta `__tests__/` o mocks de canvas | Rompe colocation / testea el mock | Tests de utils + verificación manual en browser (Decisión F) |