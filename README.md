# juliangdeveloper.github.io

Portafolio estático de juegos y herramientas que corren en el navegador: [https://juliangdeveloper.github.io/](https://juliangdeveloper.github.io/)

- `index.html` y `styles.css`, sin frameworks ni build.
- `app/`: visor que abre cada app en un iframe a pantalla completa con un botón de inicio al pie (`/app/?app=<slug>`). Solo acepta las apps del portafolio y las agregadas desde el mismo sitio, y no se indexa.
- `portafolio.js`: la lista de proyectos vive en `localStorage` (`portafolio.v1.proyectos`) y arranca con los proyectos de `index.html`. «＋ Agregar proyecto» acepta una URL de GitHub Pages (`usuario.github.io/repo`), una de `github.com/usuario/repo` o `usuario/repo`, y arma la tarjeta con el título, la descripción y la imagen `og:image` (o el ícono) de esa página. ✕ deja de seguir un proyecto, con opción de deshacer, y el pie tiene «Restaurar proyectos por defecto».
- `proyecto.js`: cuando ya abriste una app, su tarjeta muestra la fase, el estado y el objetivo del proyecto, leídos de `localStorage` (`meta.v1.<slug>`). Solo lee; si no hay datos válidos la tarjeta queda igual.
- SEO: title, meta description, canonical, Open Graph, `twitter:card`, `sitemap.xml` y `robots.txt`.
- Las capturas de `img/` salen de cada proyecto en vivo.

Para verlo en local: `python3 -m http.server 8000` y abrir http://localhost:8000

Hecho con ❤️ y 🎮
