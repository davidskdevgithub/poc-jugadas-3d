### PoC: visualización 3D de jugadas de fútbol 8

La idea es crear una web que permita **reproducir una jugada en una cancha 3D y observarla desde distintos puntos de vista**, para facilitar el análisis táctico del cuerpo técnico y explicar situaciones a las jugadoras.

En esta primera prueba, tendremos **una jugada de 10–15 segundos cargada manualmente**, con representaciones simples de las jugadoras y la pelota. Se podrá:

- Reproducir, pausar y recorrer la jugada.
- Rotar y acercar la cámara.
- Cambiar entre una vista cenital, una oblicua y una vista desde la ubicación de una jugadora.

**El objetivo es validar si esta representación resulta fácil de usar y ayuda a comprender mejor el posicionamiento, los espacios y los errores defensivos.**

La PoC se desarrollará con **Three.js**, sin IA ni procesamiento automático de video. Tampoco incluirá inicialmente edición de posiciones o recomendaciones.

Si la experiencia aporta valor, el siguiente paso será permitir que el CT **mueva jugadoras para mostrar posiciones alternativas**, conservando la jugada original para comparar “lo que pasó” con “lo que proponemos”. Más adelante se evaluará extraer los movimientos automáticamente desde videos reales.