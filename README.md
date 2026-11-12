# juliangdeveloper.github.io

Juegos y herramientas que se abren en el navegador, sin instalar.

**[Abrir el portafolio](https://juliangdeveloper.github.io/)**

<img src="img/portafolio.png?v=24" alt="Portafolio en el celular con las tarjetas de los 14 proyectos en Planeación" width="320">

## Cómo se usa

- Toca una tarjeta para ver el detalle. El botón abre la app a pantalla completa, con **Inicio** para volver.
- **＋ Agregar proyecto** acepta `usuario.github.io/repo`, `github.com/usuario/repo` o `usuario/repo`.
- **✕** deja de seguir un proyecto y se puede deshacer. **Restaurar proyectos por defecto** devuelve los de fábrica y conserva los que agregaste. El proyecto fijo se queda y no tiene ✕.
- La lista queda en este navegador. En el celular y en la tablet la pantalla no se desplaza.
- La fase, el estado y el objetivo salen de `meta.v1.<app>`. Basta con `proyecto.fase` de 1 a 7; si `v` o `slug` vienen, deben ser `1` y el slug de la app. Lo que falte toma un valor por defecto y lo inválido se ignora.
- Una app sin meta, o con una meta ilegible, queda en **Planeación**. Al tocarla aparece **Falta información** con **Copiar prompt** (las instrucciones para que la app escriba su meta) y **Ya lo hice** (abre la app). Las apps con meta válida se abren directo.
- En **Ajustes**, **Mazmorra** empieza apagada. Cada proyecto es un objeto en la sala de su fase. Definición y Diseño comparten sala. Una sala sin proyectos no se muestra.
- Toca el nivel (Ceniza, Brasa, Llama, Forja o Faro) para ver cuántos lanzamientos pide y cuánto falta para el siguiente.
- Cada sala muestra todos sus proyectos y crece cuando no caben.
- **Trono** suma las habilidades de `proyecto.aportes`: `{ "stat": "Programación", "exp": 5, "fuente": "creacion" }`, con `exp` de 1 a 99 y `fuente` `creacion` o `uso`. También acepta el formato viejo `{ id, aporte, fuente }`. El nombre se muestra tal cual y los nombres idénticos suman su EXP. La lista muestra todas las habilidades y se desvanece abajo cuando hay más por ver. Toca una habilidad para ver qué app la sube, cuánto y si es por creación o por uso. Si `proyecto.bloqueada` es `true`, el objeto se ve bloqueado.

## Stack

HTML, CSS y JavaScript, sin build. Los datos quedan en `localStorage`.

Versión actual: `24`.

## Licencia

MIT
