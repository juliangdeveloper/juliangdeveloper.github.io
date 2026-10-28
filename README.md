# juliangdeveloper.github.io

Portafolio estático de juegos y herramientas que corren en el navegador: [https://juliangdeveloper.github.io/](https://juliangdeveloper.github.io/)

- `index.html` y `styles.css`, sin frameworks ni build.
- `app/`: visor que abre cada app en un iframe a pantalla completa con un botón de inicio al pie (`/app/?app=<slug>`). Solo acepta las apps del portafolio y las agregadas desde el mismo sitio, y no se indexa.
- `portafolio.js`: la lista de proyectos vive en `localStorage` (`portafolio.v1.proyectos`) y arranca con los proyectos de `index.html`. «＋ Agregar proyecto» acepta una URL de GitHub Pages (`usuario.github.io/repo`), una de `github.com/usuario/repo` o `usuario/repo`, y arma la tarjeta con el título, la descripción y la imagen `og:image` (o el ícono) de esa página. ✕ deja de seguir un proyecto, con opción de deshacer. «Restaurar proyectos por defecto» devuelve los de fábrica y conserva los que agregaste a mano.
- `proyecto.js`: cuando ya abriste una app, su tarjeta muestra la fase, el estado y el objetivo del proyecto, leídos de `localStorage` (`meta.v1.<slug>`). Solo lee; si no hay datos válidos la tarjeta queda igual. Las tarjetas se agrupan por fase (Idea, Definición, Diseño, Construcción, Validación, Lanzamiento y, si aplica, Descartada). En pausa (`fase_estado` 2) la tarjeta cambia de color y mantiene el mismo tamaño.
- `vistas.js`: elige la vista según el ancho (≤519, 520–899, 900–1199, ≥1200 px) y abre el detalle al tocar una tarjeta. Entre 520 y 899 px los proyectos van en grilla. En ≤519 px todos caben en la pantalla sin scroll: las tarjetas se achican y, al llegar a su mínimo, pasan a solo ícono y después a un punto que sigue achicándose.
- SEO: title, meta description, canonical, Open Graph, `twitter:card`, `sitemap.xml` y `robots.txt`.
- Las capturas de `img/` salen de cada proyecto en vivo.

Para verlo en local: `python3 -m http.server 8000` y abrir http://localhost:8000

Hecho con ❤️ y 🎮
