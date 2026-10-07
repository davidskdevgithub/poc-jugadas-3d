# Stack: PoC visualización 3D de jugadas

- **Build:** Vite 8 + React 19 + TypeScript (SPA, sin SSR)
- **3D:** three (estable reciente) + @react-three/fiber v9 + @react-three/drei v10
- **Estado:** zustand, un store por feature (tiempo de reproducción en `playback/`; modo de vista y jugadora seleccionada en `camera/`)
- **Estilos:** Tailwind CSS v4 (@tailwindcss/vite) + clsx + tailwind-merge (para `cn()` en `src/lib/`)
- **Linting/Formato:** OxLint
- **Testing:** Vitest (solo utilidades puras: interpolación, presets de cámara, límites de ventana). La escena 3D se verifica en browser real, manualmente — un agente de IA levanta el browser y ejecuta los escenarios; sin e2e automatizado en la PoC
- **Datos:** jugada como valor TS tipado (schema en `scene/scene-types.ts`), sin validación en runtime
- **Hosting:** estático (sin backend, sin auth, sin DB)

## Decisiones
- Vite y no Next 16: la PoC valida hipótesis de producto, no integración.
  La validación Next+R3F se hace como spike de 1 día en el repo destino
  antes de migrar.
- Código portable-first: tipos, interpolación y lógica de cámara viven en
  módulos sin dependencia del framework → migrables al repo Next.
- fiber v9, NO v10 (alpha).
- React Compiler: activado — viene en el template de Vite (`babel-plugin-react-compiler` + `@rolldown/plugin-babel` en vite.config). Se conserva: auto-memoiza el árbol React y es orthogonal al render loop, que lee el store con `getState()` dentro de `useFrame`.

## Stack del repo destino (referencia)
- Next.js 16 + React 19.2, Tailwind v4, Biome, Vitest
- Pendiente: spike de integración R3F en Next 16 (componentCache/Link,
  ssr:false boundaries, ThreeElements types)