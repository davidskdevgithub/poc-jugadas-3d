# Glosario de Dominio: PoC visualización 3D

## Entidades de datos

| Término | Definición |
|---|---|
| **Jugada** (Play) | El dataset completo de una secuencia de juego: metadata (nombre), duración total y la lista de keyframes. Es la unidad que se carga y se reproduce. Se carga manualmente como JSON estático. |
| **Keyframe** | Snapshot de posiciones en un instante `t` de la jugada: la posición de cada jugadora y de la pelota. La posición renderizada en cualquier momento se obtiene interpolando entre el keyframe anterior y el siguiente. |
| **Jugadora** | Entidad representada en la cancha. Tiene posición en el plano y un identificador visual (número). Su posición cambia entre keyframes. *(Pendiente: ¿hay jugadoras rivales / distinción de equipos? — gap para el review)* |
| **Pelota** | Entidad con posición por keyframe. No "pertenece" a ninguna jugadora — la posesión es implícita en la posición. *(Pendiente: ¿tiene altura (y) o vive en el plano? — gap para el review)* |
| **Posición** | Coordenadas sobre la cancha. Para jugadoras: (x, z) en el plano. Para la pelota: por definir (ver gap anterior). |
| **Cancha** | Plano de juego con dimensiones de fútbol 8. Es estática y decorativa — no tiene datos, no cambia. |

## Playback

| Término | Definición |
|---|---|
| **Tiempo actual** (currentTime) | El instante dentro de la jugada que se está visualizando. Es la fuente única del estado de reproducción: de él derivan todas las posiciones renderizadas en cada frame. Vive en el store (zustand). |
| **Duración** | Tiempo total de la jugada. En la PoC: 10–15 segundos. |
| **Reproducción** | Avance continuo del tiempo actual a velocidad 1x, de 0 a duración. Al llegar al final: *(pendiente: ¿loop, stop, o pausa al final? — gap para el review)* |
| **Scrub** | Arrastre manual por la línea de tiempo: salta a cualquier instante `t` de la jugada. |

## Cámara

| Término | Definición |
|---|---|
| **Modo de vista** | Uno de los 3 presets: cenital, oblicua, desde jugadora. |
| **Cámara libre** | Control orbital: rotar y zoom sin preset. Es el modo por defecto. *(Pendiente: ¿qué pasa entre cámara libre y presets — elegir preset resetea, rotar "sale" del preset? — gap para el review)* |
| **Vista cenital** | Cámara perpendicular desde arriba. Ve el plano completo de la cancha. |
| **Vista oblicua** | Cámara elevada con ángulo lateral — la vista clásica de análisis táctico. |
| **Vista desde jugadora** | Cámara posicionada en la ubicación de una jugadora en el instante actual. *(Pendiente: ¿estática en la posición o sigue a la jugadora mientras se reproduce? ¿qué jugadora — selección o fija? — gap para el review)* |

## Interfaz

| Término | Definición |
|---|---|
| **Línea de tiempo** | Barra de scrub con progreso de la jugada. *(Pendiente: ¿marca los keyframes? — gap para el review)* |
| **Controles de playback** | Play/pausa + scrub. La UI 2D que consume el tiempo actual del store. |
| **Representación simple** | Decision de la narrativa: jugadoras y pelota como formas geométricas, sin realismo ni animaciones de personaje. La legibilidad de posición manda sobre el realismo. |

## Personas

| Término | Definición |
|---|---|
| **CT** (cuerpo técnico) | Los usuarios objetivo de la validación: quienes analizan las jugadas y explican situaciones a las jugadoras. No son usuarios técnicos. |

## Postpuestos / excluidos

| Término | Definición |
|---|---|
| **Jugada propuesta** | Copia editable de una jugada para comparar "lo que pasó" vs "lo que proponemos". Fase 2 — si la PoC valida. |
| **Extracción de video** | Generar keyframes automáticamente desde videos reales. Futuro lejano, fuera de alcance. |
| **Edición de posiciones** | Mover jugadoras en la escena. Explícitamente excluido de la PoC — es el scope-creeper más tentador, mantener visible. |