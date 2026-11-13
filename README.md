# Socket Cero · versión web (HTML + CSS + JavaScript)

Juego de taller con las 4 placas base más baratas de PcComponentes, convertido desde
React + TypeScript + Tailwind a tecnología web pura: **sin librerías, sin compilación
y sin servidor**.

## Cómo jugar

Abre `index.html` con doble clic en cualquier navegador moderno. Ya está.
(Si prefieres servirlo: `python3 -m http.server` dentro de esta carpeta y visita
`http://localhost:8000`.)

Las tipografías se cargan de Google Fonts si hay conexión; sin conexión se usan
las del sistema y todo sigue funcionando.

## Estructura

```
index.html            página y estructura de secciones
css/styles.css        todos los estilos (sustituye a Tailwind)
img/                  ilustraciones SVG de cada placa, logo y fondo de circuito
js/data.js            fichas técnicas de las 4 placas
js/engine.js          generador de pedidos, duelos y puntuación
js/ui.js              utilidades: almacenamiento, carta de placa, modal, chispas
js/icons.js           iconos SVG de trazo
js/sound.js           sintetizador de efectos con Web Audio API
js/charts.js          radar y barras en <canvas> (sustituye a Chart.js)
js/intro.js           portada
js/taller.js          modo principal: el taller de pedidos
js/duelo.js           segundo modo: duelo de fichas
js/fichas.js          inventario con fichas y vista ampliada
js/comparador.js      radar, barras y tabla comparativa
js/main.js            arranque, menú, ticker y botón de sonido
```

## Controles

- **Taller**: teclas `1`-`4` eligen placa, `R` rechaza el pedido, `P` usa el polímetro,
  `Espacio`/`Enter` empieza o pasa al siguiente pedido.
- **Duelo**: `←` izquierda, `→` derecha, `E` o `↓` empate, `Espacio` empieza.

Los atajos solo actúan en la sección que estás viendo (o en la que has pulsado), así
que el taller y el duelo no se disparan a la vez.

Los récords y la preferencia de sonido se guardan en `localStorage` del navegador.
