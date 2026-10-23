# juliangdeveloper.github.io

Portafolio estático de juegos y herramientas que corren en el navegador: [https://juliangdeveloper.github.io/](https://juliangdeveloper.github.io/)

- `index.html` y `styles.css`, sin frameworks ni build.
- `app/`: visor que abre cada app en un iframe a pantalla completa con un botón de inicio al pie (`/app/?app=<slug>`). Solo acepta las apps del portafolio y no se indexa.
- `proyecto.js`: cuando ya abriste una app, su tarjeta muestra la fase, el estado y el objetivo del proyecto, leídos de `localStorage` (`meta.v1.<slug>`). Solo lee; si no hay datos válidos la tarjeta queda igual.
- SEO: title, meta description, canonical, Open Graph, `twitter:card`, `sitemap.xml` y `robots.txt`.
- Las capturas de `img/` salen de cada proyecto en vivo.

Para verlo en local: `python3 -m http.server 8000` y abrir http://localhost:8000

Hecho con ❤️ y 🎮
